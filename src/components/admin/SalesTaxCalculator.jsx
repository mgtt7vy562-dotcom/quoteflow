import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, DollarSign } from 'lucide-react';

export default function SalesTaxCalculator({ users }) {
  const [amount, setAmount] = useState('');
  
  const texasSalesTaxRate = 0.0825; // 8.25% for Texas
  
  const subtotal = parseFloat(amount) || 0;
  const taxAmount = subtotal * texasSalesTaxRate;
  const total = subtotal + taxAmount;

  // Calculate total revenue from active subscribers
  const activeSubscribers = users.filter(u => u.subscription_status === 'active');
  const monthlyRevenue = activeSubscribers.reduce((sum, u) => {
    const monthlyAmount = u.subscription_plan === 'yearly' ? 299 / 12 : 29;
    return sum + monthlyAmount;
  }, 0);
  const yearlyRevenue = monthlyRevenue * 12;
  const salesTaxOwed = yearlyRevenue * texasSalesTaxRate;

  return (
    <div className="space-y-6">
      {/* Quick Calculator */}
      <Card className="shadow-lg">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Texas Sales Tax Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </div>

            {subtotal > 0 && (
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Sales Tax (8.25%)</span>
                  <span className="font-semibold text-emerald-600">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">${total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estimated Annual Tax */}
      <Card className="shadow-lg border-2 border-amber-200">
        <CardHeader className="bg-amber-50 border-b border-amber-200">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <DollarSign className="w-5 h-5" />
            Estimated Annual Sales Tax (Texas)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">Monthly Revenue</p>
                <p className="text-2xl font-bold text-slate-900">${monthlyRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">Annual Revenue</p>
                <p className="text-2xl font-bold text-slate-900">${yearlyRevenue.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-6 border-2 border-amber-300">
              <p className="text-sm text-amber-900 mb-2">Estimated Sales Tax Owed</p>
              <p className="text-4xl font-bold text-amber-900">${salesTaxOwed.toFixed(2)}</p>
              <p className="text-xs text-amber-700 mt-2">Based on 8.25% Texas sales tax rate</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-900 font-semibold mb-2">📋 Tax Filing Notes</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Texas requires sales tax on SaaS subscriptions</li>
                <li>• File quarterly or monthly based on volume</li>
                <li>• Use Texas Comptroller's Webfile system</li>
                <li>• Keep records for at least 4 years</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}