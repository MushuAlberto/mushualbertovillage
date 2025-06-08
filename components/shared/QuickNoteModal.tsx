import React, { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { LightbulbIcon, CheckCircleIcon, XCircleIcon } from '../icons';

interface QuickNoteModalProps {
  onClose: () => void;
  onSave: (text: string) => void;
}

export const QuickNoteModal: React.FC<QuickNoteModalProps> = ({ onClose, onSave }) => {
  const [text, setText] = useState('');

  const handleSave = () => {
    if (text.trim()) {
      onSave(text.trim());
      onClose();
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <Card title="Apunta Algo Rápido" icon={<LightbulbIcon className="w-6 h-6 text-yellow-400 dark:text-yellow-300" />} className="w-full max-w-lg shadow-xl">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe tu idea, recordatorio, tarea pendiente..."
          rows={5}
          className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
          autoFocus
        />
        <div className="mt-4 flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose} leftIcon={<XCircleIcon className="w-4 h-4" />}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!text.trim()} leftIcon={<CheckCircleIcon className="w-4 h-4" />}>
            Guardar Apunte
          </Button>
        </div>
      </Card>
      {/* Basic fadeIn animation if not globally available */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};