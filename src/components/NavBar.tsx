import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, Plus, Bell, User } from 'lucide-react';

const NavBar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/map', icon: MapPin, label: '地图' },
    { path: '/publish', icon: Plus, label: '发布', isPrimary: true },
    { path: '/notifications', icon: Bell, label: '消息' },
    { path: '/profile', icon: User, label: '我的' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-4 pb-6 pt-2" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
      <div className="flex justify-between items-center">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center ${currentPath === item.path ? 'text-blue-600' : 'text-gray-600'}`}
            style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {item.isPrimary ? (
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center -mt-6 mb-1">
                <item.icon size={24} className="text-white" />
              </div>
            ) : (
              <>
                <item.icon size={24} />
                <span className="text-xs mt-1">{item.label}</span>
              </>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NavBar;
