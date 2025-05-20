
import React from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

const IntroCard: React.FC = () => {
  return (
    <Card className="mb-6 shadow-lg bg-white/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-center">
          <BookOpen className="mr-2" />
          <h2 className="text-xl font-bold">Jardín de Serenidad</h2>
        </div>
        <p className="text-sm text-gray-600">
          Bienvenido a este espacio de paz y tranquilidad. Aquí puedes practicar
          meditación y técnicas de respiración para encontrar calma interior.
        </p>
      </CardHeader>
    </Card>
  );
};

export default IntroCard;
