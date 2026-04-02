import React, { useState } from 'react'
import styles from './Cabinet.module.css'

const CATEGORIES = [
  { id: 'spirit',     label: 'Spirits',     icon: '🥃' },
  { id: 'mixer',      label: 'Mixers',      icon: '🍶' },
  { id: 'liqueur',    label: 'Liqueurs',    icon: '🍷' },
  { id: 'bitters',    label: 'Bitters',     icon: '💧' },
  { id: 'garnish',    label: 'Garnishes',   icon: '🍋' },
  { id: 'other',      label: 'Other',       icon: '✦'  },
]

const PRESETS = [
  { name: 'Bourbon', category: 'spirit' },
  { name: 'Rye Whiskey', category: 'spirit' },
  { name: 'Scotch', category: 'spirit' },
  { name: 'Gin', category: 'spirit' },
  { name: 'Vodka', category: 'spirit' },
  { name: 'Dark Rum', category: 'spirit' },
  { name: 'White Rum', category: 'spirit' },
  { name: 'Tequila', category: 'spirit' },
  { name: 'Mezcal', category: 'spirit' },
  { name: 'Brandy / Cognac', category: 'spirit' },
  { name: 'Sweet Vermouth', category: 'liqueur' },
  { name: 'Dry Vermouth', category: 'liqueur' },
  { name: 'Amaretto', category: 'liqueur' },
  { name: 'Triple Sec / Cointreau', category: 'liqueur' },
  { name: 'Campari', category: 'liqueur' },
  { name: 'Aperol', category: 'liqueur' },
  { name: 'Kahlúa', category: 'liqueur' },
  { name: 'St-Germain', category: 'liqueur' },
  { name: 'Angostura Bitters', category: 'bitters' },
  { name: 'Orange Bitters', category: 'bitters' },
  { name: 'Peychaud\'s Bitters', category: 'bitters' },
  { name: 'Club Soda', category: 'mixer' },
  { name: 'Tonic Water', category: 'mixer' },
  { name: 'Ginger Beer', category: 'mixer' },
  { name: 'Ginger Ale', category: 'mixer' },
  { name: 'Cola', category: 'mixer' },
  { name: 'Lemon Juice', category: 'mixer' },
  { name: 'Lime Juice', category: 'mixer' },
  { name: 'Simple Syrup', category: 'mixer' },
  { name: 'Grenadine', category: 'mixer' },
  { name: 'Lemon', category: 'garnish' },
  { name: 'Lime', category: 'garnish' },
  { name: 'Orange', category: 'garnish' },
  { name: 'Maraschino Cherries', category: 'garnish' },
  { name: 'Mint', category: 'garnish' },
  { name: 'Olives', category: 'garnish' },
]

export default function Cabinet({ cabinet, setCabinet }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [newItem, setNewItem] = useState({ name: '', category: 'spirit' })
  const [showPresets, setShowPresets] = useState(false)
  const [search, setSearch] = useState('')

  const addItem = () => {
    const name = newItem.name.trim()
    if (!name) return
    if (cabinet.find(i => i.name.toLowerCase() === name.toLowerCase())) return
    setCabinet(prev => [...prev, { id: Date.now(), ...newItem, name }])
    setNewItem(prev => ({ ...prev, name: '' }))
  }

  const addPreset = (preset) => {
    if (cabinet.find(i => i.name === preset.name)) return
    setCabinet(prev => [...prev, { id: Date.now(), ...preset }])
  }

  const removeItem = (id) => {
    setCabinet(prev => prev.filter(i => i.id !== id))
  }

  const filtered = cabinet.filter(i => {
    const matchesFilter = activeFilter === 'all' || i.category === activeFilter
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const presetsFiltered = PRESETS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    !cabinet.find(i => i.name === p.name)
  )

  return (
    <div className={styles.cabinet}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>Your Cabinet</h2>
        <p className={styles.sectionSub}>
          {cabinet.length} {cabinet.length === 1 ? 'bottle' : 'bottles'} in stock
        </p>
      </div>

      <div className={styles.addBar}>
        <input
          className={styles.input}
          placeholder="Add an ingredient..."
          value={newItem.name}
          onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && addItem()}
        />
        <select
          className={styles.select}
          value={newItem.category}
          onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))}
        >
          {CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <button className={styles.addBtn} onClick={addItem}>Add</button>
        <button
          className={`${styles.presetBtn} ${showPresets ? styles.active : ''}`}
          onClick={() => setShowPresets(p => !p)}
        >
          Quick Add
        </button>
      </div>

      {showPresets && (
        <div className={styles.presets}>
          <div className={styles.presetSearch}>
            <input
              className={styles.input}
              placeholder="Search presets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.presetGrid}>
            {presetsFiltered.map(p => (
              <button
                key={p.name}
                className={styles.presetChip}
                onClick={() => addPreset(p)}
              >
                <span>{CATEGORIES.find(c => c.id === p.category)?.icon}</span>
                {p.name}
              </button>
            ))}
            {presetsFiltered.length === 0 && (
              <p className={styles.empty}>All presets added.</p>
            )}
          </div>
        </div>
      )}

      <div className={styles.filters}>
        <button
          className={`${styles.filterBtn} ${activeFilter === 'all' ? styles.activeFilter : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All ({cabinet.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = cabinet.filter(i => i.category === cat.id).length
          if (count === 0) return null
          return (
            <button
              key={cat.id}
              className={`${styles.filterBtn} ${activeFilter === cat.id ? styles.activeFilter : ''}`}
              onClick={() => setActiveFilter(cat.id)}
            >
              {cat.icon} {cat.label} ({count})
            </button>
          )
        })}
      </div>

      {cabinet.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>⬡</span>
          <p>Your cabinet is empty. Add some bottles to get started.</p>
        </div>
      ) : (
        <div className={styles.itemGrid}>
          {filtered.map(item => {
            const cat = CATEGORIES.find(c => c.id === item.category)
            return (
              <div key={item.id} className={styles.item}>
                <span className={styles.itemIcon}>{cat?.icon}</span>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={`tag ${item.category === 'spirit' ? 'amber' : ''}`}>
                    {cat?.label}
                  </span>
                </div>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeItem(item.id)}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
