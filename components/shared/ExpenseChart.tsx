
import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { Transaction, CurrencyCode } from '../../types';
import { PREDEFINED_EXPENSE_CATEGORIES } from '../../constants';
import { formatCurrency } from '../../utils/currency';
import { useTheme } from '../../hooks/useTheme'; // Import useTheme

Chart.register(...registerables);

interface ExpenseChartProps {
  transactions: Transaction[];
  selectedCurrencyCode: CurrencyCode;
}

const chartColors = [
  '#14b8a6', // teal-500
  '#f59e0b', // amber-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#65a30d', // lime-600
  '#f43f5e', // rose-500
  '#0ea5e9', // sky-500
  '#d946ef', // fuchsia-500
  '#84cc16', // lime-500
];

// Dark mode aware colors for chart text elements
const lightModeTextColors = {
  legend: '#374151', // neutral-700
  tooltipTitle: '#1F2937', // neutral-800
  tooltipBody: '#4B5563', // neutral-600
};

const darkModeTextColors = {
  legend: '#D1D5DB', // neutral-300
  tooltipTitle: '#F9FAFB', // neutral-50
  tooltipBody: '#E5E7EB', // neutral-200
};

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ transactions, selectedCurrencyCode }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const { effectiveTheme } = useTheme(); // Get current effective theme

  useEffect(() => {
    if (!chartRef.current) return;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const expenseTransactions = transactions.filter(
      (t) => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' &&
               transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      }
    );

    if (expenseTransactions.length === 0) {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
            chartInstanceRef.current = null;
        }
      return;
    }

    const expensesByCategory: { [key: string]: number } = {};
    expenseTransactions.forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

    const labels = Object.keys(expensesByCategory);
    const data = Object.values(expensesByCategory);
    
    const backgroundColors = labels.map((_, index) => chartColors[index % chartColors.length]);

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const currentTextColors = effectiveTheme === 'dark' ? darkModeTextColors : lightModeTextColors;

    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstanceRef.current = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: 'Gastos por Categoría (Mes Actual)',
            data: data,
            backgroundColor: backgroundColors,
            hoverOffset: 4,
            borderColor: effectiveTheme === 'dark' ? '#1f2937' : '#ffffff', // Dark border for dark theme, light for light
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: currentTextColors.legend, 
              }
            },
            tooltip: {
              titleColor: currentTextColors.tooltipTitle,
              bodyColor: currentTextColors.tooltipBody,
              callbacks: {
                label: function(context) {
                  let label = context.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed !== null) {
                    label += formatCurrency(context.parsed, selectedCurrencyCode);
                  }
                  return label;
                }
              }
            }
          },
        },
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [transactions, selectedCurrencyCode, effectiveTheme]); // Add effectiveTheme to dependency array

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const hasExpenseDataForCurrentMonth = transactions.some(t => {
    const transactionDate = new Date(t.date);
    return t.type === 'expense' &&
           transactionDate.getMonth() === currentMonth &&
           transactionDate.getFullYear() === currentYear;
  });

  if (!hasExpenseDataForCurrentMonth) {
    return <p className="text-center text-neutral-500 dark:text-neutral-400 italic py-8">No hay datos de gastos para el mes actual para mostrar en el gráfico.</p>;
  }


  return (
    <div className="relative h-64 md:h-80">
      <canvas ref={chartRef} aria-label="Gráfico de gastos por categoría" role="img"></canvas>
    </div>
  );
};
