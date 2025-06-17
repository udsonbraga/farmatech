
import React from 'react';
import { Brain, Pill } from 'lucide-react';

interface FarmaTechLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const FarmaTechLogo: React.FC<FarmaTechLogoProps> = ({ 
  size = 'md', 
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  const iconSize = {
    sm: 16,
    md: 24,
    lg: 32
  };

  const textSize = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <div className="flex items-center gap-3">
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        {/* Background gradient circle */}
        <div className="absolute inset-0 bg-gradient-to-br from-farmatech-blue to-farmatech-teal rounded-full shadow-lg"></div>
        
        {/* Brain icon (IA) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain 
            size={iconSize[size] * 0.6} 
            className="text-white opacity-80" 
          />
        </div>
        
        {/* Pill icon (Farmácia) - positioned slightly offset */}
        <div className="absolute inset-0 flex items-center justify-center translate-x-1 translate-y-1">
          <Pill 
            size={iconSize[size] * 0.5} 
            className="text-white/70" 
          />
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-farmatech-blue to-farmatech-teal rounded-full blur-sm opacity-50 scale-110"></div>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold bg-gradient-to-r from-farmatech-blue to-farmatech-teal bg-clip-text text-transparent ${textSize[size]}`}>
            FarmaTech
          </h1>
          {size !== 'sm' && (
            <p className="text-xs text-muted-foreground font-medium tracking-wide">
              AI • ANALYTICS • INSIGHTS
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FarmaTechLogo;
