import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Utensils, Shuffle, Plus } from 'lucide-react'

export default function Navbar({ scrolled }) {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isDraw = location.pathname === '/draw'

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass shadow-ios' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className="w-9 h-9 rounded-ios bg-ios-blue flex items-center justify-center shadow-ios-button"
            >
              <Utensils className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-lg font-semibold text-ios-text tracking-tight">
              今天吃什么
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink to="/" active={isHome} icon={<Utensils className="w-4 h-4" />} label="美食库" />
            <NavLink to="/draw" active={isDraw} icon={<Shuffle className="w-4 h-4" />} label="抽卡" />
            <NavLink to="/add" active={location.pathname === '/add'} icon={<Plus className="w-4 h-4" />} label="添加" />
          </nav>
        </div>
      </div>
    </motion.header>
  )
}

function NavLink({ to, active, icon, label }) {
  return (
    <Link
      to={to}
      className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-ios text-sm font-medium transition-all duration-300 tap-highlight-none ${
        active
          ? 'text-ios-blue'
          : 'text-ios-text-secondary hover:text-ios-text'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {active && (
        <motion.div
          layoutId="nav-pill"
          className="absolute inset-0 bg-ios-blue/10 rounded-ios"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
        />
      )}
    </Link>
  )
}
