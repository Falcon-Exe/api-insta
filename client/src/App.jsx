import React from 'react'
import InstagramGrid from './components/InstagramGrid'
import './App.css'

function App() {
  return (
    <div className="app-container" style={{ minHeight: '100vh', backgroundColor: 'var(--ig-bg)', padding: '2rem' }}>
      <InstagramGrid limit={18} apiBaseUrl={import.meta.env.DEV ? "http://localhost:8080" : ""} />
    </div>
  )
}

export default App
