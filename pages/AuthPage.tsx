import React, { useState } from 'react';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { authService } from '../services/authService';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useTheme } from '../hooks/useTheme';

type AuthMode = 'login' | 'register';

export const AuthPage: React.FC = () => {
  useTheme(); // Ensure theme is applied
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === 'register' && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'register') {
        const { user } = await authService.signUpWithEmail({ email, password });
        if (user) {
          setMessage('¡Registro exitoso! Por favor, revisa tu correo electrónico para confirmar tu cuenta si es necesario. Serás redirigido.');
          // Supabase onAuthStateChange in App.tsx will handle redirect/UI update.
        } else {
            setMessage('Registro completado. Esperando confirmación...');
        }
      } else {
        await authService.signInWithEmail({ email, password });
        // Supabase onAuthStateChange in App.tsx will handle redirect/UI update.
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-400 via-yellow-200 to-teal-500 dark:from-neutral-800 dark:via-neutral-900 dark:to-teal-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <img src="assets/mushu_alberto.png" alt="Mushu Alberto Logo" className="w-24 h-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-teal-700 dark:text-teal-300">Bienvenido a Mushu Alberto</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Tu compañero emocional inteligente.</p>
        </div>

        <div className="flex mb-6 border-b border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => { setMode('login'); setError(null); setMessage(null);}}
            className={`flex-1 py-3 text-sm font-medium focus:outline-none transition-colors duration-150 ${
              mode === 'login' ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400' : 'text-neutral-500 dark:text-neutral-400 hover:text-teal-500 dark:hover:text-teal-300'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); setMessage(null);}}
            className={`flex-1 py-3 text-sm font-medium focus:outline-none transition-colors duration-150 ${
              mode === 'register' ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400' : 'text-neutral-500 dark:text-neutral-400 hover:text-teal-500 dark:hover:text-teal-300'
            }`}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white dark:bg-neutral-700 dark:text-neutral-100 placeholder-neutral-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white dark:bg-neutral-700 dark:text-neutral-100 placeholder-neutral-400"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white dark:bg-neutral-700 dark:text-neutral-100 placeholder-neutral-400"
              />
            </div>
          )}
          
          {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
          {message && <p className="text-sm text-green-600 dark:text-green-400 text-center">{message}</p>}

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-3 text-base"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" color="text-white"/> : (mode === 'login' ? 'Iniciar Sesión' : 'Registrarse')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};