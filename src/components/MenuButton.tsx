
import React from 'react';
import { Link } from 'react-router-dom';

interface MenuButtonProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  notification?: number;
}

const MenuButton: React.FC<MenuButtonProps> = ({ 
  icon, 
  label, 
  to, 
  notification 
}) => {
  return (
    <Link to={to} className="block">
      <div className="rpg-menu-item relative">
        {notification && notification > 0 && (
          <div className="absolute -top-2 -right-2 bg-mushu-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
            {notification}
          </div>
        )}
        <div className="text-2xl mb-2">{icon}</div>
        <div className="text-center font-medium">{label}</div>
      </div>
    </Link>
  );
};

export default MenuButton;
