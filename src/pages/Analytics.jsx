import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  Loader2
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

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

      const allJobs = await base44.entities.Job.filter({ status: 'completed' });
      setJobs(allJobs);
    } catch (err) {
      window.location.href = '/LicenseEntry';
    } finally {
      setLoading(false);
    }
  };

  // Calculate monthly revenue data
  const getMonthlyData = () => {
    const monthlyRevenue = {};
    
    jobs.forEach(job => {
      const date = new Date(job.scheduled_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = 0;
      }
      monthlyRevenue[monthKey] += job.total_price || 0;
    });

    return Object.entries(monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, revenue]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue: revenue
      }));
  };

  // Current month stats
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthJobs = jobs.filter(j => {
    const date = new Date(j.scheduled_date);
    return date.toISOString().slice(0, 7) === currentMonth;
  });

  const currentRevenue = currentMonthJobs.reduce((sum, j) => sum + (j.total_price || 0), 0);
  const revenueGoal = user?.monthly_revenue_goal || 0;
  const progressPercent = revenueGoal > 0 ? (currentRevenue / revenueGoal) * 100 : 0;
  const remaining = Math.max(0, revenueGoal - currentRevenue);

  // Average job value
  const avgJobValue = jobs.length > 0 
    ? jobs.reduce((sum, j) => sum + (j.total_price || 0), 0) / jobs.length 
    : 0;

  const monthlyData = getMonthlyData();

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
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="w-8 h-8" />
            Revenue Analytics
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Current Month Goal Progress */}
        {revenueGoal > 0 && (
          <Card className="shadow-lg mb-6">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" />
                Current Month Goal Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Current Revenue</p>
                  <p className="text-3xl font-bold text-emerald-600">${currentRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Goal</p>
                  <p className="text-3xl font-bold text-slate-900">${revenueGoal.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Remaining</p>
                  <p className="text-3xl font-bold text-orange-600">${remaining.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="w-full bg-slate-200 rounded-full h-6 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 flex items-center justify-center text-sm font-bold text-white ${
                    progressPercent >= 100 ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-emerald-500'
                  }`}
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                >
                  {progressPercent > 10 && `${progressPercent.toFixed(0)}%`}
                </div>
              </div>

              {progressPercent >= 100 && (
                <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                  <p className="text-emerald-700 font-semibold">🎉 Congratulations! You've hit your goal!</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Completed Jobs</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{jobs.length}</p>
                </div>
                <Calendar className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Average Job Value</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-1">${avgJobValue.toFixed(0)}</p>
                </div>
                <DollarSign className="w-10 h-10 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">This Month</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{currentMonthJobs.length}</p>
                  <p className="text-xs text-slate-500 mt-1">completed jobs</p>
                </div>
                <TrendingUp className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Revenue Chart */}
        <Card className="shadow-lg mb-6">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => `$${value.toLocaleString()}`}
                    labelStyle={{ color: '#000' }}
                  />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-500 py-12">No data yet. Complete jobs to see analytics!</p>
            )}
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="shadow-lg">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle>Business Insights</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {progressPercent < 100 && revenueGoal > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-blue-900 mb-1">To Hit Your Goal:</p>
                <p className="text-sm text-blue-700">
                  You need {Math.ceil(remaining / avgJobValue)} more jobs at your current average of ${avgJobValue.toFixed(0)}/job
                </p>
              </div>
            )}
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="font-semibold text-emerald-900 mb-1">💡 Pro Tip:</p>
              <p className="text-sm text-emerald-700">
                Follow up with past customers every 3-6 months. Many need repeat services!
              </p>
            </div>

            {currentMonthJobs.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="font-semibold text-purple-900 mb-1">This Month's Performance:</p>
                <p className="text-sm text-purple-700">
                  ${(currentRevenue / currentMonthJobs.length).toFixed(0)} average per job | {currentMonthJobs.length} jobs completed
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}