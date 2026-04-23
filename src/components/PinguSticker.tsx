import React from 'react';

interface PinguStickerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const PinguSticker: React.FC<PinguStickerProps> = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-20 h-20',
    large: 'w-32 h-32',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* 身体 */}
        <ellipse cx="50" cy="60" rx="35" ry="40" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
        
        {/* 头部 */}
        <circle cx="50" cy="30" r="25" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
        
        {/* 眼睛 */}
        <circle cx="40" cy="25" r="5" fill="#000000" />
        <circle cx="60" cy="25" r="5" fill="#000000" />
        
        {/* 嘴巴 */}
        <path d="M40 35 Q50 40 60 35" stroke="#000000" strokeWidth="2" fill="none" />
        
        {/* 脚 */}
        <ellipse cx="35" cy="95" rx="8" ry="5" fill="#FF0000" stroke="#000000" strokeWidth="1" />
        <ellipse cx="65" cy="95" rx="8" ry="5" fill="#FF0000" stroke="#000000" strokeWidth="1" />
        
        {/* 翅膀 */}
        <ellipse cx="20" cy="60" rx="8" ry="15" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
        <ellipse cx="80" cy="60" rx="8" ry="15" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
      </svg>
    </div>
  );
};

export default PinguSticker;
