import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { 
  Home, 
  Target, 
  CreditCard, 
  Link as LinkIcon, 
  Bell, 
  LogOut,
  Menu,
  X,
  Sparkles
} from 'lucide-react'

const Layout = ({ children }) => {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Transactions', href: '/transactions', icon: CreditCard },
    { name: 'Connect Bank', href: '/connect', icon: LinkIcon },
  ]

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Wisely</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {isMobileMenuOpen && (
          <div className="bg-white border-b border-gray-200">
            <nav className="px-4 py-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex lg:flex-col lg:min-h-screen">
        <div className="flex flex-1">
          {/* Sidebar */}
          <div className="flex flex-col w-64 bg-gradient-to-b from-orange-500 to-orange-600 border-r border-orange-700">
            <div className="flex items-center px-6 py-8 border-b border-orange-600">
              <h1 className="text-2xl font-bold text-white tracking-wide">wisely<Sparkles className="inline-block h-4 w-4 text-orange-100 ml-1" /></h1>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white text-orange-600 shadow-lg'
                        : 'text-white hover:bg-orange-600 hover:bg-opacity-50'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            
            <div className="px-4 py-4 border-t border-orange-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white border-opacity-30">
                      <span className="text-sm font-medium text-white">
                        {user?.name?.charAt(0) || user?.email?.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-orange-100">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-white hover:text-orange-100 hover:bg-white hover:bg-opacity-20 rounded-md transition-all"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col bg-[#F5F5F7]">
            <main className="flex-1 p-8">
              {children}
            </main>
          </div>
        </div>
      </div>

      {/* Mobile content */}
      <div className="lg:hidden">
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout

