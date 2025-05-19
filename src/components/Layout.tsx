import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package2,
  ShoppingCart,
  Users,
  Menu,
  X,
  Keyboard as Skateboard,
} from 'lucide-react';

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: <LayoutDashboard size={20} />, name: 'Dashboard', path: '/' },
    { icon: <Package2 size={20} />, name: 'Estoque', path: '/inventory' },
    { icon: <ShoppingCart size={20} />, name: 'Vendas', path: '/sales' },
    { icon: <Users size={20} />, name: 'Clientes', path: '/customers' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Skateboard className="h-8 w-8 text-blue-600" />
          <span className="ml-2 font-bold text-lg">Skate Shop</span>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="text-gray-600 focus:outline-none"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar for desktop / Mobile menu */}
      <aside
        className={`${
          isMobileMenuOpen ? 'block' : 'hidden'
        } md:block bg-white w-full md:w-64 md:min-h-screen border-r border-gray-200 transition-all duration-300`}
      >
        <div className="p-6 hidden md:flex items-center">
          <Skateboard className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-bold ml-2">Skate Shop</h1>
        </div>
        <nav className="mt-2 md:mt-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                  isActive || location.pathname === item.path
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
                    : ''
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-6 mt-auto hidden md:block">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-700">Precisa de Ajuda?</h3>
            <p className="text-sm text-gray-600 mt-1">
              Consulte o manual ou entre em contato com o suporte.
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
