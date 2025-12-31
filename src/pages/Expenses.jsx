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
  Calendar
} from 'lucide-react';

export default function Expenses() {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showFixedExpenses, setShowFixedExpenses] = useState(false);
  const [fixedMonthly, setFixedMonthly] = useState({});
  const [fixedYearly, setFixedYearly] = useState({});
  const [activeTab, setActiveTab] = useState('monthly'); // 'monthly' or 'yearly'
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'fuel',
    amount: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser.license_validated && currentUser.subscription_status !== 'active') {
        window.location.href = '/LicenseEntry';
        return;
      }
      setUser(currentUser);

      const allExpenses = await base44.entities.Expense.list('-date');
      setExpenses(allExpenses);

      setFixedMonthly(currentUser.fixed_monthly_expenses || {});
      setFixedYearly(currentUser.fixed_yearly_expenses || {});
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
        description: ''
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

  const handleSaveFixedExpenses = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        fixed_monthly_expenses: fixedMonthly,
        fixed_yearly_expenses: fixedYearly
      });
      setUser({ ...user, fixed_monthly_expenses: fixedMonthly, fixed_yearly_expenses: fixedYearly });
      setShowFixedExpenses(false);
      alert('Fixed expenses saved!');
    } catch (err) {
      alert('Error saving fixed expenses');
    } finally {
      setSaving(false);
    }
  };

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentYear = new Date().getFullYear().toString();
  
  const monthlyExpenses = expenses.filter(e => e.date?.startsWith(currentMonth));
  const yearlyExpenses = expenses.filter(e => e.date?.startsWith(currentYear));
  
  const totalVariableMonthly = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalVariableYearly = yearlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  
  const totalFixedMonthly = Object.entries(fixedMonthly || {}).reduce((sum, [key, value]) => {
    if (key !== 'custom_label') {
      return sum + (parseFloat(value) || 0);
    }
    return sum;
  }, 0);
  
  const totalFixedYearly = Object.entries(fixedYearly || {}).reduce((sum, [key, value]) => {
    if (key !== 'other_label') {
      return sum + (parseFloat(value) || 0);
    }
    return sum;
  }, 0);
  
  const totalMonthly = totalVariableMonthly + totalFixedMonthly;
  const totalYearly = totalVariableYearly + totalFixedYearly;
  const totalAllTime = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const categoryLabels = {
    fuel: '⛽ Fuel',
    dump_fees: '🗑️ Dump Fees',
    equipment: '🔧 Equipment',
    maintenance: '🛠️ Maintenance',
    labor: '👷 Labor',
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
                onClick={() => setShowFixedExpenses(!showFixedExpenses)}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                ⚙️ Fixed Expenses
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">This Month</p>
                    <p className="text-3xl font-bold mt-1">${totalMonthly.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      ${totalVariableMonthly.toFixed(0)} logged + ${totalFixedMonthly.toFixed(0)} fixed
                    </p>
                  </div>
                  <TrendingDown className="w-10 h-10 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">This Year</p>
                    <p className="text-3xl font-bold mt-1">${totalYearly.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      ${totalVariableYearly.toFixed(0)} logged + ${totalFixedYearly.toFixed(0)} fixed
                    </p>
                  </div>
                  <Calendar className="w-10 h-10 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">All-Time Logged</p>
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
        {showFixedExpenses && (
          <Card className="shadow-lg mb-6">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Fixed Recurring Expenses</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Monthly */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Monthly Expenses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Marketing</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={fixedMonthly.marketing || ''}
                        onChange={(e) => setFixedMonthly({ ...fixedMonthly, marketing: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Truck Payment</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={fixedMonthly.truck_payment || ''}
                        onChange={(e) => setFixedMonthly({ ...fixedMonthly, truck_payment: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Truck Insurance</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={fixedMonthly.truck_insurance || ''}
                        onChange={(e) => setFixedMonthly({ ...fixedMonthly, truck_insurance: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Business Insurance</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={fixedMonthly.business_insurance || ''}
                        onChange={(e) => setFixedMonthly({ ...fixedMonthly, business_insurance: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Trailer Parking Rent</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={fixedMonthly.trailer_parking_rent || ''}
                        onChange={(e) => setFixedMonthly({ ...fixedMonthly, trailer_parking_rent: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>CRM Tool</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={fixedMonthly.crm_tool || ''}
                        onChange={(e) => setFixedMonthly({ ...fixedMonthly, crm_tool: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>
                      <Input
                        type="text"
                        value={fixedMonthly.custom_label || 'Other'}
                        onChange={(e) => setFixedMonthly({ ...fixedMonthly, custom_label: e.target.value })}
                        placeholder="Custom expense name"
                        className="mb-1"
                      />
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={fixedMonthly.custom || ''}
                        onChange={(e) => setFixedMonthly({ ...fixedMonthly, custom: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Yearly */}
              <div className="pt-6 border-t">
                <h3 className="font-semibold text-lg mb-4">Yearly Expenses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Marketing</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={fixedYearly.marketing || ''}
                        onChange={(e) => setFixedYearly({ ...fixedYearly, marketing: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Truck Payment</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={fixedYearly.truck_payment || ''}
                        onChange={(e) => setFixedYearly({ ...fixedYearly, truck_payment: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Truck Insurance</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={fixedYearly.truck_insurance || ''}
                        onChange={(e) => setFixedYearly({ ...fixedYearly, truck_insurance: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Business Insurance</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={fixedYearly.business_insurance || ''}
                        onChange={(e) => setFixedYearly({ ...fixedYearly, business_insurance: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Trailer Parking Rent</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={fixedYearly.trailer_parking_rent || ''}
                        onChange={(e) => setFixedYearly({ ...fixedYearly, trailer_parking_rent: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>CRM Tool</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={fixedYearly.crm_tool || ''}
                        onChange={(e) => setFixedYearly({ ...fixedYearly, crm_tool: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>
                      <Input
                        type="text"
                        value={fixedYearly.other_label || 'Other'}
                        onChange={(e) => setFixedYearly({ ...fixedYearly, other_label: e.target.value })}
                        placeholder="Custom expense name"
                        className="mb-1"
                      />
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={fixedYearly.other || ''}
                        onChange={(e) => setFixedYearly({ ...fixedYearly, other: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveFixedExpenses}
                  disabled={saving}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Fixed Expenses'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFixedExpenses(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveTab('monthly')}
            variant={activeTab === 'monthly' ? 'default' : 'outline'}
            className={activeTab === 'monthly' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
          >
            Monthly Expenses
          </Button>
          <Button
            onClick={() => setActiveTab('yearly')}
            variant={activeTab === 'yearly' ? 'default' : 'outline'}
            className={activeTab === 'yearly' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
          >
            Yearly Expenses
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle>
              {activeTab === 'monthly' ? 'Monthly Expenses' : 'Yearly Expenses'} - {activeTab === 'monthly' ? new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : currentYear}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {(activeTab === 'monthly' ? monthlyExpenses : yearlyExpenses).length === 0 ? (
              <div className="text-center py-12">
                <TrendingDown className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg font-medium mb-2">No expenses tracked yet</p>
                <p className="text-slate-500 mb-6">Start tracking your business expenses</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(activeTab === 'monthly' ? monthlyExpenses : yearlyExpenses).map((expense) => (
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
    </div>
  );
}