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
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
              style={{
                background: 'linear-gradient(135deg, #FF7F32 0%, #FF9A5C 50%, #FFB088 100%)',
                boxShadow: '0 4px 12px rgba(255, 127, 50, 0.3)',
              }}
            >
              <Utensils className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-lg font-semibold text-ios-text tracking-tight" style={{ fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif' }}>
              今天吃什么
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <NavLink to="/" active={isHome} icon={<Utensils className="w-4 h-4" />} label="美食库" variant="default" />
            <NavLink to="/draw" active={isDraw} icon={<Shuffle className="w-4 h-4" />} label="抽卡" variant="primary" />
            <NavLink to="/add" active={location.pathname === '/add'} icon={<Plus className="w-4 h-4" />} label="添加" variant="secondary" />
          </nav>
        </div>
      </div>
    </motion.header>
  )
}

function NavLink({ to, active, icon, label, variant = 'default' }) {
  const baseClasses = "relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 tap-highlight-none"
  
  let variantClasses = ""
  if (variant === 'primary') {
    variantClasses = active
      ? 'bg-gradient-to-r from-warm-orange to-warm-orange-light text-white shadow-md'
      : 'bg-gradient-to-r from-warm-orange to-warm-orange-light text-white shadow-md hover:shadow-lg hover:translate-y-[-1px]'
  } else if (variant === 'secondary') {
    variantClasses = active
      ? 'bg-coffee text-ios-text'
      : 'bg-coffee text-ios-text hover:bg-coffee/80 hover:translate-y-[-1px]'
  } else {
    variantClasses = active
      ? 'border border-warm-orange/30 bg-warm-orange/10 text-warm-orange'
      : 'border border-coffee bg-white text-ios-text hover:border-warm-orange/50 hover:bg-warm-orange/5 hover:translate-y-[-1px]'
  }

  return (
    <Link
      to={to}
      className={`${baseClasses} ${variantClasses}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  )
}
