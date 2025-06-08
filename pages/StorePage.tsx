import React, { useState } from 'react';
import { PageShell } from '../components/shared/PageShell';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { ShoppingBagIcon, SparklesIcon, CheckCircleIcon } from '../components/icons';
import { StoreItem } from '../types';
import { MUSHU_STORE_ITEMS } from '../constants';

interface StorePageProps {
  sparkles: number;
  setSparkles: React.Dispatch<React.SetStateAction<number>>;
  ownedItems: string[];
  setOwnedItems: React.Dispatch<React.SetStateAction<string[]>>;
  equippedItem: string | null;
  setEquippedItem: React.Dispatch<React.SetStateAction<string | null>>;
}

export const StorePage: React.FC<StorePageProps> = ({
  sparkles,
  setSparkles,
  ownedItems,
  setOwnedItems,
  equippedItem,
  setEquippedItem,
}) => {
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);

  const handlePurchaseItem = (item: StoreItem) => {
    if (sparkles >= item.cost && !ownedItems.includes(item.id)) {
      setSparkles(prevSparkles => prevSparkles - item.cost);
      setOwnedItems(prevOwned => [...prevOwned, item.id]);
      setPurchaseMessage(`¡Has comprado "${item.name}"! Ahora puedes equiparlo.`);
      setTimeout(() => setPurchaseMessage(null), 3000);
    } else if (ownedItems.includes(item.id)) {
      setPurchaseMessage(`Ya posees "${item.name}".`);
       setTimeout(() => setPurchaseMessage(null), 3000);
    } else {
      setPurchaseMessage(`No tienes suficientes Sparkles para comprar "${item.name}".`);
       setTimeout(() => setPurchaseMessage(null), 3000);
    }
  };

  const handleEquipItem = (itemId: string) => {
    if (ownedItems.includes(itemId)) {
      setEquippedItem(itemId);
      setPurchaseMessage(null); // Clear any purchase message
    }
  };

  return (
    <PageShell title="Tienda de Mushu" icon={<ShoppingBagIcon className="w-8 h-8" />}>
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200">Personaliza a Mushu</h2>
          <div className="flex items-center text-lg font-semibold text-yellow-500 dark:text-yellow-400">
            <SparklesIcon className="w-6 h-6 mr-2" />
            {sparkles} Sparkles
          </div>
        </div>
        {purchaseMessage && (
          <p className={`mt-3 text-sm p-2 rounded-md ${purchaseMessage.includes("No tienes suficientes") ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'}`}>
            {purchaseMessage}
          </p>
        )}
      </Card>

      {MUSHU_STORE_ITEMS.filter(item => item.id !== 'mushu_default').length === 0 && (
         <Card className="text-center">
             <ShoppingBagIcon className="w-12 h-12 mx-auto text-neutral-400 dark:text-neutral-500 mb-4" />
            <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-2">¡La tienda está vacía por ahora!</h3>
            <p className="text-neutral-500 dark:text-neutral-400">Vuelve más tarde para ver nuevos artículos para Mushu.</p>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MUSHU_STORE_ITEMS.filter(item => item.id !== 'mushu_default').map((item) => {
          const isOwned = ownedItems.includes(item.id);
          const isEquipped = equippedItem === item.id;

          return (
            <Card key={item.id} className="flex flex-col">
              <img 
                src={item.previewImage} 
                alt={item.name} 
                className="w-full h-48 object-contain rounded-t-xl bg-neutral-100 dark:bg-neutral-700 p-4" 
              />
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">{item.name}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 mb-3 flex-grow">{item.description}</p>
                <div className="flex items-center text-yellow-500 dark:text-yellow-400 font-semibold mb-4">
                  <SparklesIcon className="w-5 h-5 mr-1" /> {item.cost}
                </div>
                
                {isEquipped ? (
                  <Button variant="primary" disabled className="w-full mt-auto" leftIcon={<CheckCircleIcon className="w-5 h-5"/>}>
                    Equipado
                  </Button>
                ) : isOwned ? (
                  <Button onClick={() => handleEquipItem(item.id)} variant="secondary" className="w-full mt-auto">
                    Equipar
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handlePurchaseItem(item)} 
                    disabled={sparkles < item.cost}
                    className="w-full mt-auto"
                  >
                    Comprar
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
       <Card className="mt-8">
            <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-2">Restaurar a Mushu Clásico</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">
                Vuelve al look original de Mushu Alberto.
            </p>
            {equippedItem === 'mushu_default' ? (
                <Button variant="primary" disabled className="w-full sm:w-auto" leftIcon={<CheckCircleIcon className="w-5 h-5"/>}>
                    Clásico Equipado
                </Button>
            ) : (
                <Button onClick={() => handleEquipItem('mushu_default')} variant="ghost" className="w-full sm:w-auto">
                    Equipar Mushu Clásico
                </Button>
            )}
        </Card>
    </PageShell>
  );
};
