import React, { useState } from 'react'
import styles from './Settings.module.css'

export default function Settings({ apiKey, setApiKey, cabinet, ratings }) {
  const [draft, setDraft]   = useState(apiKey)
  const [saved, setSaved]   = useState(false)
  const [showKey, setShowKey] = useState(false)

  const save = () => {
    setApiKey(draft.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const exportData = () => {
    const data = { cabinet, ratings, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = 'the-cabinet-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (data.cabinet) localStorage.setItem('cabinet', JSON.stringify(data.cabinet))
        if (data.ratings) localStorage.setItem('ratings', JSON.stringify(data.ratings))
        window.location.reload()
      } catch {
        alert('Invalid backup file.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className={styles.settings}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>Settings</h2>
        <p className={styles.sectionSub}>API key &amp; data management</p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionHeading}>
          <span className={styles.sectionIcon}>✦</span>
          Anthropic API Key
        </h3>
        <p className={styles.sectionDesc}>
          Required for AI cocktail suggestions and bottle recommendations. Your key is stored locally in your browser and never sent anywhere except directly to Anthropic.
        </p>
        <div className={styles.keyRow}>
          <input
            className={styles.input}
            type={showKey ? 'text' : 'password'}
            placeholder="sk-ant-..."
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()}
          />
          <button className={styles.showBtn} onClick={() => setShowKey(p => !p)}>
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className={styles.keyActions}>
          <button className={styles.saveBtn} onClick={save}>
            {saved ? '✓ Saved' : 'Save Key'}
          </button>
          {apiKey && (
            <span className={styles.keyStatus}>
              ✓ Key configured
            </span>
          )}
        </div>
        <p className={styles.keyNote}>
          Don't have a key? Get one at <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">console.anthropic.com</a>
        </p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionHeading}>
          <span className={styles.sectionIcon}>◈</span>
          Your Data
        </h3>
        <p className={styles.sectionDesc}>
          All data is stored locally in your browser. Export a backup or import one from another device.
        </p>
        <div className={styles.dataStats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{cabinet.length}</span>
            <span className={styles.statLabel}>bottles in cabinet</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{ratings.length}</span>
            <span className={styles.statLabel}>tasting notes</span>
          </div>
          {ratings.length > 0 && (
            <div className={styles.stat}>
              <span className={styles.statNum}>
                {(ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)}
              </span>
              <span className={styles.statLabel}>average rating</span>
            </div>
          )}
        </div>
        <div className={styles.dataActions}>
          <button className={styles.exportBtn} onClick={exportData}>
            Export Backup
          </button>
          <label className={styles.importBtn}>
            Import Backup
            <input type="file" accept=".json" onChange={importData} hidden />
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionHeading}>
          <span className={styles.sectionIcon}>❧</span>
          About The Cabinet
        </h3>
        <p className={styles.sectionDesc}>
          The Cabinet is an open-source cocktail companion. It uses the Anthropic API to generate
          personalised cocktail suggestions, classic and original, based on what you have on hand and
          what you've enjoyed before. Rate cocktails to help it learn your palate over time.
        </p>
        <div className={styles.links}>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className={styles.link}
          >
            View on GitHub ↗
          </a>
        </div>
      </div>
    </div>
  )
}
