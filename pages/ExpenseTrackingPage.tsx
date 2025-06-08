
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { PageShell } from '../components/shared/PageShell';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { WalletIcon, PlusIcon, TrashIcon, EditIcon, MicrophoneIcon, StopCircleIcon, SparklesIcon } from '../components/icons';
import { Transaction, TransactionType, PredefinedCategory, CurrencyCode, CurrencySetting, SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent, SpeechRecognitionStatic } from '../types'; // Imported Speech API types
import { PREDEFINED_EXPENSE_CATEGORIES, PREDEFINED_INCOME_CATEGORIES, SUPPORTED_CURRENCIES } from '../constants';
import { ExpenseChart } from '../components/shared/ExpenseChart';
import { formatCurrency } from '../utils/currency';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { extractTransactionFromText } from '../services/geminiService';

interface ExpenseTrackingPageProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  selectedCurrencyCode: CurrencyCode;
  setSelectedCurrencyCode: React.Dispatch<React.SetStateAction<CurrencyCode>>;
}

type ViewState = 'list' | 'selectInputMethod' | 'manualForm' | 'voiceInput';

const TransactionForm: React.FC<{
  onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  initialData?: Partial<Omit<Transaction, 'id' | 'createdAt'>>;
  onCancel: () => void;
  selectedCurrencyCode: CurrencyCode;
}> = ({ onSubmit, initialData, onCancel, selectedCurrencyCode }) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [category, setCategory] = useState(initialData?.category || '');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(initialData?.description || '');

  const availableCategories = useMemo(() => (type === 'expense' ? PREDEFINED_EXPENSE_CATEGORIES : PREDEFINED_INCOME_CATEGORIES), [type]);

  useEffect(() => {
    if (initialData) {
        const initialType = initialData.type || 'expense';
        setType(initialType);
        
        const categoriesForType = initialType === 'income' ? PREDEFINED_INCOME_CATEGORIES : PREDEFINED_EXPENSE_CATEGORIES;
        setCategory(initialData.category && categoriesForType.some(c => c.name === initialData.category) 
            ? initialData.category 
            : categoriesForType[0]?.name || '');
        
        setAmount(initialData.amount?.toString() || '');
        setDate(initialData.date || new Date().toISOString().split('T')[0]);
        setDescription(initialData.description || '');
    } else {
        // Reset form for purely new manual entry
        setType('expense');
        setCategory(PREDEFINED_EXPENSE_CATEGORIES[0]?.name || '');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
    }
  }, [initialData]);

   useEffect(() => {
    // Adjust category if type changes and current category is not valid for the new type
    if (!availableCategories.some(cat => cat.name === category)) {
      setCategory(availableCategories[0]?.name || '');
    }
  }, [type, category, availableCategories]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim() || !amount || Number(amount) <= 0 || !date) {
        alert("Por favor, completa todos los campos obligatorios: Categoría, Monto y Fecha. El monto debe ser mayor a cero.");
        return;
    }
    onSubmit({
      type,
      category,
      amount: Number(amount),
      date,
      description: description.trim() || undefined,
    });
  };

  const formTitle = initialData && (initialData.type || initialData.category || initialData.amount) 
    ? "Revisar Transacción (IA)" 
    : "Nueva Transacción Manual";

  return (
    <Card className="mb-6 bg-neutral-50 dark:bg-neutral-800/30" title={formTitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Tipo</label>
          <div className="flex space-x-4">
            {(['expense', 'income'] as TransactionType[]).map(t => (
              <label key={t} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value={t}
                  checked={type === t}
                  onChange={() => setType(t)}
                  className="h-4 w-4 text-teal-600 border-neutral-300 focus:ring-teal-500 dark:border-neutral-500 dark:checked:bg-teal-500 dark:focus:ring-teal-600"
                />
                <span className={`capitalize ${type === t ? 'text-teal-700 dark:text-teal-300 font-semibold': 'text-neutral-600 dark:text-neutral-400'}`}>
                  {t === 'expense' ? 'Gasto' : 'Ingreso'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Categoría <span className="text-red-500">*</span></label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100 dark:placeholder-neutral-400"
            required
          >
            {availableCategories.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
            ))}
             {!availableCategories.some(cat => cat.name === category) && category && <option value={category} disabled>{category} (Inválida)</option>}
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Monto ({selectedCurrencyCode}) <span className="text-red-500">*</span></label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100 dark:placeholder-neutral-400"
            required
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Fecha <span className="text-red-500">*</span></label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100 dark:placeholder-neutral-400"
            style={{ colorScheme: 'dark' }}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Descripción (opcional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100 dark:placeholder-neutral-400"
          />
        </div>
        <div className="flex items-center justify-end space-x-3 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" leftIcon={<PlusIcon className="w-4 h-4"/>}>{initialData && (initialData.type || initialData.category || initialData.amount)  ? 'Confirmar Transacción' : 'Añadir Transacción'}</Button>
        </div>
      </form>
    </Card>
  );
};


export const ExpenseTrackingPage: React.FC<ExpenseTrackingPageProps> = ({ 
    transactions, 
    setTransactions, 
    selectedCurrencyCode, 
    setSelectedCurrencyCode 
}) => {
  const [viewState, setViewState] = useState<ViewState>('list');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [preparedTransactionDataForForm, setPreparedTransactionDataForForm] = useState<Partial<Omit<Transaction, 'id' | 'createdAt'>> | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [voiceInputText, setVoiceInputText] = useState('');
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const SpeechRecognitionAPI = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : undefined;

  useEffect(() => {
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false; // We want a single utterance
      recognitionRef.current.interimResults = false; // Only final results
      recognitionRef.current.lang = navigator.language || 'es-ES';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const speechResult = event.results[event.results.length -1][0].transcript; // Get the last result which is final
        setVoiceInputText(speechResult);
        // setIsListening(false); // onend will handle this
        setVoiceError(null);
      };
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error, event.message);
        let errorMsg = `Error de reconocimiento: ${event.error}.`;
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            errorMsg = "Permiso para usar el micrófono denegado o servicio no disponible. Por favor, revisa los permisos del navegador.";
        } else if (event.error === 'no-speech') {
            errorMsg = "No se detectó voz. Intenta hablar más claro o verifica tu micrófono.";
        } else if (event.error === 'audio-capture') {
            errorMsg = "Problema al capturar audio. Verifica tu micrófono.";
        }
        setVoiceError(errorMsg);
        setIsListening(false);
      };
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
    }
  }, [SpeechRecognitionAPI]);

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
        setVoiceError("El reconocimiento de voz no es compatible con este navegador o no se ha inicializado.");
        return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      // setIsListening(false); // onend will handle this
    } else {
      setVoiceInputText(''); // Clear previous text
      setVoiceError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e: any) {
        console.error("Error starting speech recognition:", e);
        setVoiceError(`No se pudo iniciar el reconocimiento: ${e.message || 'Error desconocido'}. ¿Permitiste el acceso al micrófono?`);
        setIsListening(false);
      }
    }
  };
  
  const handleProcessVoiceInput = async () => {
    if (!voiceInputText.trim()) {
      setVoiceError("No hay texto para procesar. Por favor, habla primero.");
      return;
    }
    setIsProcessingVoice(true);
    setVoiceError(null);
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const extractedData = await extractTransactionFromText(voiceInputText, currentDate);
      setPreparedTransactionDataForForm(extractedData);
      setEditingTransaction(null); 
      setViewState('manualForm'); 
    } catch (error) {
      console.error("Error processing voice input with AI:", error);
      setVoiceError(error instanceof Error ? error.message : "Error desconocido al procesar la voz.");
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const sortedTransactions = useMemo(() => 
    [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt)
  , [transactions]);

  const balance = useMemo(() => {
    return transactions.reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
  }, [transactions]);

  const handleFormSubmit = (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...editingTransaction, ...transactionData, amount: Number(transactionData.amount) } : t));
    } else { 
      const newTransaction: Transaction = {
        ...transactionData,
        amount: Number(transactionData.amount),
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
    setViewState('list');
    setEditingTransaction(null);
    setPreparedTransactionDataForForm(null);
    setVoiceInputText('');
    setVoiceError(null);
    setIsListening(false);
  };
  
  const handleFormCancel = () => {
    setViewState('list');
    setEditingTransaction(null);
    setPreparedTransactionDataForForm(null);
    setVoiceInputText('');
    setVoiceError(null);
    if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
    }
    setIsListening(false);
    setIsProcessingVoice(false);
  };

  const deleteTransaction = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };
  
  const handleEditExistingTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setPreparedTransactionDataForForm({ 
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.description,
    });
    setViewState('manualForm');
  };

  const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCurrencyCode(event.target.value as CurrencyCode);
  };

  const pageAction = useMemo(() => {
    if (viewState === 'list') {
      return (
        <Button onClick={() => { setViewState('selectInputMethod'); setEditingTransaction(null); setPreparedTransactionDataForForm(null);}} leftIcon={<PlusIcon className="w-5 h-5" />}>
          Nueva Transacción
        </Button>
      );
    }
    return null;
  }, [viewState]);

  return (
    <PageShell 
      title="Mis Finanzas" 
      icon={<WalletIcon className="w-8 h-8" />}
      actionButton={pageAction}
    >
      {viewState === 'selectInputMethod' && (
        <Card title="Selecciona un método de entrada" className="mb-6">
          <div className="space-y-3 md:space-y-0 md:flex md:space-x-3">
            <Button onClick={() => { setPreparedTransactionDataForForm(null); setEditingTransaction(null); setViewState('manualForm'); }} className="w-full md:w-auto" leftIcon={<EditIcon className="w-5 h-5"/>}>
              Ingresar Manualmente
            </Button>
            <Button onClick={() => { 
                setVoiceInputText(''); 
                setVoiceError(null); 
                setPreparedTransactionDataForForm(null); 
                setEditingTransaction(null); 
                setViewState('voiceInput'); 
              }} 
              className="w-full md:w-auto" 
              leftIcon={<MicrophoneIcon className="w-5 h-5"/>}
              disabled={!SpeechRecognitionAPI}
              variant="secondary"
              aria-label="Ingresar con Voz"
            >
              Ingresar con Voz {SpeechRecognitionAPI ? "(Beta)" : "(No Soportado)"}
            </Button>
          </div>
          {!SpeechRecognitionAPI && <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-2">El ingreso por voz no es compatible con este navegador.</p>}
          <div className="mt-4 text-right">
            <Button variant="ghost" onClick={handleFormCancel}>Cancelar</Button>
          </div>
        </Card>
      )}

      {viewState === 'voiceInput' && (
        <Card title="Ingresar Transacción por Voz" className="mb-6">
            <p className="text-neutral-600 dark:text-neutral-300 mb-2 text-sm">
                Presiona el micrófono y di tu transacción. Por ejemplo:
            </p>
            <ul className="text-xs text-neutral-500 dark:text-neutral-400 list-disc list-inside mb-4 space-y-1 pl-4">
                <li>"Gasté 10 euros en comida ayer"</li>
                <li>"Ingreso de 500 por salario el 15 de este mes"</li>
                <li>"Pagué 30 de transporte la semana pasada para el metro"</li>
            </ul>
          
            <div className="flex flex-col items-center space-y-4">
                <Button
                    onClick={handleToggleListening}
                    variant={isListening ? 'danger' : 'primary'}
                    size="lg"
                    className="w-20 h-20 rounded-full p-0"
                    aria-label={isListening ? "Detener grabación" : "Iniciar grabación"}
                    disabled={!SpeechRecognitionAPI}
                >
                    {isListening ? <StopCircleIcon className="w-10 h-10"/> : <MicrophoneIcon className="w-10 h-10"/>}
                </Button>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 h-6 min-h-[1.5rem]">
                    {isListening ? "Escuchando..." : (voiceInputText ? "Grabación finalizada." : (SpeechRecognitionAPI ? "Presiona para hablar" : "Reconocimiento de voz no disponible"))}
                </p>

                {voiceInputText && !isListening && (
                    <div className="w-full p-3 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md text-sm text-neutral-700 dark:text-neutral-200 my-2">
                        <strong>Texto reconocido:</strong> "{voiceInputText}"
                    </div>
                )}
                
                {voiceError && <p className="text-red-500 dark:text-red-400 text-sm mt-2 text-center w-full">{voiceError}</p>}

                <div className="flex w-full space-x-3 pt-3">
                    <Button variant="ghost" onClick={handleFormCancel} className="flex-1">Cancelar</Button>
                    <Button 
                        onClick={handleProcessVoiceInput} 
                        disabled={!voiceInputText.trim() || isListening || isProcessingVoice || !SpeechRecognitionAPI}
                        className="flex-1"
                        leftIcon={isProcessingVoice ? <LoadingSpinner size="sm" color="text-white" darkColor="dark:text-white"/> : <SparklesIcon className="w-4 h-4" />}
                    >
                        {isProcessingVoice ? "Procesando..." : "Procesar con IA"}
                    </Button>
                </div>
            </div>
        </Card>
      )}

      {(viewState === 'manualForm') && ( 
        <TransactionForm
          onSubmit={handleFormSubmit}
          initialData={editingTransaction ? preparedTransactionDataForForm! : (preparedTransactionDataForForm || {})}
          onCancel={handleFormCancel}
          selectedCurrencyCode={selectedCurrencyCode}
        />
      )}

      {viewState === 'list' && (
        <>
          <div className="mb-6 p-4 bg-white dark:bg-neutral-800 rounded-lg shadow">
            <label htmlFor="currencySelector" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Moneda:</label>
            <select
              id="currencySelector"
              value={selectedCurrencyCode}
              onChange={handleCurrencyChange}
              className="mt-1 block w-full md:w-1/3 px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100 dark:focus:ring-teal-500 dark:focus:border-teal-500"
            >
              {SUPPORTED_CURRENCIES.map((currency: CurrencySetting) => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card title="Balance Actual" className="lg:col-span-1 text-center bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100">
              <p className={`text-4xl font-bold ${balance >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {formatCurrency(balance, selectedCurrencyCode)}
              </p>
            </Card>
            <Card title="Gráfico de Gastos (Mes Actual)" className="lg:col-span-2">
                <ExpenseChart transactions={transactions} selectedCurrencyCode={selectedCurrencyCode} />
            </Card>
          </div>
          
          <Card title="Historial de Transacciones">
            {sortedTransactions.length > 0 ? (
              <ul className="space-y-3 divide-y divide-neutral-100 dark:divide-neutral-700 max-h-[500px] overflow-y-auto">
                {sortedTransactions.map(t => {
                  const isExpense = t.type === 'expense';
                  const categoryDetails = (isExpense ? PREDEFINED_EXPENSE_CATEGORIES : PREDEFINED_INCOME_CATEGORIES).find(c => c.name === t.category);
                  return (
                  <li key={t.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-grow mb-2 sm:mb-0">
                      <div className="flex items-center">
                        <span className={`mr-2 text-xl`} aria-hidden="true">{categoryDetails?.icon || (isExpense ? '💸' : '💰')}</span>
                        <span className="font-semibold text-neutral-700 dark:text-neutral-200">{t.category}</span>
                      </div>
                      {t.description && <p className="text-sm text-neutral-500 dark:text-neutral-400 ml-8 sm:ml-0 sm:mt-1">{t.description}</p>}
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 ml-8 sm:ml-0 sm:mt-1">{new Date(t.date+"T00:00:00").toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-auto">
                      <span className={`font-semibold text-lg ${isExpense ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {isExpense ? '-' : '+'} {formatCurrency(t.amount, selectedCurrencyCode)}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => handleEditExistingTransaction(t)} title="Editar transacción">
                        <EditIcon className="w-4 h-4 text-teal-500 dark:text-teal-400"/>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteTransaction(t.id)} title="Eliminar transacción">
                        <TrashIcon className="w-4 h-4 text-red-500 dark:text-red-400"/>
                      </Button>
                    </div>
                  </li>
                )})}
              </ul>
            ) : (
              <p className="text-neutral-500 dark:text-neutral-400 italic text-center py-4">No hay transacciones registradas todavía. ¡Añade una para empezar!</p>
            )}
          </Card>
        </>
      )}
    </PageShell>
  );
};
