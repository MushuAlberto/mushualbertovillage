import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useMushu } from '../contexts/MushuContext';
import { useMission } from '../contexts/MissionContext';
import { useEmotion } from '../contexts/EmotionContext';
import { useUser } from '../contexts/UserContext';
import MushuAvatar from '../components/MushuAvatar';
import RPGDialog from '../components/RPGDialog';
import { ArrowLeft, Send } from 'lucide-react';

const ChatBot: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const { mushuState, addChatMessage, getChatHistory } = useMushu();
  const { currentEmotion } = useEmotion();
  const { getActiveMissions } = useMission();
  
  const [message, setMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState(getChatHistory());
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Update chat history when it changes in context
  useEffect(() => {
    setChatHistory(getChatHistory());
  }, [getChatHistory]);
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);
  
  // Send initial greeting if chat is empty
  useEffect(() => {
    if (chatHistory.length === 0) {
      setTimeout(() => {
        let greeting = "¡Hola! Soy Mushu, tu compañero. ¿En qué te puedo ayudar hoy?";
        
        // Personalize based on emotion if available
        if (currentEmotion) {
          switch(currentEmotion.emotion) {
            case 'happy':
              greeting = "¡Veo que estás feliz hoy! ¿Quieres contarme más sobre tu día?";
              break;
            case 'sad':
              greeting = "Noto que estás un poco triste. Estoy aquí para escucharte si necesitas hablar.";
              break;
            case 'angry':
              greeting = "Parece que estás molesto hoy. ¿Hay algo en particular que te esté afectando?";
              break;
            case 'anxious':
              greeting = "Percibo algo de ansiedad. ¿Te gustaría que te ayude con algunas técnicas de relajación?";
              break;
            default:
              // Keep default greeting
          }
        }
        
        addChatMessage('mushu', greeting);
      }, 500);
    }
  }, []);
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Add user message
    addChatMessage('user', message);
    setMessage('');
    
    // Simulate Mushu typing
    setIsTyping(true);
    setTimeout(() => {
      generateMushuResponse(message);
      setIsTyping(false);
    }, 1000);
  };
  
  const generateMushuResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    
    // Simple keyword responses
    if (lowerMessage.includes('hola') || lowerMessage.includes('hey') || lowerMessage.includes('saludos')) {
      response = "¡Hola! ¿Cómo estás hoy?";
    }
    else if (lowerMessage.includes('cómo estás') || lowerMessage.includes('como estas')) {
      response = "¡Estoy muy bien, gracias por preguntar! ¿Y tú cómo te sientes?";
    }
    else if (lowerMessage.includes('triste') || lowerMessage.includes('mal') || lowerMessage.includes('deprimido')) {
      response = "Lamento que te sientas así. Recuerda que es normal tener días difíciles. ¿Hay algo específico que te preocupe?";
    }
    else if (lowerMessage.includes('feliz') || lowerMessage.includes('bien') || lowerMessage.includes('contento')) {
      response = "¡Me alegra mucho escuchar eso! ¿Qué ha hecho que tu día sea especial?";
    }
    else if (lowerMessage.includes('gracias') || lowerMessage.includes('te quiero')) {
      response = "¡De nada! Estoy aquí para apoyarte en tu viaje. ¿Hay algo más en lo que pueda ayudarte?";
    }
    else if (lowerMessage.includes('misión') || lowerMessage.includes('tarea') || lowerMessage.includes('objetivo')) {
      const activeMissions = getActiveMissions();
      if (activeMissions.length > 0) {
        response = `Tienes ${activeMissions.length} misiones pendientes. La próxima es: "${activeMissions[0].title}". ¡Ánimo, sé que puedes completarla!`;
      } else {
        response = "¡No tienes misiones pendientes! ¿Te gustaría crear una nueva?";
      }
    }
    else if (lowerMessage.includes('consejo') || lowerMessage.includes('ayuda')) {
      const tips = [
        "Recuerda tomar pequeños descansos durante el día para recargar energía.",
        "La respiración profunda es una excelente técnica para manejar momentos de estrés.",
        "Celebra tus pequeños logros, ¡cada paso cuenta en tu desarrollo!",
        "Mantener una rutina regular puede ayudarte a sentirte más estable.",
        "No olvides hidratarte y alimentarte adecuadamente durante el día."
      ];
      response = tips[Math.floor(Math.random() * tips.length)];
    }
    else {
      // Generic responses for anything else
      const genericResponses = [
        "Eso suena interesante. Cuéntame más.",
        "Entiendo. ¿Y cómo te hace sentir eso?",
        "Estoy escuchando. ¿Hay algo más que quieras compartir?",
        "Gracias por contármelo. Estoy aquí para ti.",
        "¿Qué más hay en tu mente hoy?",
        "Interesante perspectiva. ¿Has pensado en...?",
        "Mmm, eso me da que pensar. ¿Qué crees que deberías hacer?",
        "Estoy procesando lo que me cuentas. ¿Te gustaría hablar más sobre ello?"
      ];
      response = genericResponses[Math.floor(Math.random() * genericResponses.length)];
    }
    
    // Add Mushu's response
    addChatMessage('mushu', response);
    
    // Check if this is the first chat (mission completion)
    const chatMission = getActiveMissions().find(
      m => !m.completed && m.title.toLowerCase().includes('chat with mushu')
    );
    
    if (chatMission) {
      toast({
        title: "¡Misión completada!",
        description: "Has completado tu primera conversación con Mushu"
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-mushu-light to-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button 
            onClick={() => navigate('/menu')} 
            className="flex items-center text-mushu-dark"
          >
            <ArrowLeft size={20} className="mr-1" />
            Volver
          </button>
          <h1 className="text-xl font-bold text-mushu-dark">Chat con Mushu</h1>
          <div></div> {/* Empty div for flex alignment */}
        </div>
      </div>
      
      {/* Chat container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4"
        style={{ maxHeight: 'calc(100vh - 140px)' }}
      >
        <div className="max-w-md mx-auto">
          {chatHistory.map(msg => (
            <div 
              key={msg.id}
              className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'mushu' && (
                <div className="mr-2 flex-shrink-0">
                  <MushuAvatar size="sm" />
                </div>
              )}
              
              <div 
                className={`
                  max-w-[80%] p-3 rounded-lg
                  ${msg.sender === 'user' 
                    ? 'bg-mushu-primary text-white rounded-tr-none' 
                    : 'bg-white border border-gray-200 rounded-tl-none'}
                `}
              >
                {msg.text}
              </div>
              
              {msg.sender === 'user' && (
                <div className="ml-2 w-8 h-8 bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
                  {/* User avatar placeholder */}
                  <div className="w-full h-full flex items-center justify-center">
                    {user?.name?.charAt(0)}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-center mb-4">
              <MushuAvatar size="sm" />
              <div className="ml-2 bg-white border border-gray-200 p-3 rounded-lg rounded-tl-none">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Message input */}
      <div className="p-4 border-t bg-white">
        <div className="max-w-md mx-auto flex items-center">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 rpg-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
          />
          <Button
            onClick={handleSendMessage}
            className="ml-2 rpg-button"
            disabled={!message.trim() || isTyping}
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
