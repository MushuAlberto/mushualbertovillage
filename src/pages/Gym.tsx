
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MushuAvatar from '../components/MushuAvatar';
import { Dumbbell } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'Fácil' | 'Intermedio' | 'Difícil';
  type: 'cardio' | 'fuerza' | 'flexibilidad';
}

const Gym: React.FC = () => {
  const navigate = useNavigate();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  // Sample exercise data
  const exercises: Exercise[] = [
    {
      id: 'ex1',
      name: 'Saltos de tijera',
      description: 'Ponte de pie con las piernas juntas y los brazos a los lados. Salta abriendo las piernas y subiendo los brazos por encima de la cabeza.',
      duration: '2 minutos',
      difficulty: 'Fácil',
      type: 'cardio'
    },
    {
      id: 'ex2',
      name: 'Flexiones',
      description: 'Colócate en posición de tabla con las manos apoyadas en el suelo a la altura de los hombros. Baja el cuerpo doblando los codos y luego sube.',
      duration: '10 repeticiones',
      difficulty: 'Intermedio',
      type: 'fuerza'
    },
    {
      id: 'ex3',
      name: 'Estiramiento de espalda',
      description: 'Siéntate con las piernas estiradas. Inclina el torso hacia adelante intentando tocar los pies con las manos.',
      duration: '30 segundos',
      difficulty: 'Fácil',
      type: 'flexibilidad'
    },
    {
      id: 'ex4',
      name: 'Sentadillas',
      description: 'De pie con los pies separados al ancho de los hombros, baja el cuerpo doblando las rodillas como si fueras a sentarte.',
      duration: '15 repeticiones',
      difficulty: 'Intermedio',
      type: 'fuerza'
    },
    {
      id: 'ex5',
      name: 'Correr en el sitio',
      description: 'Corre en el mismo lugar levantando las rodillas lo más alto posible.',
      duration: '1 minuto',
      difficulty: 'Fácil',
      type: 'cardio'
    },
  ];
  
  // Filter exercises by type
  const getExercisesByType = (type: string) => {
    if (type === 'all') return exercises;
    return exercises.filter(ex => ex.type === type);
  };
  
  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-300 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigate('/')}>
            ← Volver al Pueblo
          </Button>
          <h1 className="text-2xl font-bold">Gimnasio</h1>
          <Button variant="outline" onClick={() => navigate('/menu')}>
            Menú
          </Button>
        </div>
        
        <div className="mb-6 flex justify-center">
          <MushuAvatar size="lg" mood="excited" />
        </div>
        
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <div className="flex items-center">
              <Dumbbell className="mr-2" />
              <h2 className="text-xl font-bold">¡Bienvenido al Gimnasio!</h2>
            </div>
            <p className="text-sm text-gray-600">
              Aquí puedes encontrar ejercicios para mantenerte activo y saludable.
              ¿Qué tipo de ejercicio te gustaría hacer hoy?
            </p>
          </CardHeader>
        </Card>
        
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="cardio">Cardio</TabsTrigger>
            <TabsTrigger value="fuerza">Fuerza</TabsTrigger>
            <TabsTrigger value="flexibilidad">Flexibilidad</TabsTrigger>
          </TabsList>
          
          {['all', 'cardio', 'fuerza', 'flexibilidad'].map(tabValue => (
            <TabsContent key={tabValue} value={tabValue} className="space-y-4">
              {getExercisesByType(tabValue).map(exercise => (
                <Card 
                  key={exercise.id}
                  className={`cursor-pointer transition-all hover:shadow-md
                    ${selectedExercise?.id === exercise.id ? 'border-blue-500 bg-blue-50' : ''}`}
                  onClick={() => handleSelectExercise(exercise)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold">{exercise.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full
                        ${exercise.difficulty === 'Fácil' ? 'bg-green-100 text-green-600' : 
                          exercise.difficulty === 'Intermedio' ? 'bg-yellow-100 text-yellow-600' : 
                          'bg-red-100 text-red-600'}`}
                      >
                        {exercise.difficulty}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{exercise.duration}</div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
        
        {selectedExercise && (
          <Card className="mb-6 bg-white shadow-lg">
            <CardHeader>
              <h3 className="text-xl font-bold">{selectedExercise.name}</h3>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Duración: {selectedExercise.duration}</span>
                <span className={`text-xs px-2 py-1 rounded-full
                  ${selectedExercise.difficulty === 'Fácil' ? 'bg-green-100 text-green-600' : 
                    selectedExercise.difficulty === 'Intermedio' ? 'bg-yellow-100 text-yellow-600' : 
                    'bg-red-100 text-red-600'}`}
                >
                  {selectedExercise.difficulty}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p>{selectedExercise.description}</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-mushu-primary hover:bg-mushu-dark">
                Comenzar ejercicio
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Gym;
