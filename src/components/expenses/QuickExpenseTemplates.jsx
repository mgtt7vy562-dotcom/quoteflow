import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

export default function QuickExpenseTemplates({ onAddExpense, serviceType }) {
  const templates = {
    junk_removal: [
      { category: 'fuel', amount: 50, description: 'Gas fill-up' },
      { category: 'dump_fees', amount: 75, description: 'Landfill dump fee' },
      { category: 'equipment', amount: 200, description: 'Equipment purchase' },
      { category: 'vehicle_maintenance', amount: 100, description: 'Truck maintenance' },
    ],
    lawn_care: [
      { category: 'fuel', amount: 40, description: 'Gas for mower' },
      { category: 'lawn_equipment', amount: 150, description: 'Equipment purchase' },
      { category: 'fertilizer', amount: 60, description: 'Fertilizer supplies' },
      { category: 'seeds_plants', amount: 50, description: 'Plants/seeds' },
    ],
    residential_cleaning: [
      { category: 'cleaning_supplies', amount: 75, description: 'Cleaning supplies' },
      { category: 'cleaning_equipment', amount: 150, description: 'Equipment purchase' },
      { category: 'fuel', amount: 30, description: 'Gas for travel' },
      { category: 'vehicle_maintenance', amount: 100, description: 'Vehicle maintenance' },
    ],
    common: [
      { category: 'marketing', amount: 100, description: 'Marketing expense' },
      { category: 'insurance', amount: 200, description: 'Insurance payment' },
    ]
  };

  const serviceTemplates = templates[serviceType] || [];
  const allTemplates = [...serviceTemplates, ...templates.common];

  const handleQuickAdd = (template) => {
    const today = new Date().toISOString().split('T')[0];
    onAddExpense({
      date: today,
      category: template.category,
      amount: template.amount.toString(),
      description: template.description
    });
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-purple-900">Quick Add</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {allTemplates.map((template, idx) => (
          <Button
            key={idx}
            onClick={() => handleQuickAdd(template)}
            variant="outline"
            className="h-auto py-2 px-3 flex flex-col items-start hover:bg-purple-100 border-purple-300"
          >
            <span className="text-xs text-slate-600">{template.description}</span>
            <span className="text-lg font-bold text-purple-700">${template.amount}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}