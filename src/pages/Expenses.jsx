import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  DollarSign,
  Loader2,
  TrendingDown,
  Camera,
  X
} from 'lucide-react';
import QuickExpenseTemplates from '../components/expenses/QuickExpenseTemplates';
import ReceiptScanner from '../components/expenses/ReceiptScanner';

export default function Expenses() {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'fuel',
    amount: '',
    description: '',
    receipt_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser.license_validated) {
        window.location.href = '/LicenseEntry';
        return;
      }
      setUser(currentUser);

      const allExpenses = await base44.entities.Expense.list('-date');
      setExpenses(allExpenses);
    } catch (err) {
      window.location.href = '/LicenseEntry';
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.entities.Expense.create({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: 'fuel',
        amount: '',
        description: '',
        receipt_url: ''
      });
      setShowForm(false);
      await loadData();
    } catch (err) {
      alert('Error saving expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await base44.entities.Expense.delete(id);
      await loadData();
    } catch (err) {
      alert('Error deleting expense');
    }
  };

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyExpenses = expenses.filter(e => e.date?.startsWith(currentMonth));
  const totalMonthly = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalAllTime = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const categoryLabels = {
    fuel: '⛽ Fuel',
    dump_fees: '🗑️ Dump Fees',
    equipment: '🔧 Equipment',
    maintenance: '🛠️ Maintenance',
    labor: '👷 Labor',
    fertilizer: '🌱 Fertilizer',
    seeds_plants: '🌿 Seeds/Plants',
    lawn_equipment: '🚜 Lawn Equipment',
    cleaning_supplies: '🧴 Cleaning Supplies',
    cleaning_equipment: '🧹 Cleaning Equipment',
    marketing: '📣 Marketing',
    insurance: '🛡️ Insurance',
    vehicle_maintenance: '🚗 Vehicle Maintenance',
    other: '📋 Other'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-6 px-4 shadow-xl">
        <div className="max-w-6xl mx-auto">
          <a href="/Dashboard" className="inline-flex items-center text-slate-300 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </a>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <TrendingDown className="w-8 h-8" />
              Expense Tracking
            </h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowScanner(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Camera className="w-4 h-4 mr-2" />
                Scan Receipt
              </Button>
              <Button
                onClick={() => setShowForm(!showForm)}
                className="bg-red-500 hover:bg-red-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">This Month</p>
                    <p className="text-3xl font-bold mt-1">${totalMonthly.toLocaleString()}</p>
                  </div>
                  <TrendingDown className="w-10 h-10 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">All-Time</p>
                    <p className="text-3xl font-bold mt-1">${totalAllTime.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {!showForm && (
          <div className="mb-6">
            <QuickExpenseTemplates 
              onAddExpense={(expense) => {
                setFormData(expense);
                setShowForm(true);
              }}
            />
          </div>
        )}

        {showForm && (
          <Card className="shadow-lg mb-6">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Add New Expense</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label>Category</Label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full mt-1 h-10 px-3 rounded-md border border-slate-300 bg-white"
                      required
                    >
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Amount</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      className="pl-7"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What was this expense for?"
                    className="mt-1 h-20"
                  />
                </div>

                {formData.receipt_url && (
                  <div>
                    <Label>Receipt Image</Label>
                    <div className="mt-1 relative">
                      <img src={formData.receipt_url} alt="Receipt" className="w-full rounded-lg border" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setFormData({ ...formData, receipt_url: '' })}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Expense'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle>All Expenses</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <TrendingDown className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg font-medium mb-2">No expenses tracked yet</p>
                <p className="text-slate-500 mb-6">Start tracking your business expenses</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{categoryLabels[expense.category]?.split(' ')[0]}</span>
                        <span className="font-semibold text-slate-900">
                          {categoryLabels[expense.category]?.split(' ').slice(1).join(' ')}
                        </span>
                      </div>
                      {expense.description && (
                        <p className="text-sm text-slate-600">{expense.description}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-red-600 text-lg">
                        ${expense.amount?.toLocaleString()}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showScanner && (
        <ReceiptScanner
          onExpenseExtracted={(expense) => {
            setFormData({ ...formData, ...expense });
            setShowScanner(false);
            setShowForm(true);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}