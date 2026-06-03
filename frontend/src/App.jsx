import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { FoodsProvider } from './context/FoodsContext'
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
    <FoodsProvider>
      <div className="min-h-screen" style={{
        background: 'radial-gradient(ellipse at top, #FFF9F3 0%, #F5EFE6 100%)',
      }}>
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
    </FoodsProvider>
  )
}

export default App
