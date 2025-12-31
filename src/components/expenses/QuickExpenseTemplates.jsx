import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { History, Loader2 } from 'lucide-react';

export default function QuickExpenseTemplates({ onAddExpense }) {
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentExpenses();
  }, []);

  const loadRecentExpenses = async () => {
    try {
      const allExpenses = await base44.entities.Expense.list('-date', 50);
      
      // Get unique recent expenses by category (last 5 unique categories)
      const seen = new Set();
      const unique = [];
      
      for (const expense of allExpenses) {
        const key = `${expense.category}-${expense.description}`;
        if (!seen.has(expense.category) && unique.length < 6) {
          seen.add(expense.category);
          unique.push(expense);
        }
      }
      
      setRecentExpenses(unique);
    } catch (err) {
      console.error('Error loading recent expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (expense) => {
    const today = new Date().toISOString().split('T')[0];
    onAddExpense({
      date: today,
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description
    });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
        <Loader2 className="w-5 h-5 text-slate-400 animate-spin mx-auto" />
      </div>
    );
  }

  if (recentExpenses.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">Recent Expenses</h3>
        <span className="text-xs text-slate-600">(click to repeat)</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {recentExpenses.map((expense, idx) => (
          <Button
            key={idx}
            onClick={() => handleQuickAdd(expense)}
            variant="outline"
            className="h-auto py-2 px-3 flex flex-col items-start hover:bg-blue-100 border-blue-300 text-left"
          >
            <span className="text-xs text-slate-600 truncate w-full">{expense.description}</span>
            <span className="text-lg font-bold text-blue-700">${expense.amount}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}