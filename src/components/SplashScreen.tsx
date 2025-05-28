
import React from 'react';
import MushuAvatar from './MushuAvatar';

const SplashScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-mushu-light to-mushu-accent flex flex-col items-center justify-center p-4">
      <div className="text-center">
        {/* Mushu Avatar con animación */}
        <div className="mb-8 animate-bounce">
          <MushuAvatar size="xl" animate={true} mood="happy" />
        </div>
        
        {/* Título de la aplicación */}
        <h1 className="text-4xl font-bold text-mushu-dark mb-4">
          Mushu Quest Haven
        </h1>
        
        {/* Subtítulo */}
        <p className="text-lg text-mushu-dark mb-8">
          Tu compañero emocional está despertando...
        </p>
        
        {/* Barra de carga animada */}
        <div className="w-64 mx-auto">
          <div className="bg-white rounded-full h-3 shadow-inner">
            <div 
              className="bg-mushu-primary h-3 rounded-full animate-pulse loading-bar"
            >
            </div>
          </div>
        </div>
        
        {/* Texto de carga */}
        <p className="text-sm text-mushu-dark mt-4 animate-pulse">
          Preparando tu aventura emocional...
        </p>
      </div>
      
      <style>
        {`
          @keyframes loading {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
          
          .loading-bar {
            animation: loading 2s ease-in-out infinite;
            width: 100%;
          }
        `}
      </style>
    </div>
  );
};

export default SplashScreen;
