import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../components/shared/PageShell';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { LightbulbIcon, TrashIcon, SparklesIcon } from '../components/icons';
import { QuickNote } from '../types';

interface QuickNotesPageProps {
  quickNotes: QuickNote[];
  setQuickNotes: React.Dispatch<React.SetStateAction<QuickNote[]>>;
}

export const QuickNotesPage: React.FC<QuickNotesPageProps> = ({ quickNotes, setQuickNotes }) => {
  const navigate = useNavigate();

  const handleDeleteNote = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este apunte?')) {
      setQuickNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    }
  };
  
  const handleProcessWithAI = () => {
    if (quickNotes.length === 0) {
        alert("No hay apuntes para procesar. ¡Añade algunos primero!");
        return;
    }
    // Navigate to chat page and pass a message in state to indicate AI processing of quick notes
    navigate('/chat', { 
        state: { 
            initialMessage: "Ayúdame a procesar mis apuntes rápidos.",
            processQuickNotes: true // Flag to indicate quick notes processing
        } 
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };
  
  const sortedNotes = [...quickNotes].sort((a,b) => b.timestamp - a.timestamp);

  return (
    <PageShell 
        title="Mis Apuntes Rápidos" 
        icon={<LightbulbIcon className="w-8 h-8" />}
        actionButton={
            quickNotes.length > 0 ? (
                <Button onClick={handleProcessWithAI} leftIcon={<SparklesIcon className="w-5 h-5"/>} variant="secondary">
                    Analizar con Mushu IA
                </Button>
            ) : null
        }
    >
      {sortedNotes.length === 0 ? (
        <Card className="text-center">
          <LightbulbIcon className="w-16 h-16 mx-auto text-yellow-400 dark:text-yellow-300 mb-4" />
          <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-2">¡Tu bloc de ideas está listo!</h3>
          <p className="text-neutral-500 dark:text-neutral-400">
            Usa el botón de la bombilla (abajo a la derecha) para añadir tus pensamientos, ideas o recordatorios al instante.
            Luego, Mushu Alberto te podrá ayudar a darles forma.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedNotes.map(note => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <p className="text-neutral-700 dark:text-neutral-200 whitespace-pre-wrap flex-grow mr-4">{note.text}</p>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteNote(note.id)} 
                    title="Eliminar apunte"
                    className="!p-1.5 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400"
                >
                  <TrashIcon className="w-5 h-5"/>
                </Button>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">{formatDate(note.timestamp)}</p>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
};