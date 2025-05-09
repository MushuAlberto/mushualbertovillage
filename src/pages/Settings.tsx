
import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Volume2, 
  Moon, 
  RefreshCw, 
  Languages, 
  LogOut
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Settings: React.FC = () => {
  const { user, logout, resetUserData } = useUser();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    darkMode: false,
    language: 'es'
  });
  
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  
  const handleSettingChange = (setting: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    
    toast({
      title: "Configuración guardada",
      description: "Tus preferencias han sido actualizadas"
    });
  };
  
  const handleResetData = () => {
    resetUserData();
    setResetDialogOpen(false);
    
    toast({
      title: "Datos reiniciados",
      description: "Todos tus datos han sido reiniciados"
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-mushu-light to-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-mushu-dark mb-6 text-center">
          Configuración
        </h1>
        
        <div className="rpg-border mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-mushu-accent rounded-full flex items-center justify-center">
              <span className="text-xl font-bold">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            <div>
              <div className="font-bold">{user?.name || 'Usuario'}</div>
              <div className="text-sm text-gray-500">{user?.email || 'usuario@example.com'}</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Notifications */}
          <div className="rpg-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell size={18} />
                <Label htmlFor="notifications">Notificaciones</Label>
              </div>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
              />
            </div>
          </div>
          
          {/* Sound */}
          <div className="rpg-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Volume2 size={18} />
                <Label htmlFor="sound">Sonido</Label>
              </div>
              <Switch
                id="sound"
                checked={settings.sound}
                onCheckedChange={(checked) => handleSettingChange('sound', checked)}
              />
            </div>
          </div>
          
          {/* Dark Mode */}
          <div className="rpg-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Moon size={18} />
                <Label htmlFor="darkMode">Modo Oscuro</Label>
              </div>
              <Switch
                id="darkMode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
              />
            </div>
          </div>
          
          {/* Language */}
          <div className="rpg-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Languages size={18} />
                <Label htmlFor="language">Idioma</Label>
              </div>
              <select
                id="language"
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="rpg-input px-3 py-1"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
          
          {/* Reset Data */}
          <div className="rpg-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RefreshCw size={18} />
                <Label>Reiniciar Datos</Label>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setResetDialogOpen(true)}
              >
                Reiniciar
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Esta acción eliminará todo tu progreso y no se puede deshacer.
            </p>
          </div>
          
          {/* Logout */}
          <div className="mt-8">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={logout}
            >
              <LogOut size={16} className="mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
      
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará todo tu progreso, incluyendo misiones, logros, y personalización.
              No podrás recuperar estos datos después.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetData}>
              Sí, reiniciar datos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
