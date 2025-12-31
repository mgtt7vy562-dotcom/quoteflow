import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  FileText, 
  Settings, 
  TrendingUp,
  Calendar,
  DollarSign,
  Loader2,
  User
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [goalAmount, setGoalAmount] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      // Check subscription status
      const hasAccess = currentUser.subscription_status === 'trial' || 
                        currentUser.subscription_status === 'active';
      
      if (!hasAccess) {
        // TODO: Redirect to payment page or landing
        window.location.href = '/Landing';
        return;
      }

      setUser(currentUser);

      const allQuotes = await base44.entities.Quote.list('-created_date', 50);
      setQuotes(allQuotes);

      const allJobs = await base44.entities.Job.list();
      setJobs(allJobs);

      const allExpenses = await base44.entities.Expense.list();
      setExpenses(allExpenses);

      // Check if need to set goal for current month
      const currentMonth = new Date().toISOString().slice(0, 7);
      if (!currentUser.revenue_goal_month || currentUser.revenue_goal_month !== currentMonth) {
        setShowGoalInput(true);
      }
    } catch (err) {
      window.location.href = '/Landing';
    } finally {
      setLoading(false);
    }
  };

  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const completedJobsThisMonth = jobs.filter(j => {
    if (j.status !== 'completed') return false;
    const date = new Date(j.scheduled_date);
    return date.toISOString().slice(0, 7) === currentMonth;
  });

  const actualRevenue = completedJobsThisMonth.reduce((sum, j) => sum + (j.total_price || 0), 0);
  const revenueGoal = user?.monthly_revenue_goal || 0;
  const progressPercent = revenueGoal > 0 ? Math.min((actualRevenue / revenueGoal) * 100, 100) : 0;

  const currentMonthExpenses = expenses.filter(e => {
    if (!e.date) return false;
    return e.date.slice(0, 7) === currentMonth;
  });
  const totalExpensesThisMonth = currentMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const quotesThisMonth = quotes.filter(q => {
    const date = new Date(q.created_date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const stats = {
    total: quotesThisMonth.length,
    thisMonth: quotesThisMonth.length,
    revenue: quotesThisMonth.reduce((sum, q) => sum + (q.total || 0), 0),
    paidQuotes: quotesThisMonth.filter(q => q.payment_status === 'paid').length,
    pendingPayment: quotesThisMonth.filter(q => q.payment_status !== 'paid').length
  };

  const motivationalQuotes = [
    "Every job completed is a step toward your goal! 💪",
    "Success is the sum of small efforts repeated day in and day out.",
    "The harder you work, the luckier you get!",
    "Your hustle today builds tomorrow's success.",
    "Small progress is still progress. Keep going!",
    "Consistency beats perfection every time."
  ];

  const revenueTips = [
    "💡 Tip: Follow up with past customers for repeat business",
    "💡 Tip: Ask satisfied customers for referrals",
    "💡 Tip: Offer seasonal promotions to boost bookings",
    "💡 Tip: Respond to quotes quickly to close more deals",
    "💡 Tip: Take great before/after photos for marketing"
  ];

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  const randomTip = revenueTips[Math.floor(Math.random() * revenueTips.length)];

  const handleSaveGoal = async () => {
    const amount = parseFloat(goalAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid goal amount');
      return;
    }

    try {
      await base44.auth.updateMe({
        monthly_revenue_goal: amount,
        revenue_goal_month: currentMonth
      });
      setUser({ ...user, monthly_revenue_goal: amount, revenue_goal_month: currentMonth });
      setShowGoalInput(false);
    } catch (err) {
      alert('Error saving goal');
    }
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
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-8 px-4 shadow-xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                {user?.company_name || 'Quote Generator'}
              </h1>
              <p className="text-slate-400">
                {user?.email}
              </p>
            </div>
            <Link to="/Settings">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>

          {/* Revenue Goal Modal */}
          {showGoalInput && (
            <Card className="bg-white/10 backdrop-blur border-white/20 mb-4">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Set Your Revenue Goal</h3>
                <p className="text-slate-300 text-sm mb-4">What's your target for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}?</p>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white">$</span>
                    <Input
                      type="number"
                      value={goalAmount}
                      onChange={(e) => setGoalAmount(e.target.value)}
                      placeholder="10000"
                      className="pl-7 bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>
                  <Button onClick={handleSaveGoal} className="bg-emerald-500 hover:bg-emerald-600">
                    Set Goal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Revenue Progress */}
          {revenueGoal > 0 && (
            <Card className="bg-white/10 backdrop-blur border-white/20 mb-4">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Monthly Revenue Goal</h3>
                    <p className="text-sm text-slate-300">{randomQuote}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowGoalInput(true)}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Edit
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Actual Revenue</span>
                    <span className="font-semibold">${actualRevenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${progressPercent}%` }}
                    >
                      {progressPercent > 15 && (
                        <span className="text-xs font-bold text-white">{progressPercent.toFixed(0)}%</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Goal</span>
                    <span className="font-semibold">${revenueGoal.toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-slate-300 mt-3 bg-white/10 rounded-lg p-3">
                    {randomTip}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Quotes This Month</p>
                    <p className="text-3xl font-bold mt-1">{stats.total}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {stats.paidQuotes} paid • {stats.pendingPayment} pending
                    </p>
                  </div>
                  <FileText className="w-10 h-10 text-emerald-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Jobs This Month</p>
                    <p className="text-3xl font-bold mt-1">{completedJobsThisMonth.length}</p>
                  </div>
                  <Calendar className="w-10 h-10 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Revenue This Month</p>
                    <p className="text-3xl font-bold mt-1">${stats.revenue.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">Quotes value</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Expenses (Month)</p>
                    <p className="text-3xl font-bold mt-1 text-red-300">${totalExpensesThisMonth.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link to="/CreateQuote">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-emerald-500 bg-gradient-to-br from-emerald-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Plus className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">New Quote</h3>
                    <p className="text-slate-600">Create a professional quote</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/Calendar">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-500 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Job Calendar</h3>
                    <p className="text-slate-600">Schedule and track jobs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/QuoteHistory">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-500 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Quote History</h3>
                    <p className="text-slate-600">View all past quotes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/Leads">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-500 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Leads</h3>
                    <p className="text-slate-600">Track new inquiries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/Customers">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-orange-500 bg-gradient-to-br from-orange-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Customers</h3>
                    <p className="text-slate-600">Manage customer database</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/Analytics">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-pink-500 bg-gradient-to-br from-pink-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Analytics</h3>
                    <p className="text-slate-600">Revenue insights & reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/Expenses">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-red-500 bg-gradient-to-br from-red-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Expenses</h3>
                    <p className="text-slate-600">Track fuel, fees & costs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/CustomerPortal">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-indigo-500 bg-gradient-to-br from-indigo-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Customer Portal</h3>
                    <p className="text-slate-600">Manage your account & loyalty rewards</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Quotes */}
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Recent Quotes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {quotes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg font-medium mb-2">No quotes yet</p>
                <p className="text-slate-500 mb-6">Create your first quote to get started</p>
                <Link to="/CreateQuote">
                  <Button className="bg-emerald-500 hover:bg-emerald-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Quote
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {quotes.slice(0, 5).map((quote) => (
                  <Link key={quote.id} to="/QuoteHistory">
                    <div className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-200">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{quote.customer_name}</p>
                        <p className="text-sm text-slate-600">{quote.quote_number}</p>
                        <div className="mt-1">
                          {quote.payment_status === 'paid' ? (
                            <span className="inline-flex items-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              ✓ Paid
                            </span>
                          ) : quote.job_id ? (
                            <span className="inline-flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              📅 Scheduled
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                              ⏳ Pending Payment
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">${quote.total?.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(quote.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}