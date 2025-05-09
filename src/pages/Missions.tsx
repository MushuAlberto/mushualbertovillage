
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { useMission, Mission } from '../contexts/MissionContext';
import MissionCard from '../components/MissionCard';
import XPBar from '../components/XPBar';
import { useUser } from '../contexts/UserContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ArrowLeft } from 'lucide-react';

const Missions: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const { 
    missions, 
    addMission, 
    completeMission, 
    deleteMission, 
    editMission,
    getActiveMissions,
    getCompletedMissions
  } = useMission();
  
  const [showNewMissionForm, setShowNewMissionForm] = useState<boolean>(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    difficulty: 'easy' as Mission['difficulty'],
    type: 'daily' as Mission['type'],
    xpReward: 50,
    dueDate: '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMission(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setNewMission(prev => ({ 
      ...prev, 
      [name]: value,
      // Update XP reward based on difficulty
      xpReward: name === 'difficulty' ? 
        value === 'easy' ? 50 : value === 'medium' ? 100 : 150 
        : prev.xpReward
    }));
  };
  
  const handleAddMission = () => {
    if (!newMission.title) {
      toast({
        title: "Título requerido",
        description: "Por favor ingresa un título para la misión",
        variant: "destructive"
      });
      return;
    }
    
    addMission({
      title: newMission.title,
      description: newMission.description,
      difficulty: newMission.difficulty,
      type: newMission.type,
      xpReward: newMission.xpReward,
      dueDate: newMission.dueDate || undefined
    });
    
    // Reset form
    setNewMission({
      title: '',
      description: '',
      difficulty: 'easy',
      type: 'daily',
      xpReward: 50,
      dueDate: '',
    });
    
    setShowNewMissionForm(false);
    
    toast({
      title: "Misión agregada",
      description: "Tu nueva misión ha sido creada con éxito"
    });
  };
  
  const handleEditMission = () => {
    if (!editingMission) return;
    
    editMission(editingMission.id, {
      title: editingMission.title,
      description: editingMission.description,
      difficulty: editingMission.difficulty,
      type: editingMission.type,
      xpReward: editingMission.xpReward,
      dueDate: editingMission.dueDate
    });
    
    setEditingMission(null);
    
    toast({
      title: "Misión actualizada",
      description: "Los cambios han sido guardados"
    });
  };
  
  const handleCompleteMission = (id: string) => {
    completeMission(id);
    
    toast({
      title: "¡Misión completada!",
      description: "Has ganado XP por completar esta misión"
    });
  };
  
  const handleDeleteMission = (id: string) => {
    deleteMission(id);
    
    toast({
      title: "Misión eliminada",
      description: "La misión ha sido eliminada con éxito"
    });
  };
  
  const activeMissions = getActiveMissions();
  const completedMissions = getCompletedMissions();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-mushu-light to-white p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate('/menu')} 
            className="flex items-center text-mushu-dark"
          >
            <ArrowLeft size={20} className="mr-1" />
            Volver
          </button>
          <h1 className="text-2xl font-bold text-mushu-dark">Misiones</h1>
          <div></div> {/* Empty div for flex alignment */}
        </div>
        
        {user && (
          <div className="mb-4">
            <XPBar />
          </div>
        )}
        
        <Tabs defaultValue="active">
          <TabsList className="mb-4 grid grid-cols-2">
            <TabsTrigger value="active">Activas ({activeMissions.length})</TabsTrigger>
            <TabsTrigger value="completed">Completadas ({completedMissions.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            <div>
              {/* Add new mission button */}
              <Dialog open={showNewMissionForm} onOpenChange={setShowNewMissionForm}>
                <DialogTrigger asChild>
                  <Button className="rpg-button w-full mb-4">
                    <Plus size={16} className="mr-2" />
                    Nueva Misión
                  </Button>
                </DialogTrigger>
                
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Misión</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Título</label>
                      <Input
                        name="title"
                        value={newMission.title}
                        onChange={handleInputChange}
                        placeholder="Nombre de la misión"
                        className="rpg-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Descripción</label>
                      <Textarea
                        name="description"
                        value={newMission.description}
                        onChange={handleInputChange}
                        placeholder="Describe tu misión..."
                        className="rpg-input"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Dificultad</label>
                        <Select 
                          value={newMission.difficulty} 
                          onValueChange={value => handleSelectChange('difficulty', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Fácil (50 XP)</SelectItem>
                            <SelectItem value="medium">Media (100 XP)</SelectItem>
                            <SelectItem value="hard">Difícil (150 XP)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Tipo</label>
                        <Select 
                          value={newMission.type} 
                          onValueChange={value => handleSelectChange('type', value as Mission['type'])}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Diaria</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="one-time">Una vez</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Fecha límite (opcional)</label>
                      <Input
                        type="date"
                        name="dueDate"
                        value={newMission.dueDate}
                        onChange={handleInputChange}
                        className="rpg-input"
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewMissionForm(false)}>
                      Cancelar
                    </Button>
                    <Button className="rpg-button" onClick={handleAddMission}>
                      Guardar Misión
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {/* Active missions list */}
              {activeMissions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No tienes misiones activas.</p>
                </div>
              ) : (
                <div>
                  {activeMissions.map(mission => (
                    <MissionCard
                      key={mission.id}
                      mission={mission}
                      onComplete={() => handleCompleteMission(mission.id)}
                      onDelete={() => handleDeleteMission(mission.id)}
                      onEdit={() => setEditingMission(mission)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="completed">
            {completedMissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No has completado misiones aún.</p>
              </div>
            ) : (
              <div>
                {completedMissions.map(mission => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    onComplete={() => {}}
                    onDelete={() => handleDeleteMission(mission.id)}
                    onEdit={() => {}}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Edit Mission Dialog */}
        <Dialog 
          open={!!editingMission} 
          onOpenChange={(open) => !open && setEditingMission(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Misión</DialogTitle>
            </DialogHeader>
            
            {editingMission && (
              <div className="space-y-4 py-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título</label>
                  <Input
                    value={editingMission.title}
                    onChange={(e) => setEditingMission({
                      ...editingMission,
                      title: e.target.value
                    })}
                    className="rpg-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <Textarea
                    value={editingMission.description}
                    onChange={(e) => setEditingMission({
                      ...editingMission,
                      description: e.target.value
                    })}
                    className="rpg-input"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Dificultad</label>
                    <Select 
                      value={editingMission.difficulty} 
                      onValueChange={value => setEditingMission({
                        ...editingMission,
                        difficulty: value as Mission['difficulty']
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Fácil</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="hard">Difícil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo</label>
                    <Select 
                      value={editingMission.type} 
                      onValueChange={value => setEditingMission({
                        ...editingMission,
                        type: value as Mission['type']
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diaria</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="one-time">Una vez</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha límite (opcional)</label>
                  <Input
                    type="date"
                    value={editingMission.dueDate || ''}
                    onChange={(e) => setEditingMission({
                      ...editingMission,
                      dueDate: e.target.value
                    })}
                    className="rpg-input"
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingMission(null)}>
                Cancelar
              </Button>
              <Button className="rpg-button" onClick={handleEditMission}>
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Missions;
