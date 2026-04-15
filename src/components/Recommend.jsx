import React, { useState } from 'react'
import { getRecommendations } from '../utils/cocktailMatcher.js'
import styles from './Recommend.module.css'

const PRICE_LABELS = { '$': 'Budget-friendly', '$$': 'Mid-range', '$$$': 'Splurge' }

export default function Recommend({ cabinet, ratings }) {
  const [recs, setRecs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [budget, setBudget] = useState('any')

  const generate = () => {
    setLoading(true)
    setError('')
    setRecs([])
    setTimeout(() => {
      try {
        const results = getRecommendations(cabinet, ratings, budget === 'any' ? null : budget)
        if (results.length === 0) {
          setError('Your cabinet is already pretty complete — nothing obvious to add.')
        } else {
          setRecs(results)
        }
      } catch (e) {
        setError('Something went wrong generating recommendations.')
      } finally {
        setLoading(false)
      }
    }, 50)
  }

  return (
    <div className={styles.recommend}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>Next Bottle</h2>
        <p className={styles.sectionSub}>Personalised recommendations to grow your bar</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.budgetGroup}>
          <span className={styles.budgetLabel}>Budget:</span>
          {['any', '$', '$$', '$$$'].map(b => (
            <button
              key={b}
              className={`${styles.budgetBtn} ${budget === b ? styles.activeBudget : ''}`}
              onClick={() => setBudget(b)}
            >
              {b === 'any' ? 'Any' : b}
            </button>
          ))}
        </div>
        <button className={styles.generateBtn} onClick={generate} disabled={loading}>
          {loading ? <span className={styles.spinner} /> : '❧'}
          {loading ? 'Asking the barkeep...' : 'Get Recommendations'}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {recs.length === 0 && !loading && !error && (
        <div className={styles.hint}>
          <div className={styles.hintIcon}>❧</div>
          <div>
            <p className={styles.hintTitle}>What would the barkeep suggest?</p>
            <p className={styles.hintText}>
              Based on your cabinet and tasting history, The Cabinet will recommend bottles that fill
              gaps in your bar, match your palate, and unlock new cocktails you'll actually want to make.
            </p>
            {ratings.length === 0 && (
              <p className={styles.hintNote}>
                Tip: Rate a few cocktails in Tasting Notes first for more personalised results.
              </p>
            )}
          </div>
        </div>
      )}

      <div className={styles.cards}>
        {recs.map((r, i) => (
          <div key={i} className={styles.card} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={styles.cardTop}>
              <div>
                <h3 className={styles.cardName}>{r.name}</h3>
                <div className={styles.cardMeta}>
                  <span className="tag amber">{r.category}</span>
                  <span className={`tag ${r.priceRange === '$$$' ? 'rouge' : r.priceRange === '$$' ? 'amber' : 'gold'}`}>
                    {r.priceRange} — {PRICE_LABELS[r.priceRange]}
                  </span>
                </div>
              </div>
            </div>
            <p className={styles.reason}>{r.reason}</p>
            {r.cocktailsUnlocked?.length > 0 && (
              <div className={styles.unlocks}>
                <span className={styles.unlockLabel}>Unlocks:</span>
                {r.cocktailsUnlocked.map(c => (
                  <span key={c} className={styles.unlockTag}>{c}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
