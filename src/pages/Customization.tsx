
import React, { useState } from 'react';
import { useMushu } from '../contexts/MushuContext';
import { useUser } from '../contexts/UserContext';
import MushuAvatar from '../components/MushuAvatar';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shirt, User2, Glasses, Footprints } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccessoryProps {
  accessory: any;
  isEquipped: boolean;
  isLocked: boolean;
  onEquip: () => void;
}

const AccessoryItem: React.FC<AccessoryProps> = ({ 
  accessory, 
  isEquipped, 
  isLocked, 
  onEquip 
}) => {
  return (
    <div className={`
      p-3 border rounded-md ${isEquipped ? 'border-mushu-secondary bg-mushu-light' : 'border-gray-200'}
      ${isLocked ? 'opacity-50' : ''}
    `}>
      <div className="flex justify-between items-center">
        <div className="font-medium">{accessory.name}</div>
        <div className="text-xs px-2 py-1 bg-gray-100 rounded">
          {accessory.type}
        </div>
      </div>
      
      <div className="my-2 text-sm">
        {accessory.description}
      </div>

      {isLocked ? (
        <div className="text-xs text-gray-500">
          Desbloquear: {accessory.unlockCondition}
        </div>
      ) : (
        <Button
          size="sm"
          onClick={onEquip}
          className={isEquipped ? 'bg-mushu-secondary' : ''}
          disabled={isLocked}
        >
          {isEquipped ? 'Equipado' : 'Equipar'}
        </Button>
      )}
    </div>
  );
};

const Customization: React.FC = () => {
  const { mushuState, equipAccessory } = useMushu();
  const { user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Filter accessories based on active tab
  const getFilteredAccessories = () => {
    if (activeTab === 'all') {
      return mushuState.accessories;
    } else {
      return mushuState.accessories.filter(acc => acc.type === activeTab);
    }
  };
  
  const handleEquipAccessory = (accessoryId: string) => {
    equipAccessory(accessoryId, true);
    toast({
      title: "Accesorio equipado",
      description: "Has cambiado la apariencia de Mushu",
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-mushu-light to-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-mushu-dark mb-6 text-center">
          Personalización
        </h1>
        
        <div className="flex justify-center mb-6">
          <MushuAvatar size="xl" animate={true} />
        </div>
        
        <div className="rpg-border mb-6">
          <div className="text-center mb-3">
            <h2 className="text-xl font-bold">{user?.name || 'Usuario'}</h2>
            <p className="text-sm">Personaliza a tu compañero Mushu</p>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="hat">
              <User2 size={18} />
            </TabsTrigger>
            <TabsTrigger value="glasses">
              <Glasses size={18} />
            </TabsTrigger>
            <TabsTrigger value="outfit">
              <Shirt size={18} />
            </TabsTrigger>
            <TabsTrigger value="shoes">
              <Footprints size={18} />
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            {getFilteredAccessories().map(accessory => (
              <AccessoryItem
                key={accessory.id}
                accessory={accessory}
                isEquipped={accessory.equipped}
                isLocked={!accessory.unlocked}
                onEquip={() => handleEquipAccessory(accessory.id)}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Customization;
