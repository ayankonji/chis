import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import DrawPage from './pages/DrawPage'
import DetailPage from './pages/DetailPage'
import AddPage from './pages/AddPage'

function App() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-ios-bg">
      <Navbar scrolled={scrolled} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/draw" element={<DrawPage />} />
          <Route path="/food/:id" element={<DetailPage />} />
          <Route path="/add" element={<AddPage />} />
          <Route path="/edit/:id" element={<AddPage editMode />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App
