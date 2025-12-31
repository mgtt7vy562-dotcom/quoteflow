import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Receipt, AlertCircle, DollarSign } from 'lucide-react';

export default function SalesTaxCalculator({ users }) {
  const [currentQuarter, setCurrentQuarter] = useState('');
  const [quarterStart, setQuarterStart] = useState(null);
  const [quarterEnd, setQuarterEnd] = useState(null);

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    // Determine current quarter
    let quarter, start, end;
    if (month < 3) {
      quarter = 'Q1';
      start = new Date(year, 0, 1);
      end = new Date(year, 2, 31);
    } else if (month < 6) {
      quarter = 'Q2';
      start = new Date(year, 3, 1);
      end = new Date(year, 5, 30);
    } else if (month < 9) {
      quarter = 'Q3';
      start = new Date(year, 6, 1);
      end = new Date(year, 8, 30);
    } else {
      quarter = 'Q4';
      start = new Date(year, 9, 1);
      end = new Date(year, 11, 31);
    }
    
    setCurrentQuarter(`${quarter} ${year}`);
    setQuarterStart(start);
    setQuarterEnd(end);
  }, []);

  // Calculate revenue for the current quarter from Texas customers
  const calculateQuarterlyRevenue = () => {
    if (!quarterStart || !quarterEnd) return 0;

    return users.reduce((sum, user) => {
      // Only count active subscriptions
      if (user.subscription_status !== 'active') return sum;
      
      // Check if subscription started in or before this quarter
      const subStart = user.subscription_started_at ? new Date(user.subscription_started_at) : null;
      if (!subStart || subStart > quarterEnd) return sum;

      // Calculate months in quarter that user was subscribed
      const effectiveStart = subStart > quarterStart ? subStart : quarterStart;
      const monthsInQuarter = Math.ceil((quarterEnd - effectiveStart) / (1000 * 60 * 60 * 24 * 30));
      
      // Calculate revenue based on plan
      let monthlyRate = 0;
      if (user.subscription_plan === 'monthly') {
        monthlyRate = 29;
      } else if (user.subscription_plan === 'yearly') {
        monthlyRate = 299 / 12; // Convert yearly to monthly
      }
      
      return sum + (monthlyRate * Math.min(monthsInQuarter, 3));
    }, 0);
  };

  const quarterlyRevenue = calculateQuarterlyRevenue();
  
  // Texas SaaS tax: 80% taxable at max 8.25% rate
  const taxableAmount = quarterlyRevenue * 0.80;
  const taxRate = 0.0825;
  const taxOwed = taxableAmount * taxRate;

  const activeUsers = users.filter(u => u.subscription_status === 'active');
  const monthlyUsers = activeUsers.filter(u => u.subscription_plan === 'monthly');
  const yearlyUsers = activeUsers.filter(u => u.subscription_plan === 'yearly');

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="shadow-lg border-2 border-orange-200">
        <CardHeader className="bg-orange-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-orange-600" />
            Texas Sales Tax Estimate - {currentQuarter}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Revenue Breakdown</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Quarterly Revenue:</span>
                  <span className="font-semibold">${quarterlyRevenue.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Taxable Amount (80%):</span>
                  <span className="font-semibold">${taxableAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax Rate:</span>
                  <span className="font-semibold">{(taxRate * 100).toFixed(2)}%</span>
                </div>
                
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-orange-600">Estimated Tax Owed:</span>
                    <span className="font-bold text-2xl text-orange-600">
                      ${taxOwed.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Breakdown */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Active Customers</h3>
              
              <div className="space-y-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-600">Monthly Subscribers</p>
                      <p className="text-xl font-bold">{monthlyUsers.length}</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-700">
                      ${(monthlyUsers.length * 29).toFixed(2)}/mo
                    </Badge>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-600">Yearly Subscribers</p>
                      <p className="text-xl font-bold">{yearlyUsers.length}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700">
                      ${(yearlyUsers.length * 299).toFixed(2)}/yr
                    </Badge>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-600">Total Active</p>
                      <p className="text-xl font-bold">{activeUsers.length}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Info Card */}
      <Card className="shadow-lg border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-bold text-blue-900">Important Tax Information</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Texas considers SaaS 80% taxable at a maximum rate of 8.25%</li>
                <li>• Sales tax is due quarterly (April 20, July 20, October 20, January 20)</li>
                <li>• This is an estimate - consult with a tax professional for exact amounts</li>
                <li>• Keep detailed records of all subscription revenue</li>
                <li>• File online at the Texas Comptroller website</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}