import React from 'react';

interface BearStickerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'brown' | 'white' | 'pink';
  className?: string;
}

const BearSticker: React.FC<BearStickerProps> = ({ size = 'medium', color = 'brown', className = '' }) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-20 h-20',
    large: 'w-32 h-32',
  };

  const colorMap = {
    brown: '#8B4513',
    white: '#FFFFFF',
    pink: '#FFB6C1',
  };

  const bearColor = colorMap[color];

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* 头部 */}
        <circle cx="50" cy="40" r="25" fill={bearColor} stroke="#000000" strokeWidth="2" />
        
        {/* 耳朵 */}
        <circle cx="30" cy="25" r="8" fill={bearColor} stroke="#000000" strokeWidth="1" />
        <circle cx="70" cy="25" r="8" fill={bearColor} stroke="#000000" strokeWidth="1" />
        
        {/* 眼睛 */}
        <circle cx="40" cy="35" r="3" fill="#000000" />
        <circle cx="60" cy="35" r="3" fill="#000000" />
        
        {/* 鼻子 */}
        <circle cx="50" cy="45" r="3" fill="#000000" />
        
        {/* 嘴巴 */}
        <path d="M45 50 Q50 55 55 50" stroke="#000000" strokeWidth="1.5" fill="none" />
        
        {/* 身体 */}
        <ellipse cx="50" cy="75" rx="20" ry="15" fill={bearColor} stroke="#000000" strokeWidth="2" />
        
        {/* 手臂 */}
        <ellipse cx="30" cy="70" rx="5" ry="10" fill={bearColor} stroke="#000000" strokeWidth="1" />
        <ellipse cx="70" cy="70" rx="5" ry="10" fill={bearColor} stroke="#000000" strokeWidth="1" />
        
        {/* 脚 */}
        <ellipse cx="40" cy="90" rx="6" ry="4" fill={bearColor} stroke="#000000" strokeWidth="1" />
        <ellipse cx="60" cy="90" rx="6" ry="4" fill={bearColor} stroke="#000000" strokeWidth="1" />
      </svg>
    </div>
  );
};

export default BearSticker;
