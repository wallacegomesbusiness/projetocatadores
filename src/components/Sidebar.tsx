import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  DollarSign, 
  FileBox, 
  X,
  Recycle,
  LogOut
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }: { isMobileOpen: boolean, setIsMobileOpen: (v: boolean) => void }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('@ReciclaOrg:token');
    localStorage.removeItem('@ReciclaOrg:user');
    navigate('/login');
  };
  const links = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/catadores', icon: <Users size={20} />, label: 'Catadores' },
    { to: '/materiais', icon: <Package size={20} />, label: 'Materiais' },
    { to: '/coletas', icon: <Recycle size={20} />, label: 'Coletas' },
    { to: '/pagamentos', icon: <DollarSign size={20} />, label: 'Pagamentos' },
    { to: '/relatorios', icon: <FileBox size={20} />, label: 'Relatórios' },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
    lg:translate-x-0 lg:static lg:inset-auto flex flex-col print:hidden
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      <div className={sidebarClasses}>
        <div className="flex items-center justify-between h-16 px-6 bg-primary-600 text-white">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Recycle size={24} />
            <span>ReciclaOrg</span>
          </div>
          <button 
            className="lg:hidden p-1 rounded-md hover:bg-primary-700 transition"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors
                ${isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
              `}
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg p-3 text-sm font-semibold transition-colors"
          >
            <LogOut size={20} />
            <span>Sair da Aplicação</span>
          </button>
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};
