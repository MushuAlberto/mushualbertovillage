
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
import { ArrowLeft, Send, Trash2 } from 'lucide-react';

const ChatBot: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const { mushuState, addChatMessage, getChatHistory, clearChatHistory } = useMushu();
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
    const userContext = {
      name: user?.name || 'Usuario',
      emotion: currentEmotion?.emotion || 'normal',
      previousMessages: chatHistory.slice(-5).map(m => m.text), // Use recent context
      activeMissions: getActiveMissions().map(m => m.title)
    };
    
    let response = '';
    
    // Enhanced response system that considers user context and chat history
    if (lowerMessage.includes('hola') || lowerMessage.includes('hey') || lowerMessage.includes('saludos')) {
      if (chatHistory.length > 5) {
        response = `¡Hola de nuevo, ${userContext.name}! ¿En qué más puedo ayudarte hoy?`;
      } else {
        response = `¡Hola, ${userContext.name}! ¿Cómo puedo ayudarte hoy?`;
      }
    }
    else if (lowerMessage.includes('cómo estás') || lowerMessage.includes('como estas')) {
      response = "¡Estoy muy bien, gracias por preguntar! Estoy aquí para ayudarte en lo que necesites. ¿Y tú cómo te sientes hoy?";
    }
    else if (lowerMessage.includes('triste') || lowerMessage.includes('mal') || lowerMessage.includes('deprimido')) {
      response = "Lamento que te sientas así. Recuerda que es normal tener días difíciles. ¿Te gustaría hablar sobre ello o prefieres que te sugiera alguna actividad para animarte?";
    }
    else if (lowerMessage.includes('feliz') || lowerMessage.includes('bien') || lowerMessage.includes('contento')) {
      response = `¡Me alegra mucho escuchar eso, ${userContext.name}! ¿Hay algo en especial que haya contribuido a tu buen ánimo?`;
    }
    else if (lowerMessage.includes('gracias') || lowerMessage.includes('te quiero')) {
      response = "¡De nada! Siempre es un placer ayudarte. Estoy aquí para apoyarte en tu viaje. ¿Hay algo más en lo que pueda asistirte?";
    }
    else if (lowerMessage.includes('misión') || lowerMessage.includes('tarea') || lowerMessage.includes('objetivo')) {
      const activeMissions = getActiveMissions();
      if (activeMissions.length > 0) {
        response = `Tienes ${activeMissions.length} misiones pendientes. La próxima es: "${activeMissions[0].title}". ¡Ánimo, ${userContext.name}, sé que puedes completarla!`;
      } else {
        response = `¡No tienes misiones pendientes, ${userContext.name}! ¿Te gustaría crear una nueva?`;
      }
    }
    else if (lowerMessage.includes('mindfulness') || lowerMessage.includes('meditación') || lowerMessage.includes('meditar')) {
      response = "El mindfulness y la meditación son excelentes prácticas para mejorar tu bienestar. Te recomiendo visitar el Jardín Mindfulness, donde encontrarás actividades guiadas. ¿Te gustaría ir allí ahora?";
    }
    else if (lowerMessage.includes('ejercicio') || lowerMessage.includes('gimnasio') || lowerMessage.includes('entrenar')) {
      response = "El ejercicio físico es fundamental para mantener un equilibrio mental y físico. En el gimnasio encontrarás rutinas adaptadas a tus necesidades. ¿Quieres que te acompañe allí?";
    }
    else if (lowerMessage.includes('consejo') || lowerMessage.includes('ayuda')) {
      const tips = [
        `${userContext.name}, recuerda tomar pequeños descansos durante el día para recargar energía.`,
        "La respiración profunda es una excelente técnica para manejar momentos de estrés. Inhala por 4 segundos, mantén por 4 y exhala por 6.",
        `Celebra tus pequeños logros, ${userContext.name}. ¡Cada paso cuenta en tu desarrollo!`,
        "Mantener una rutina regular puede ayudarte a sentirte más estable y en control.",
        "No olvides hidratarte y alimentarte adecuadamente durante el día. Tu cuerpo te lo agradecerá."
      ];
      
      // Choose tip based on their emotional state if available
      if (userContext.emotion === 'anxious') {
        response = "Para momentos de ansiedad, te sugiero practicar la técnica 5-4-3-2-1: identifica 5 cosas que puedes ver, 4 que puedes tocar, 3 que puedes oír, 2 olores y 1 sabor. Esto te ayudará a anclarte al presente.";
      } else if (userContext.emotion === 'sad') {
        response = "Cuando nos sentimos tristes, a veces ayuda cambiar el entorno. ¿Qué te parece dar un pequeño paseo o abrir las ventanas para dejar entrar aire fresco?";
      } else {
        response = tips[Math.floor(Math.random() * tips.length)];
      }
    }
    else if (lowerMessage.includes('chiste') || lowerMessage.includes('broma')) {
      const jokes = [
        "¿Por qué los pájaros no usan Facebook? Porque ya tienen Twitter.",
        "¿Qué hace una abeja en el gimnasio? ¡Zum-ba!",
        "¿Sabes qué le dice un jaguar a otro? Jaguar you.",
        "¿Por qué el libro de matemáticas se sentía triste? Porque tenía muchos problemas.",
        "¿Qué le dice un pez a otro? Nada."
      ];
      response = jokes[Math.floor(Math.random() * jokes.length)] + " 😄";
    }
    else {
      // More context-aware generic responses
      if (chatHistory.length > 10) {
        // For users with longer chat histories, use more personalized responses
        const genericResponses = [
          `Entiendo, ${userContext.name}. ¿Y cómo te hace sentir eso?`,
          "Gracias por compartir eso conmigo. ¿Hay algo específico en lo que pueda ayudarte al respecto?",
          `Interesante perspectiva, ${userContext.name}. ¿Has considerado también...?`,
          "Estoy procesando lo que me cuentas. ¿Te gustaría profundizar más en este tema?",
          "Basado en nuestras conversaciones anteriores, creo que podría interesarte explorar más sobre este tema."
        ];
        response = genericResponses[Math.floor(Math.random() * genericResponses.length)];
      } else {
        // For newer users
        const genericResponses = [
          "Eso suena interesante. ¿Podrías contarme más al respecto?",
          "Estoy escuchando. ¿Hay algo específico que quieras compartir conmigo?",
          `Gracias por contármelo, ${userContext.name}. Estoy aquí para ayudarte.`,
          "¿Qué más hay en tu mente hoy?",
          "Estoy aprendiendo más sobre ti con cada conversación."
        ];
        response = genericResponses[Math.floor(Math.random() * genericResponses.length)];
      }
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
  
  const handleClearChat = () => {
    if (confirm("¿Estás seguro de que quieres borrar todo el historial de chat?")) {
      clearChatHistory();
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
          <button 
            onClick={handleClearChat}
            className="flex items-center text-gray-500 hover:text-red-500 transition-colors"
            title="Borrar historial"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      {/* Chat container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4"
        style={{ maxHeight: 'calc(100vh - 140px)' }}
      >
        <div className="max-w-md mx-auto">
          {chatHistory.length > 0 ? (
            chatHistory.map(msg => (
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
                    <div className="w-full h-full flex items-center justify-center">
                      {user?.name?.charAt(0)}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 mt-8">
              <p>Inicia una conversación con Mushu</p>
            </div>
          )}
          
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
