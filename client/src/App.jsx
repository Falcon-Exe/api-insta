import React from 'react'
import InstagramGrid from './components/InstagramGrid'
import './App.css'

function App() {
  // Parse URL parameters so the iframe can be customized by the parent website
  const queryParams = new URLSearchParams(window.location.search);
  const bgColor = queryParams.get('bg') === 'transparent' ? 'transparent' : (queryParams.get('bg') ? `#${queryParams.get('bg')}` : 'var(--ig-bg)');
  const padding = queryParams.get('padding') || '2rem';

  return (
    <div className="app-container" style={{ minHeight: '100vh', backgroundColor: bgColor, padding: padding }}>
      <InstagramGrid limit={18} apiBaseUrl={import.meta.env.DEV ? "http://localhost:8080" : ""} />
    </div>
  )
}

export default App
