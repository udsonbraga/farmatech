
import React from 'react';
import FarmaTechLogo from '@/components/FarmaTechLogo';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-farmatech-teal/10 to-farmatech-blue/10 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="mb-8 animate-pulse">
          <FarmaTechLogo size="xl" showText={true} />
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-farmatech-blue rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-farmatech-teal rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-farmatech-orange rounded-full animate-bounce"></div>
        </div>
        <p className="mt-4 text-lg text-muted-foreground animate-pulse">
          Carregando FarmaTech...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
