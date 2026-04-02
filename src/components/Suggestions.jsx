import React, { useState } from 'react'
import {
  callClaude,
  buildCabinetContext,
  buildTasteContext,
  SUGGESTION_SYSTEM
} from '../utils/anthropic.js'
import styles from './Suggestions.module.css'

const FLAVOUR_COLORS = {
  sweet: 'gold', sour: 'amber', bitter: 'rouge', smoky: 'amber',
  spicy: 'rouge', herbal: 'gold', fruity: 'amber', floral: 'gold',
  refreshing: 'amber', rich: 'gold', dry: 'amber', strong: 'rouge',
}

export default function Suggestions({ cabinet, ratings, apiKey, onAddReview }) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [prompt, setPrompt] = useState('')
  const [expanded, setExpanded] = useState(null)

  const generate = async () => {
    if (!apiKey) {
      setError('Please add your Anthropic API key in Settings.')
      return
    }
    if (cabinet.length === 0) {
      setError('Add some bottles to your cabinet first.')
      return
    }

    setLoading(true)
    setError('')
    setSuggestions([])
    setExpanded(null)

    try {
      const cabinetCtx = buildCabinetContext(cabinet)
      const tasteCtx   = buildTasteContext(ratings)
      const userMsg = [
        cabinetCtx,
        tasteCtx,
        prompt ? `The user is in the mood for: ${prompt}.` : '',
        'Suggest 3 cocktails I can make right now with what I have on hand.'
      ].filter(Boolean).join('\n')

      const raw = await callClaude(apiKey, SUGGESTION_SYSTEM, userMsg)
      const json = JSON.parse(raw.replace(/```json|```/g, '').trim())
      setSuggestions(json.suggestions || [])
    } catch (e) {
      setError(e.message || 'Something went wrong. Check your API key.')
    } finally {
      setLoading(false)
    }
  }

  const handleRate = (suggestion, rating) => {
    onAddReview({
      id: Date.now(),
      cocktailName: suggestion.name,
      type: suggestion.type,
      rating,
      notes: '',
      flavourProfile: suggestion.flavourProfile || [],
      date: new Date().toISOString(),
    })
  }

  return (
    <div className={styles.suggestions}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>Tonight's Suggestions</h2>
        <p className={styles.sectionSub}>What shall we make?</p>
      </div>

      <div className={styles.promptBar}>
        <input
          className={styles.input}
          placeholder="Optional: what are you in the mood for? (e.g. something smoky, refreshing, low ABV...)"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && generate()}
        />
        <button
          className={styles.generateBtn}
          onClick={generate}
          disabled={loading}
        >
          {loading ? <span className={styles.spinner} /> : '✦'}
          {loading ? 'Consulting the bar...' : 'Suggest Cocktails'}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {cabinet.length === 0 && !error && (
        <div className={styles.hint}>
          <span>❧</span>
          <p>Add bottles to your cabinet first, then return here for suggestions tailored to what you have on hand.</p>
        </div>
      )}

      <div className={styles.cards}>
        {suggestions.map((s, i) => (
          <div
            key={i}
            className={`${styles.card} ${expanded === i ? styles.open : ''}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={styles.cardHeader} onClick={() => setExpanded(expanded === i ? null : i)}>
              <div className={styles.cardMeta}>
                <span className={`tag ${s.type === 'classic' ? 'gold' : 'rouge'}`}>
                  {s.type === 'classic' ? '◈ Classic' : '✦ Original'}
                </span>
              </div>
              <h3 className={styles.cardName}>{s.name}</h3>
              <p className={styles.cardDesc}>{s.description}</p>
              <div className={styles.flavourTags}>
                {(s.flavourProfile || []).map(f => (
                  <span key={f} className={`tag ${FLAVOUR_COLORS[f.toLowerCase()] || ''}`}>
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {expanded === i && (
              <div className={styles.cardBody}>
                <div className={styles.divider}><span>Ingredients</span></div>
                <ul className={styles.ingredients}>
                  {(s.ingredients || []).map(ing => (
                    <li key={ing}>{ing}</li>
                  ))}
                </ul>

                <div className={styles.divider}><span>Method</span></div>
                <p className={styles.instructions}>{s.instructions}</p>

                {s.whyThisOne && (
                  <p className={styles.why}><em>"{s.whyThisOne}"</em></p>
                )}

                <div className={styles.ratingRow}>
                  <span className={styles.rateLabel}>Rate this:</span>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      className={styles.rateStar}
                      onClick={() => handleRate(s, n)}
                      title={`${n} star${n !== 1 ? 's' : ''}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
