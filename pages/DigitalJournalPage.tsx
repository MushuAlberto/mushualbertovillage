
import React, { useState, useEffect, useCallback } from 'react';
import { PageShell } from '../components/shared/PageShell';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { BookOpenIcon, PlusIcon, TrashIcon, EditIcon, SparklesIcon, CheckCircleIcon } from '../components/icons';
import { JournalEntry } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { analyzeJournalEntrySentiment, summarizeJournalEntry, getJournalReflectionPrompts } from '../services/geminiService'; // Updated import
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

export const DigitalJournalPage: React.FC<{
  journalEntries: JournalEntry[];
  setJournalEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  setSparkles: React.Dispatch<React.SetStateAction<number>>; // Added setSparkles
}> = ({ journalEntries, setJournalEntries, setSparkles }) => {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  
  const [isLoadingAiFeatures, setIsLoadingAiFeatures] = useState(false);
  const [currentReflectionPrompts, setCurrentReflectionPrompts] = useState<string[] | null>(null); // Changed to array
  const [isLoadingReflectionPrompt, setIsLoadingReflectionPrompt] = useState(false);

  const sortedEntries = [...journalEntries].sort((a, b) => b.updatedAt - a.updatedAt);

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setCurrentTitle('');
    setCurrentContent('');
    setIsEditing(true);
    setCurrentReflectionPrompts(null); 
    fetchNewReflectionPrompts(); // Fetch prompts for new entry
  };

  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setCurrentTitle(entry.title);
    setCurrentContent(entry.content);
    setIsEditing(true);
    setCurrentReflectionPrompts(null); // Clear old prompts when selecting an existing entry for edit
  };

  const handleSaveEntry = async () => {
    if (!currentTitle.trim() || !currentContent.trim()) {
      alert('El título y el contenido no pueden estar vacíos.');
      return;
    }

    setIsLoadingAiFeatures(true);
    let updatedEntryData: Partial<JournalEntry> = {};
    // const isNewEntry = !selectedEntry; // Not directly used for sparkle logic here, but good to know

    try {
      const [sentimentResult, summaryResult] = await Promise.all([
        analyzeJournalEntrySentiment(currentContent),
        summarizeJournalEntry(currentContent)
      ]);
      updatedEntryData.sentiment = sentimentResult.sentiment;
      updatedEntryData.sentimentEmoji = sentimentResult.emoji;
      updatedEntryData.summary = summaryResult;
    } catch (error) {
      console.error("Error fetching AI features for journal entry:", error);
      updatedEntryData.sentiment = 'neutral';
      updatedEntryData.sentimentEmoji = '😐';
      updatedEntryData.summary = 'No se pudo analizar la entrada en este momento.';
    }


    if (selectedEntry) {
      // Update existing entry
      const updatedEntries = journalEntries.map(entry =>
        entry.id === selectedEntry.id
          ? { ...entry, title: currentTitle, content: currentContent, updatedAt: Date.now(), ...updatedEntryData }
          : entry
      );
      setJournalEntries(updatedEntries);
      const newlyUpdatedEntry = updatedEntries.find(e => e.id === selectedEntry.id);
      if (newlyUpdatedEntry) setSelectedEntry(newlyUpdatedEntry);
    } else {
      // Create new entry
      const newEntry: JournalEntry = {
        id: crypto.randomUUID(),
        title: currentTitle,
        content: currentContent,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...updatedEntryData
      };
      const updatedEntries = [newEntry, ...journalEntries];
      setJournalEntries(updatedEntries);
      setSelectedEntry(newEntry);
      setSparkles(prev => prev + 5); // Award 5 Sparkles for new entry
    }
    setIsLoadingAiFeatures(false);
    // setIsEditing(false); // Keep editing open to see AI analysis if desired
    setCurrentReflectionPrompts(null); // Clear prompts after saving
  };

  const handleDeleteEntry = () => {
    if (selectedEntry && window.confirm(`¿Estás seguro de que quieres eliminar la entrada "${selectedEntry.title}"?`)) {
      setJournalEntries(journalEntries.filter(entry => entry.id !== selectedEntry.id));
      setSelectedEntry(null);
      setIsEditing(false);
      setCurrentTitle('');
      setCurrentContent('');
      setCurrentReflectionPrompts(null);
    }
  };

  const fetchNewReflectionPrompts = async () => {
    setIsLoadingReflectionPrompt(true);
    setCurrentReflectionPrompts(null);
    try {
      const prompts = await getJournalReflectionPrompts(); // Fetch array of prompts
      setCurrentReflectionPrompts(prompts);
    } catch (error) {
      console.error("Error fetching reflection prompts:", error);
      setCurrentReflectionPrompts(["Reflexiona sobre cómo te sientes hoy y qué pensamientos ocupan tu mente."]);
    } finally {
      setIsLoadingReflectionPrompt(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <PageShell 
        title="Mi Diario Digital" 
        icon={<BookOpenIcon className="w-8 h-8" />}
        actionButton={
            !isEditing ? (
            <Button onClick={handleNewEntry} leftIcon={<PlusIcon className="w-5 h-5"/>}>
                Nueva Entrada
            </Button>
            ) : null
        }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Entry List */}
        <div className="md:col-span-1">
          <Card title="Mis Entradas" className="max-h-[70vh] overflow-y-auto">
            {sortedEntries.length === 0 && !isEditing && (
              <p className="text-neutral-500 dark:text-neutral-400 italic">No hay entradas todavía. ¡Crea una!</p>
            )}
            <ul className="space-y-3">
              {sortedEntries.map(entry => (
                <li 
                    key={entry.id} 
                    onClick={() => handleSelectEntry(entry)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors duration-150
                        ${selectedEntry?.id === entry.id 
                            ? 'bg-teal-100 dark:bg-teal-800 ring-2 ring-teal-500 dark:ring-teal-400' 
                            : 'bg-neutral-50 dark:bg-neutral-700/60 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                        }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-neutral-700 dark:text-neutral-200">{entry.title}</h3>
                    {entry.sentimentEmoji && <span className="text-xl ml-2">{entry.sentimentEmoji}</span>}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {formatDate(entry.updatedAt)}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Editor/Viewer */}
        <div className="md:col-span-2">
          {isEditing ? (
            <Card title={selectedEntry ? "Editando Entrada" : "Nueva Entrada"}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="entryTitle" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Título</label>
                  <input
                    type="text"
                    id="entryTitle"
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
                    placeholder="El título de tu aventura de hoy..."
                  />
                </div>

                {isLoadingReflectionPrompt && <div className="py-2"><LoadingSpinner size="sm"/></div>}
                {!isLoadingReflectionPrompt && currentReflectionPrompts && currentReflectionPrompts.length > 0 && (
                  <div className="p-3 bg-teal-50 dark:bg-teal-900/30 rounded-md space-y-1.5">
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">Sugerencias para reflexionar:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {currentReflectionPrompts.map((prompt, index) => (
                        <li key={index} className="text-sm italic text-teal-600 dark:text-teal-400">{prompt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <label htmlFor="entryContent" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Contenido</label>
                  <textarea
                    id="entryContent"
                    value={currentContent}
                    onChange={(e) => setCurrentContent(e.target.value)}
                    rows={12}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
                    placeholder={currentReflectionPrompts && currentReflectionPrompts.length > 0 ? "Elige una inspiración o escribe libremente..." : "¿Qué pasó hoy? ¿Cómo te sientes?"}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex space-x-3">
                        <Button 
                            onClick={handleSaveEntry} 
                            disabled={isLoadingAiFeatures || !currentTitle.trim() || !currentContent.trim()}
                            leftIcon={isLoadingAiFeatures ? <LoadingSpinner size="sm" color="text-white"/> : <CheckCircleIcon className="w-4 h-4"/>}
                        >
                            {isLoadingAiFeatures ? 'Analizando...' : (selectedEntry ? 'Guardar Cambios' : `Guardar Entrada${!selectedEntry ? ' (+5 ✨)' : ''}`)}
                        </Button>
                        <Button
                            onClick={fetchNewReflectionPrompts}
                            variant="ghost"
                            disabled={isLoadingReflectionPrompt}
                            leftIcon={isLoadingReflectionPrompt ? <LoadingSpinner size="sm"/> : <SparklesIcon className="w-4 h-4"/>}
                        >
                            Inspiración
                        </Button>
                    </div>
                    <div className="flex space-x-3">
                        <Button variant="ghost" onClick={() => { setIsEditing(false); setSelectedEntry(null); setCurrentReflectionPrompts(null); }}>
                            Cancelar
                        </Button>
                        {selectedEntry && (
                        <Button variant="danger" onClick={handleDeleteEntry} leftIcon={<TrashIcon className="w-4 h-4"/>}>
                            Eliminar
                        </Button>
                        )}
                  </div>
                </div>
              </div>

              {selectedEntry && (selectedEntry.sentiment || selectedEntry.summary) && !isLoadingAiFeatures && (
                <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
                  {selectedEntry.sentiment && selectedEntry.sentimentEmoji && (
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">Sentimiento Detectado:</h4>
                      <p className="text-neutral-700 dark:text-neutral-200">
                        <span className="text-2xl mr-2">{selectedEntry.sentimentEmoji}</span>
                        {selectedEntry.sentiment.charAt(0).toUpperCase() + selectedEntry.sentiment.slice(1)}
                      </p>
                    </div>
                  )}
                  {selectedEntry.summary && (
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">Resumen Rápido:</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-200 italic">"{selectedEntry.summary}"</p>
                    </div>
                  )}
                </div>
              )}


            </Card>
          ) : selectedEntry ? (
            <Card title={selectedEntry.title}>
              <div className="mb-2">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Creado: {formatDate(selectedEntry.createdAt)}</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 mx-2">|</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Última Modificación: {formatDate(selectedEntry.updatedAt)}</span>
              </div>
              <div 
                className="prose prose-sm dark:prose-invert max-w-none p-3 bg-neutral-50 dark:bg-neutral-700/30 rounded-md whitespace-pre-wrap min-h-[200px]"
              >
                {selectedEntry.content}
              </div>
              {(selectedEntry.sentiment || selectedEntry.summary) && (
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
                  {selectedEntry.sentiment && selectedEntry.sentimentEmoji && (
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">Sentimiento Detectado:</h4>
                      <p className="text-neutral-700 dark:text-neutral-200">
                        <span className="text-2xl mr-2">{selectedEntry.sentimentEmoji}</span>
                        {selectedEntry.sentiment.charAt(0).toUpperCase() + selectedEntry.sentiment.slice(1)}
                      </p>
                    </div>
                  )}
                  {selectedEntry.summary && (
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">Resumen Rápido:</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-200 italic">"{selectedEntry.summary}"</p>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-6 flex space-x-3">
                <Button onClick={() => setIsEditing(true)} leftIcon={<EditIcon className="w-4 h-4"/>}>Editar</Button>
                <Button variant="danger" onClick={handleDeleteEntry} leftIcon={<TrashIcon className="w-4 h-4"/>}>Eliminar</Button>
              </div>
            </Card>
          ) : (
            <Card className="text-center">
              <BookOpenIcon className="w-16 h-16 mx-auto text-teal-500 dark:text-teal-400 mb-4" />
              <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-2">Bienvenido a tu Diario Digital</h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                Selecciona una entrada de la lista para verla o editarla, o crea una nueva para empezar a escribir.
              </p>
              <Button onClick={handleNewEntry} leftIcon={<PlusIcon className="w-5 h-5"/>} size="lg">
                Crear Mi Primera Entrada
              </Button>
            </Card>
          )}
        </div>
      </div>
    </PageShell>
  );
};
