
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation
import { PageShell } from '../components/shared/PageShell';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { ChatIcon, SendIcon, SparklesIcon, SearchIcon, ExternalLinkIcon, MicrophoneIcon, StopCircleIcon, PlayIcon, PauseIcon, StopIcon } from '../components/icons';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { AIMessage, GroundingChunk, SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent, SpeechRecognitionStatic, QuickNote } from '../types'; // Added QuickNote
import { streamChatWithMuchu, BrainDumpContext } from '../services/geminiService'; // Added BrainDumpContext
import { DEFAULT_USER_NAME, MUSHU_CHAT_CONVERSATION_STARTERS } from '../constants'; 
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AIChatPageProps {
  userId: string | null;
  mushuImageKey: string | null; // Key for the currently equipped Mushu item
  mushuSpeakingGif: string;
  mushuListeningGif: string;
  mushuIdleImage: string;
  quickNotes: QuickNote[]; // Added quickNotes prop
  userName: string; // Added userName
}

const AIMessageBubble: React.FC<{ message: AIMessage, groundingChunks?: GroundingChunk[] }> = ({ message, groundingChunks }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xl px-4 py-3 rounded-xl shadow ${
        isUser
          ? 'bg-teal-600 dark:bg-teal-500 text-white rounded-br-none'
          : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 rounded-bl-none'
      }`}>
        <p className="whitespace-pre-wrap">{message.text}</p>
        {message.sender === 'ai' && groundingChunks && groundingChunks.length > 0 && (
          <div className="mt-3 pt-2 border-t border-neutral-300 dark:border-neutral-600">
            <p className="text-xs font-semibold mb-1 text-neutral-600 dark:text-neutral-400">Fuentes de información:</p>
            <ul className="space-y-1">
              {groundingChunks.map((chunk, index) => (
                chunk.web && chunk.web.uri && (
                  <li key={index} className="text-xs">
                    <a
                      href={chunk.web.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-700 dark:text-teal-400 hover:underline flex items-center"
                    >
                      <ExternalLinkIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                      {chunk.web.title || chunk.web.uri}
                    </a>
                  </li>
                )
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export const AIChatPage: React.FC<AIChatPageProps> = ({ userId, mushuImageKey, mushuSpeakingGif, mushuListeningGif, mushuIdleImage, quickNotes, userName }) => {
  const location = useLocation(); // For receiving state from navigation
  const [messages, setMessages] = useLocalStorage<AIMessage[]>('mushu_alberto_chat_history', [], userId);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useGoogleSearch, setUseGoogleSearch] = useState(false);
  const [currentGroundingChunks, setCurrentGroundingChunks] = useState<GroundingChunk[] | undefined>(undefined);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [isListening, setIsListening] = useState(false);
  const [speechInputText, setSpeechInputText] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastRecognizedTextRef = useRef<string>('');
  const SpeechRecognitionAPI = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : undefined;

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useLocalStorage<string | undefined>('mushu_alberto_selected_tts_voice', undefined, userId);
  const [isSpeakingAI, setIsSpeakingAI] = useState(false);
  const [selectedChatMode, setSelectedChatMode] = useLocalStorage<'text' | 'voice' | 'voice-only' | null>('mushu_alberto_chat_mode', null, userId);
  const [voiceOnlyStatus, setVoiceOnlyStatus] = useState('Toca el micrófono para hablar con Mushu Alberto');
  
  const greetingPlayStateRef = useRef<'idle' | 'pending' | 'played_this_session'>('idle');

  const userNameForGreeting = userName || DEFAULT_USER_NAME; 

  // Handle initial message from navigation state (e.g., from QuickNotesPage)
  useEffect(() => {
    if (location.state?.initialMessage) {
        if (selectedChatMode === 'text') {
            setNewMessage(location.state.initialMessage);
        } else if (selectedChatMode === 'voice' || selectedChatMode === 'voice-only') {
            // For voice modes, if an initial message is passed, auto-send it.
            handleSendMessage(location.state.initialMessage, location.state.processQuickNotes);
        }
        // Clear the state to prevent re-processing on re-renders
        window.history.replaceState({}, document.title) 
    }
  }, [location.state, selectedChatMode]);


  const greetingMessage: AIMessage = {
    id: 'mushu-alberto-greeting-initial-placeholder',
    text: `¡Hola, ${userNameForGreeting}! Soy Mushu Alberto. ¿Cómo puedo ayudarte hoy? 😊`,
    sender: 'ai',
    timestamp: Date.now() -1000 
  };

  const populateVoices = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const allVoices = window.speechSynthesis.getVoices();
    if (allVoices.length === 0 && selectedChatMode !== null) { 
        return;
    }
    
    const spanishVoices = allVoices.filter(voice => voice.lang.startsWith('es'));
    setAvailableVoices(spanishVoices);

    if (spanishVoices.length > 0) {
        const currentSelectedIsValid = selectedVoiceName && spanishVoices.some(v => v.name === selectedVoiceName);
        let newSelectedVoiceName: string | undefined = selectedVoiceName;

        if (!currentSelectedIsValid || !selectedVoiceName) { 
            const orionVoice = spanishVoices.find(v => v.name.toLowerCase().includes('orion'));
            const googleVoice = spanishVoices.find(v => v.name.toLowerCase().includes('google'));
            const microsoftVoice = spanishVoices.find(v => v.name.toLowerCase().includes('microsoft'));

            if (orionVoice) newSelectedVoiceName = orionVoice.name;
            else if (googleVoice) newSelectedVoiceName = googleVoice.name;
            else if (microsoftVoice) newSelectedVoiceName = microsoftVoice.name;
            else newSelectedVoiceName = spanishVoices[0]?.name;
            
            if (newSelectedVoiceName) setSelectedVoiceName(newSelectedVoiceName);
        }
    } else {
        console.warn("No se encontraron voces en español disponibles.");
    }
  }, [selectedVoiceName, setSelectedVoiceName, selectedChatMode]);


  useEffect(() => {
    populateVoices(); 
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = populateVoices; 
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [populateVoices]);
  
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel(); 
      }
      if (recognitionRef.current) { 
        recognitionRef.current.abort(); 
      }
    };
  }, []);


  useEffect(() => {
    if (chatContainerRef.current && selectedChatMode !== 'voice-only') {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, selectedChatMode]);

  const speakText = useCallback((text: string) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis || !selectedVoiceName || availableVoices.length === 0) {
      console.warn("Speech synthesis not available, no voice selected, or no voices loaded for speaking.");
      setIsSpeakingAI(false);
      if (selectedChatMode === 'voice-only') setVoiceOnlyStatus("Error: No se pudo reproducir la voz.");
      return;
    }
    window.speechSynthesis.cancel(); 

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = availableVoices.find(v => v.name === selectedVoiceName);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang; 
    } else {
      const fallbackSpanishVoice = availableVoices.find(v => v.lang.startsWith('es')) || availableVoices[0];
      if (fallbackSpanishVoice) {
        utterance.voice = fallbackSpanishVoice;
        utterance.lang = fallbackSpanishVoice.lang;
         console.warn(`Voz "${selectedVoiceName}" no encontrada o no válida. Usando voz de respaldo: ${fallbackSpanishVoice.name} (${fallbackSpanishVoice.lang}).`);
      } else {
        utterance.lang = 'es-ES'; 
        console.warn(`Voz "${selectedVoiceName}" no encontrada y no hay voces en español. Usando idioma por defecto ${utterance.lang}.`);
      }
    }
    utterance.pitch = 1;
    utterance.rate = 1;

    utterance.onstart = () => {
      setIsSpeakingAI(true);
      setError(null);
      if (selectedChatMode === 'voice-only') setVoiceOnlyStatus("Mushu Alberto está respondiendo...");
    };
    utterance.onend = () => {
        setIsSpeakingAI(false);
        if (selectedChatMode === 'voice-only') setVoiceOnlyStatus("Toca el micrófono para hablar con Mushu Alberto");
    };
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      console.error("Speech synthesis error code:", event.error, "name:", event.name);
      if (event.utterance) {
        console.error("Utterance text (first 50 chars):", event.utterance.text.substring(0, 50) + "...", "lang:", event.utterance.lang, "voice name:", event.utterance.voice?.name);
      }
      const userError = `Error al sintetizar voz: ${event.error}`;
      setError(userError);
      if (selectedChatMode === 'voice-only') setVoiceOnlyStatus(userError);
      setIsSpeakingAI(false);
    };
    
    window.speechSynthesis.speak(utterance);
  }, [availableVoices, selectedVoiceName, selectedChatMode]);


  const handleStopAISpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeakingAI(false);
      if (selectedChatMode === 'voice-only') setVoiceOnlyStatus("Toca el micrófono para hablar con Mushu Alberto");
    }
  };
  
  useEffect(() => {
    if (selectedChatMode && selectedChatMode !== 'voice-only' && messages.length === 0) {
      if (greetingPlayStateRef.current !== 'played_this_session' && greetingPlayStateRef.current !== 'pending') {
        setMessages([greetingMessage]);
      }
    }
  }, [selectedChatMode, messages.length, setMessages, greetingMessage]);

  useEffect(() => {
    if (selectedChatMode !== 'voice' && selectedChatMode !== 'voice-only') {
      greetingPlayStateRef.current = 'idle'; 
      return;
    }

    if (sessionStorage.getItem(`mushu_alberto_spoken_greeting_${userId || 'guest'}`)) {
      greetingPlayStateRef.current = 'played_this_session';
       if (selectedChatMode === 'voice-only' && !isSpeakingAI && !isListening && !isLoading) {
           setVoiceOnlyStatus("Toca el micrófono para hablar con Mushu Alberto");
       }
    }
    
    if (
      greetingPlayStateRef.current === 'idle' &&
      availableVoices.length > 0 &&
      selectedVoiceName
    ) {
      let shouldAttemptPlay = false;
      if (selectedChatMode === 'voice') {
        if (messages.length === 1 && messages[0].id === greetingMessage.id) {
          shouldAttemptPlay = true;
        }
      } else if (selectedChatMode === 'voice-only') {
        shouldAttemptPlay = true;
      }

      if (shouldAttemptPlay) {
        greetingPlayStateRef.current = 'pending';
        const timerId = setTimeout(() => {
          if (!sessionStorage.getItem(`mushu_alberto_spoken_greeting_${userId || 'guest'}`)) {
            speakText(greetingMessage.text);
            sessionStorage.setItem(`mushu_alberto_spoken_greeting_${userId || 'guest'}`, 'true');
            greetingPlayStateRef.current = 'played_this_session';
          } else {
            greetingPlayStateRef.current = 'played_this_session';
          }
           if (selectedChatMode === 'voice-only' && greetingPlayStateRef.current === 'played_this_session' && !isSpeakingAI && !isListening && !isLoading) {
             setVoiceOnlyStatus("Toca el micrófono para hablar con Mushu Alberto");
           }
        }, 300); 
        return () => {
          clearTimeout(timerId);
          if (greetingPlayStateRef.current === 'pending') {
            greetingPlayStateRef.current = 'idle';
          }
        };
      }
    }
  }, [
    selectedChatMode, 
    messages, 
    greetingMessage, 
    speakText, 
    availableVoices, 
    selectedVoiceName,
    isSpeakingAI, isListening, isLoading,
    userId 
  ]);
  
   useEffect(() => {
    if (!selectedChatMode) {
      greetingPlayStateRef.current = 'idle'; 
      sessionStorage.removeItem(`mushu_alberto_spoken_greeting_${userId || 'guest'}`); 
    }
  }, [selectedChatMode, userId]);


  useEffect(() => {
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true; 
      recognitionRef.current.lang = navigator.language.startsWith('es') ? navigator.language : 'es-ES';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
            lastRecognizedTextRef.current = finalTranscript.trim();
            setSpeechInputText(finalTranscript.trim()); 
            if (selectedChatMode === 'voice-only') setVoiceOnlyStatus("Procesando: " + finalTranscript.trim());
        } else if (interimTranscript) {
            if (selectedChatMode === 'voice') setSpeechInputText(interimTranscript); 
            if (selectedChatMode === 'voice-only') setVoiceOnlyStatus("Escuchando: " + interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent | any) => { 
        console.error('Speech recognition error:', event.error, event.message);
        let errorMsg = `Error de reconocimiento: ${event.error}.`;
         if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            errorMsg = "Permiso para usar el micrófono denegado o servicio no disponible.";
        } else if (event.error === 'no-speech') {
            errorMsg = "No se detectó voz. Intenta de nuevo.";
        } else if (event.error === 'audio-capture') {
            errorMsg = "Problema al capturar audio. Verifica tu micrófono.";
        } else if (event.error === 'aborted') {
             errorMsg = "Grabación cancelada.";
        } else if (event.error === 'network') {
            errorMsg = "Error de red durante el reconocimiento.";
        } else if (event.error === 'bad-grammar') {
            errorMsg = "Error de gramática en el servicio de reconocimiento.";
        } else if (event.error === 'language-not-supported') {
             errorMsg = "Idioma no soportado por el reconocimiento.";
        }
        setError(errorMsg);
        if (selectedChatMode === 'voice-only') setVoiceOnlyStatus(errorMsg);
        setIsListening(false);
        lastRecognizedTextRef.current = ''; 
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        const shouldProcessQuickNotes = location.state?.processQuickNotes || 
                                      (lastRecognizedTextRef.current.toLowerCase().includes("apuntes") || 
                                       lastRecognizedTextRef.current.toLowerCase().includes("notas rápidas"));
        
        if (lastRecognizedTextRef.current && !error) { 
            if (selectedChatMode === 'voice-only') {
                setVoiceOnlyStatus("Mushu Alberto está pensando...");
            }
            handleSendMessage(lastRecognizedTextRef.current, shouldProcessQuickNotes);
            lastRecognizedTextRef.current = '';
        } else if (selectedChatMode === 'voice-only' && !lastRecognizedTextRef.current && !error) {
            setVoiceOnlyStatus("Toca el micrófono para hablar con Mushu Alberto");
        }
      };
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
      if (selectedChatMode === 'voice-only') setVoiceOnlyStatus("Reconocimiento de voz no soportado.");
    }
  }, [SpeechRecognitionAPI, error, selectedChatMode, location.state]);


  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      const noSupportError = "El reconocimiento de voz no es compatible o no está listo.";
      setError(noSupportError);
      if (selectedChatMode === 'voice-only') setVoiceOnlyStatus(noSupportError);
      return;
    }
    if (isSpeakingAI) { 
        handleStopAISpeech();
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setError(null); 
      lastRecognizedTextRef.current = ''; 
      if(selectedChatMode === 'voice') setSpeechInputText(''); 
      if(selectedChatMode === 'voice-only') setVoiceOnlyStatus("Escuchando...");
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e: any) {
        console.error("Error starting speech recognition:", e);
        const startError = `No se pudo iniciar el reconocimiento: ${e.message || 'Error desconocido'}. ¿Permitiste el acceso al micrófono?`;
        setError(startError);
        if (selectedChatMode === 'voice-only') setVoiceOnlyStatus(startError);
        setIsListening(false);
      }
    }
  };

  const handleSendMessage = useCallback(async (immediateText?: string, forceProcessQuickNotes?: boolean) => {
    const textToSend = immediateText || (selectedChatMode === 'text' ? newMessage.trim() : speechInputText.trim());

    if (!textToSend) return;
    if (isSpeakingAI) handleStopAISpeech();

    const userMessage: AIMessage = {
      id: crypto.randomUUID(),
      text: textToSend,
      sender: 'user',
      timestamp: Date.now(),
    };
    
    // Determine history. If messages only contains the placeholder greeting, send empty history.
    // This placeholder is only added for 'text' and 'voice' modes initially.
    // For 'voice-only' mode, `messages` doesn't start with this placeholder, so the condition `messages[0].id === greetingMessage.id` will be false.
    const historyForGemini = (messages.length === 1 && messages[0].id === greetingMessage.id)
      ? []
      : messages.filter(m => m.id !== greetingMessage.id);
    
    // Update messages state by filtering out the placeholder greeting and adding the new user message
    setMessages(prevMessages => {
        const currentMessages = prevMessages.filter(m => m.id !== greetingMessage.id);
        return [...currentMessages, userMessage];
    });

    setNewMessage('');
    setSpeechInputText(''); 
    setIsLoading(true);
    setError(null);
    if (selectedChatMode !== 'voice-only') setCurrentGroundingChunks(undefined);
    if (selectedChatMode === 'voice-only') setVoiceOnlyStatus("Mushu Alberto está pensando...");

    const aiPlaceholderMessageId = crypto.randomUUID();
    const aiPlaceholderMessage: AIMessage = {
        id: aiPlaceholderMessageId,
        text: '', 
        sender: 'ai',
        timestamp: Date.now() + 1,
    };
    
    // Add AI placeholder message
    setMessages(prevMessages => [...prevMessages, aiPlaceholderMessage]);

    // --- Brain Dump Processing Logic ---
    let brainDumpPayload: BrainDumpContext | undefined = undefined;
    const lowerTextToSend = textToSend.toLowerCase();
    const quickNoteKeywords = ["apuntes", "notas rápidas", "brain dump", "mis ideas"];
    const actionKeywords = ["procesa", "ayúdame con", "crea tareas de", "resume", "organiza"];
    
    const containsQuickNoteKeyword = quickNoteKeywords.some(keyword => lowerTextToSend.includes(keyword));
    const containsActionKeyword = actionKeywords.some(keyword => lowerTextToSend.includes(keyword));

    if (forceProcessQuickNotes || (containsQuickNoteKeyword && containsActionKeyword)) {
      if (quickNotes && quickNotes.length > 0) {
        brainDumpPayload = {
          notes: quickNotes,
          userOriginalQuery: textToSend, // Pass the full user query
        };
      } else if (containsQuickNoteKeyword) { // User mentioned notes but has none
         const noNotesMessage: AIMessage = {
            id: crypto.randomUUID(),
            text: "Parece que quieres que te ayude con tus apuntes rápidos, ¡pero no tienes ninguno guardado! Puedes añadirlos desde el botón de la bombilla 💡 o en la sección 'Apuntes'.",
            sender: 'ai',
            timestamp: Date.now() + 2,
        };
        setMessages(prev => prev.filter(m => m.id !== aiPlaceholderMessageId).concat([noNotesMessage]));
        setIsLoading(false);
        if ((selectedChatMode === 'voice' || selectedChatMode === 'voice-only')) speakText(noNotesMessage.text);
        if (selectedChatMode === 'voice-only') setVoiceOnlyStatus("Toca el micrófono para hablar con Mushu Alberto");
        return; 
      }
    }
    // --- End Brain Dump Processing Logic ---

    await streamChatWithMuchu(
      historyForGemini,
      textToSend,
      (chunkText, isFinal, groundingChunks) => {
        setMessages(prevMessages => prevMessages.map(msg => 
            msg.id === aiPlaceholderMessageId ? {...msg, text: msg.text + chunkText} : msg
        ));
        if (selectedChatMode !== 'voice-only' && groundingChunks) {
            setCurrentGroundingChunks(groundingChunks);
        }
        if (isFinal) {
          setIsLoading(false);
          setMessages(prevMessages => {
            const finalAiMessage = prevMessages.find(msg => msg.id === aiPlaceholderMessageId);
            if ((selectedChatMode === 'voice' || selectedChatMode === 'voice-only') && finalAiMessage && finalAiMessage.text) {
                speakText(finalAiMessage.text);
            } else if (selectedChatMode === 'voice-only' && (!finalAiMessage || !finalAiMessage.text)) {
                 setVoiceOnlyStatus("Toca el micrófono para hablar con Mushu Alberto");
            }
            return prevMessages;
          });
        }
      },
      (err) => {
        setError(err);
        if (selectedChatMode === 'voice-only') setVoiceOnlyStatus(err);
        setIsLoading(false);
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== aiPlaceholderMessageId)); 
      },
      selectedChatMode !== 'voice-only' ? useGoogleSearch : false,
      brainDumpPayload // Pass context if available
    );
     // Clear the processQuickNotes flag from location state after processing
    if (location.state?.processQuickNotes) {
        window.history.replaceState({}, document.title)
    }
  }, [
    messages, 
    selectedChatMode, 
    newMessage, 
    speechInputText, 
    isSpeakingAI, 
    handleStopAISpeech, 
    greetingMessage, 
    setMessages, 
    speakText, 
    quickNotes, 
    useGoogleSearch, 
    location.state
  ]);


  const handleConversationStarterClick = (prompt: string) => {
    if (selectedChatMode === 'text') {
        setNewMessage(prompt);
        // Consider auto-sending: handleSendMessage(prompt);
    } else if (selectedChatMode === 'voice' || selectedChatMode === 'voice-only') {
        setSpeechInputText(prompt); // Pre-fill for voice mode
        handleSendMessage(prompt); // Auto-send for voice modes
    }
  };
  
  if (!selectedChatMode) {
    return (
      <PageShell title="Mushu Alberto AI Chat" icon={<ChatIcon className="w-8 h-8" />}>
        <Card title="Selecciona un modo para chatear" className="max-w-lg mx-auto">
          <p className="text-center text-neutral-600 dark:text-neutral-300 mb-6">
            Mushu Alberto puede interactuar contigo de diferentes maneras. ¡Elige tu preferida!
          </p>
          <div className="space-y-4">
            <Button
              onClick={() => setSelectedChatMode('text')}
              className="w-full py-3 text-base"
              leftIcon={<ChatIcon className="w-5 h-5" />}
            >
              Solo Texto
            </Button>
            <Button
              onClick={() => setSelectedChatMode('voice')}
              className="w-full py-3 text-base"
              leftIcon={<MicrophoneIcon className="w-5 h-5" />}
              disabled={!SpeechRecognitionAPI || availableVoices.length === 0}
              variant={(!SpeechRecognitionAPI || availableVoices.length === 0) ? "ghost" : "secondary"}
            >
              Texto y Voz
            </Button>
            <Button
              onClick={() => setSelectedChatMode('voice-only')}
              className="w-full py-3 text-base"
              leftIcon={<MicrophoneIcon className="w-5 h-5" />}
              disabled={!SpeechRecognitionAPI || availableVoices.length === 0}
              variant={(!SpeechRecognitionAPI || availableVoices.length === 0) ? "ghost" : "secondary"}
            >
              Solo Voz (Beta)
            </Button>
          </div>
          {(!SpeechRecognitionAPI || availableVoices.length === 0) && (
            <p className="text-xs text-center text-yellow-600 dark:text-yellow-500 mt-4">
              Los modos con voz podrían no estar disponibles. Verifica los permisos del micrófono y el soporte del navegador para reconocimiento y síntesis de voz.
            </p>
          )}
        </Card>
      </PageShell>
    );
  }


  if (selectedChatMode === 'voice-only') {
    return (
        <PageShell title="Mushu Alberto AI (Modo Voz)" icon={<MicrophoneIcon className="w-8 h-8" />}>
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <img 
                    src={isSpeakingAI ? mushuSpeakingGif : (isListening ? mushuListeningGif : mushuIdleImage)} 
                    alt="Mushu Alberto" 
                    className="w-48 h-48 sm:w-60 sm:h-60 mb-6 rounded-full object-contain shadow-lg dark:shadow-neutral-900/60"
                />
                <p className={`text-lg font-medium text-neutral-700 dark:text-neutral-200 mb-8 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                    {voiceOnlyStatus}
                </p>
                <div className="flex items-center space-x-4">
                     {isSpeakingAI && (
                         <Button
                            onClick={handleStopAISpeech}
                            variant="danger"
                            size="lg"
                            className="w-20 h-20 rounded-full p-0"
                            aria-label="Detener voz de IA"
                        >
                            <StopIcon className="w-8 h-8"/>
                        </Button>
                     )}
                    <Button
                        onClick={handleToggleListening}
                        variant={isListening ? 'danger' : 'primary'}
                        size="lg"
                        className={`w-24 h-24 rounded-full p-0 shadow-xl focus:ring-4 ${isListening ? 'focus:ring-red-400 dark:focus:ring-red-500' : 'focus:ring-teal-400 dark:focus:ring-teal-500'}`}
                        aria-label={isListening ? "Detener grabación" : "Iniciar grabación"}
                        disabled={!SpeechRecognitionAPI || isLoading || isSpeakingAI}
                    >
                        {isLoading ? <LoadingSpinner size="lg" color="text-white" darkColor="dark:text-white" /> : (isListening ? <StopCircleIcon className="w-12 h-12"/> : <MicrophoneIcon className="w-12 h-12"/>)}
                    </Button>
                    {(isLoading || isListening) && <div className="w-20 h-20"></div>} {/* Spacer for when stop AI button is not visible */}

                </div>
                 {error && <p className="text-red-500 dark:text-red-400 text-sm mt-6">{error}</p>}
                 <Button variant="ghost" size="sm" onClick={() => setSelectedChatMode(null)} className="mt-12">Cambiar modo de chat</Button>
            </div>
        </PageShell>
    );
  }

  // Text and Voice & Text-Only modes
  return (
    <PageShell title="Mushu Alberto AI Chat" icon={<ChatIcon className="w-8 h-8" />}>
      <Card className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)]"> {/* Adjust height based on header/footer */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-t-lg">
          {messages.map((msg, index) => (
            <AIMessageBubble 
                key={msg.id} 
                message={msg} 
                groundingChunks={msg.sender === 'ai' && index === messages.length -1 ? currentGroundingChunks : undefined}
            />
          ))}
          {isLoading && messages.length > 0 && messages[messages.length-1].sender === 'user' && (
            <div className="flex justify-start mb-4">
                <div className="max-w-xl px-4 py-3 rounded-xl shadow bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 rounded-bl-none">
                    <LoadingSpinner size="sm" />
                </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-2 text-center text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30">
            Error: {error}
          </div>
        )}

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-b-lg">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(undefined, location.state?.processQuickNotes); }} className="flex items-center space-x-2">
            {selectedChatMode === 'voice' && SpeechRecognitionAPI && (
              <Button 
                type="button"
                onClick={handleToggleListening} 
                variant={isListening ? "danger" : "ghost"}
                size="md"
                className="p-2.5"
                aria-label={isListening ? "Detener grabación" : "Iniciar grabación"}
                disabled={!SpeechRecognitionAPI || isSpeakingAI}
              >
                {isListening ? <StopCircleIcon className="w-5 h-5"/> : <MicrophoneIcon className="w-5 h-5"/>}
              </Button>
            )}
            <input
              type="text"
              value={selectedChatMode === 'text' ? newMessage : speechInputText}
              onChange={(e) => {
                if (selectedChatMode === 'text') setNewMessage(e.target.value);
                else if (selectedChatMode === 'voice') setSpeechInputText(e.target.value); 
              }}
              placeholder={isListening ? "Escuchando..." : (selectedChatMode === 'voice' ? "Habla o escribe tu mensaje..." : "Escribe tu mensaje...")}
              className="flex-grow p-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
              disabled={isLoading || isListening}
            />
            <Button 
                type="submit"
                disabled={isLoading || (selectedChatMode === 'text' ? !newMessage.trim() : !speechInputText.trim())}
                className="p-2.5"
                aria-label="Enviar mensaje"
            >
              {isLoading ? <LoadingSpinner size="sm" color="text-white" darkColor="dark:text-white"/> : <SendIcon className="w-5 h-5"/>}
            </Button>
          </form>
          {MUSHU_CHAT_CONVERSATION_STARTERS.length > 0 && !isLoading && !isListening && (
            <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-700/50 flex flex-wrap gap-2">
                {MUSHU_CHAT_CONVERSATION_STARTERS.map(starter => (
                    <Button
                        key={starter.label}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleConversationStarterClick(starter.prompt)}
                        className="!text-xs !px-2 !py-1 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-700/50 border-teal-500/50 dark:border-teal-600/50"
                        title={starter.label}
                    >
                        {starter.icon && <span className="mr-1">{starter.icon}</span>}
                        {starter.label}
                    </Button>
                ))}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <label className="flex items-center text-xs text-neutral-600 dark:text-neutral-400">
              <input
                type="checkbox"
                checked={useGoogleSearch}
                onChange={(e) => setUseGoogleSearch(e.target.checked)}
                className="mr-1.5 h-3.5 w-3.5 rounded border-neutral-300 dark:border-neutral-500 text-teal-600 focus:ring-teal-500 dark:focus:ring-teal-600 dark:checked:bg-teal-500"
              />
              Usar Google Search (para info actual)
            </label>
            {selectedChatMode === 'voice' && isSpeakingAI && (
                 <Button onClick={handleStopAISpeech} size="sm" variant="ghost" className="text-xs" leftIcon={<StopIcon className="w-3 h-3"/>}>
                    Detener voz
                </Button>
            )}
             <Button variant="ghost" size="sm" onClick={() => setSelectedChatMode(null)} className="text-xs">Cambiar modo</Button>
          </div>
        </div>
      </Card>
    </PageShell>
  );
};
