import React from 'react'
import styles from './Header.module.css'

const TABS = [
  { id: 'cabinet',    label: 'The Cabinet',    icon: '⬡' },
  { id: 'suggest',    label: 'Suggestions',    icon: '✦' },
  { id: 'reviews',    label: 'Tasting Notes',  icon: '◈' },
  { id: 'recommend',  label: 'Next Bottle',    icon: '❧' },
  { id: 'settings',   label: 'Settings',       icon: '⚙' },
]

export default function Header({ activeTab, onTabChange }) {
  return (
    <header className={styles.header}>
      <div className={styles.masthead}>
        <div className={styles.rule} />
        <div className={styles.titleBlock}>
          <span className={styles.vol}>Est. Your Collection</span>
          <h1 className={styles.title}>The Cabinet</h1>
          <p className={styles.sub}>A Cocktail Companion &amp; Virtual Bar</p>
        </div>
        <div className={styles.rule} />
      </div>

      <nav className={styles.nav}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.navBtn} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className={styles.navIcon}>{tab.icon}</span>
            <span className={styles.navLabel}>{tab.label}</span>
          </button>
        ))}
      </nav>
    </header>
  )
}
