import React, { useState } from 'react'
import Header from './components/Header.jsx'
import Cabinet from './components/Cabinet.jsx'
import Suggestions from './components/Suggestions.jsx'
import Reviews from './components/Reviews.jsx'
import Recommend from './components/Recommend.jsx'
import Settings from './components/Settings.jsx'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import styles from './styles/App.module.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('cabinet')
  const [cabinet, setCabinet]     = useLocalStorage('cabinet', [])
  const [ratings, setRatings]     = useLocalStorage('ratings', [])

  const handleAddReview = (review) => {
    setRatings(prev => {
      const exists = prev.find(r => r.cocktailName === review.cocktailName)
      if (exists) {
        return prev.map(r => r.cocktailName === review.cocktailName ? { ...r, rating: review.rating } : r)
      }
      return [...prev, review]
    })
    setActiveTab('reviews')
  }

  return (
    <div className={styles.app}>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className={styles.main}>
        {activeTab === 'cabinet'   && <Cabinet cabinet={cabinet} setCabinet={setCabinet} />}
        {activeTab === 'suggest'   && (
          <Suggestions cabinet={cabinet} ratings={ratings} onAddReview={handleAddReview} />
        )}
        {activeTab === 'reviews'   && <Reviews ratings={ratings} setRatings={setRatings} />}
        {activeTab === 'recommend' && <Recommend cabinet={cabinet} ratings={ratings} />}
        {activeTab === 'settings'  && <Settings cabinet={cabinet} ratings={ratings} />}
      </main>
      <footer className={styles.footer}>
        <span className={styles.footerRule} />
        <span className={styles.footerText}>The Cabinet &mdash; A Cocktail Companion</span>
        <span className={styles.footerRule} />
      </footer>
    </div>
  )
}
