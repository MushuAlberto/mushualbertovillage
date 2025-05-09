
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '../contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useUser();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        // Login
        const success = await login(formData.email, formData.password);
        if (success) {
          toast({
            title: "¡Inicio de sesión exitoso!",
            description: "Bienvenido de vuelta a MushuMind",
          });
          navigate('/emotion-check');
        } else {
          toast({
            title: "Error de inicio de sesión",
            description: "Por favor verifica tus credenciales e inténtalo de nuevo",
            variant: "destructive"
          });
        }
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Error de registro",
            description: "Las contraseñas no coinciden",
            variant: "destructive"
          });
          return;
        }
        
        const success = await register(formData.name, formData.email, formData.password);
        if (success) {
          toast({
            title: "¡Registro exitoso!",
            description: "Bienvenido a MushuMind",
          });
          navigate('/emotion-check');
        } else {
          toast({
            title: "Error de registro",
            description: "No se pudo completar el registro. Por favor inténtalo de nuevo",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un problema. Por favor inténtalo más tarde",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const toggleMode = () => {
    setIsLogin(!isLogin);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-mushu-light to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rpg-dialog mb-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            {isLogin ? 'Inicia Sesión' : 'Crea una cuenta'}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="rpg-input w-full"
                  placeholder="Tu nombre"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="rpg-input w-full"
                placeholder="tu@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Contraseña</label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="rpg-input w-full"
                placeholder="••••••••"
              />
            </div>
            
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-1">Confirmar Contraseña</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={!isLogin}
                  className="rpg-input w-full"
                  placeholder="••••••••"
                />
              </div>
            )}
            
            <Button
              type="submit"
              className="rpg-button w-full"
              disabled={loading}
            >
              {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button 
              onClick={toggleMode}
              className="text-mushu-dark hover:underline"
            >
              {isLogin 
                ? '¿No tienes una cuenta? Regístrate' 
                : '¿Ya tienes una cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
