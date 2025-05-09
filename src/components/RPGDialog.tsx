
import React from 'react';
import { Button } from "@/components/ui/button";

interface RPGDialogProps {
  text: string;
  speaker?: string;
  onContinue?: () => void;
  showContinue?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const RPGDialog: React.FC<RPGDialogProps> = ({
  text,
  speaker,
  onContinue,
  showContinue = true,
  children,
  className = ''
}) => {
  return (
    <div className={`rpg-dialog ${className}`}>
      {speaker && (
        <div className="bg-mushu-dark text-white px-4 py-1 rounded-md inline-block mb-2">
          {speaker}
        </div>
      )}
      <div className="my-3 text-lg">
        {text}
      </div>
      {children}
      {showContinue && onContinue && (
        <div className="mt-3 text-right">
          <Button 
            onClick={onContinue} 
            className="rpg-button"
          >
            Continuar
          </Button>
        </div>
      )}
    </div>
  );
};

export default RPGDialog;
