import React, { useState } from 'react'
import styles from './Reviews.module.css'

const STARS = [1, 2, 3, 4, 5]

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className={styles.stars}>
      {STARS.map(n => (
        <button
          key={n}
          className={`${styles.star} ${n <= (hover || value) ? styles.filled : ''}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function Reviews({ ratings, setRatings }) {
  const [form, setForm] = useState({ cocktailName: '', rating: 0, notes: '', type: 'classic' })
  const [editId, setEditId] = useState(null)
  const [filterMin, setFilterMin] = useState(0)
  const [sortBy, setSortBy] = useState('date')

  const submit = () => {
    if (!form.cocktailName.trim() || !form.rating) return

    if (editId !== null) {
      setRatings(prev => prev.map(r => r.id === editId ? { ...r, ...form } : r))
      setEditId(null)
    } else {
      setRatings(prev => [...prev, {
        id: Date.now(),
        ...form,
        cocktailName: form.cocktailName.trim(),
        date: new Date().toISOString(),
      }])
    }
    setForm({ cocktailName: '', rating: 0, notes: '', type: 'classic' })
  }

  const startEdit = (r) => {
    setForm({ cocktailName: r.cocktailName, rating: r.rating, notes: r.notes || '', type: r.type || 'classic' })
    setEditId(r.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = (id) => setRatings(prev => prev.filter(r => r.id !== id))
  const cancel = () => { setEditId(null); setForm({ cocktailName: '', rating: 0, notes: '', type: 'classic' }) }

  const avgRating = ratings.length
    ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
    : null

  const filtered = ratings
    .filter(r => r.rating >= filterMin)
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date)
      if (sortBy === 'rating') return b.rating - a.rating
      return a.cocktailName.localeCompare(b.cocktailName)
    })

  return (
    <div className={styles.reviews}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>Tasting Notes</h2>
        <p className={styles.sectionSub}>
          {ratings.length} {ratings.length === 1 ? 'entry' : 'entries'}
          {avgRating && <> &mdash; avg. {avgRating} ★</>}
        </p>
      </div>

      <div className={styles.form}>
        <h3 className={styles.formTitle}>{editId ? 'Edit Entry' : 'New Tasting Note'}</h3>
        <div className={styles.formRow}>
          <input
            className={styles.input}
            placeholder="Cocktail name..."
            value={form.cocktailName}
            onChange={e => setForm(p => ({ ...p, cocktailName: e.target.value }))}
          />
          <select
            className={styles.select}
            value={form.type}
            onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
          >
            <option value="classic">Classic</option>
            <option value="original">Original</option>
          </select>
        </div>
        <div className={styles.formRow}>
          <div className={styles.ratingLabel}>Your Rating:</div>
          <StarRating value={form.rating} onChange={r => setForm(p => ({ ...p, rating: r }))} />
        </div>
        <textarea
          className={styles.textarea}
          placeholder="Notes — what did you taste? Would you make it again?"
          value={form.notes}
          onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
          rows={3}
        />
        <div className={styles.formActions}>
          {editId && <button className={styles.cancelBtn} onClick={cancel}>Cancel</button>}
          <button className={styles.submitBtn} onClick={submit} disabled={!form.cocktailName || !form.rating}>
            {editId ? 'Save Changes' : 'Add Note'}
          </button>
        </div>
      </div>

      {ratings.length > 0 && (
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Minimum rating:</label>
            {[0, 3, 4, 5].map(n => (
              <button
                key={n}
                className={`${styles.controlBtn} ${filterMin === n ? styles.activeControl : ''}`}
                onClick={() => setFilterMin(n)}
              >
                {n === 0 ? 'All' : `${n}★+`}
              </button>
            ))}
          </div>
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Sort by:</label>
            {['date', 'rating', 'name'].map(s => (
              <button
                key={s}
                className={`${styles.controlBtn} ${sortBy === s ? styles.activeControl : ''}`}
                onClick={() => setSortBy(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.list}>
        {filtered.length === 0 && ratings.length === 0 && (
          <div className={styles.emptyState}>
            <span>◈</span>
            <p>No tasting notes yet. Rate cocktails from Suggestions or add manually above.</p>
          </div>
        )}
        {filtered.map(r => (
          <div key={r.id} className={styles.entry} style={{ '--star-fill': r.rating / 5 }}>
            <div className={styles.entryTop}>
              <div>
                <h3 className={styles.entryName}>{r.cocktailName}</h3>
                <div className={styles.entryMeta}>
                  <span className={`tag ${r.type === 'classic' ? 'gold' : 'rouge'}`}>
                    {r.type === 'classic' ? '◈ Classic' : '✦ Original'}
                  </span>
                  <span className={styles.entryDate}>
                    {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className={styles.entryRating}>
                <span className={styles.ratingNum}>{r.rating}</span>
                <span className={styles.ratingDen}>/5</span>
                <div className={styles.entryStars}>
                  {STARS.map(n => (
                    <span key={n} className={`${styles.staticStar} ${n <= r.rating ? styles.filledStar : ''}`}>★</span>
                  ))}
                </div>
              </div>
            </div>
            {r.notes && <p className={styles.entryNotes}>{r.notes}</p>}
            <div className={styles.entryActions}>
              <button className={styles.editBtn} onClick={() => startEdit(r)}>Edit</button>
              <button className={styles.deleteBtn} onClick={() => remove(r.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
