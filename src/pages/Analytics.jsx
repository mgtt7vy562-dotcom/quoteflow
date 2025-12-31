import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign,
  Loader2,
  Download,
  Calendar,
  Users,
  Package,
  Award
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AIInsights from '../components/analytics/AIInsights';

export default function Analytics() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
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

      const allJobs = await base44.entities.Job.list();
      const allExpenses = await base44.entities.Expense.list();
      const allCustomers = await base44.entities.Customer.list();
      
      setJobs(allJobs.filter(j => j.status === 'completed'));
      setExpenses(allExpenses);
      setCustomers(allCustomers);
    } catch (err) {
      window.location.href = '/LicenseEntry';
    } finally {
      setLoading(false);
    }
  };

  // Filter data by date range
  const filteredJobs = jobs.filter(j => {
    const jobDate = new Date(j.scheduled_date).toISOString().split('T')[0];
    return jobDate >= dateRange.start && jobDate <= dateRange.end;
  });

  const filteredExpenses = expenses.filter(e => {
    const expDate = e.date;
    return expDate >= dateRange.start && expDate <= dateRange.end;
  });

  // Revenue and Profit Calculations
  const totalRevenue = filteredJobs.reduce((sum, j) => sum + (j.total_price || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

  // Popular Services Analysis - Service-specific
  const primaryServiceData = {};
  const secondaryServiceData = {};
  
  filteredJobs.forEach(job => {
    if (user?.service_type === 'junk_removal') {
      primaryServiceData[job.load_size] = (primaryServiceData[job.load_size] || 0) + 1;
      secondaryServiceData[job.debris_type] = (secondaryServiceData[job.debris_type] || 0) + 1;
    } else if (user?.service_type === 'lawn_care') {
      // For lawn care, analyze services from lawn_services array
      if (job.lawn_services && Array.isArray(job.lawn_services)) {
        job.lawn_services.forEach(service => {
          primaryServiceData[service] = (primaryServiceData[service] || 0) + 1;
        });
      }
      // Service frequency for secondary chart
      const freq = job.service_frequency || 'one_time';
      secondaryServiceData[freq] = (secondaryServiceData[freq] || 0) + 1;
    } else if (user?.service_type === 'residential_cleaning') {
      // For cleaning, analyze by cleaning type
      const type = job.cleaning_type || 'standard';
      primaryServiceData[type] = (primaryServiceData[type] || 0) + 1;
      // Frequency for secondary chart
      const freq = job.cleaning_frequency || 'one_time';
      secondaryServiceData[freq] = (secondaryServiceData[freq] || 0) + 1;
    }
  });

  const loadSizeChart = Object.entries(primaryServiceData).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').toUpperCase(),
    jobs: value,
    revenue: filteredJobs.filter(j => {
      if (user?.service_type === 'junk_removal') return j.load_size === name;
      if (user?.service_type === 'lawn_care') return j.lawn_services?.includes(name);
      if (user?.service_type === 'residential_cleaning') return j.cleaning_type === name;
      return false;
    }).reduce((sum, j) => sum + (j.total_price || 0), 0)
  }));

  const debrisTypeChart = Object.entries(secondaryServiceData).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').toUpperCase(),
    value: value
  }));

  // Customer Acquisition Sources
  const sourceData = {};
  customers.forEach(c => {
    if (c.source) {
      sourceData[c.source] = (sourceData[c.source] || 0) + 1;
    }
  });

  const sourceChart = Object.entries(sourceData).map(([name, value]) => ({
    name: name.toUpperCase(),
    customers: value
  }));

  // Technician Performance
  const technicianData = {};
  filteredJobs.forEach(job => {
    const tech = job.assigned_to || 'Unassigned';
    if (!technicianData[tech]) {
      technicianData[tech] = { jobs: 0, revenue: 0 };
    }
    technicianData[tech].jobs++;
    technicianData[tech].revenue += job.total_price || 0;
  });

  const technicianChart = Object.entries(technicianData).map(([name, data]) => ({
    name: name.split('@')[0] || name,
    jobs: data.jobs,
    revenue: data.revenue
  }));

  // Monthly Trend (last 12 months from date range)
  const monthlyData = {};
  filteredJobs.forEach(job => {
    const date = new Date(job.scheduled_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { revenue: 0, expenses: 0, jobs: 0 };
    }
    monthlyData[monthKey].revenue += job.total_price || 0;
    monthlyData[monthKey].jobs++;
  });

  filteredExpenses.forEach(exp => {
    const monthKey = exp.date.slice(0, 7);
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].expenses += exp.amount || 0;
    }
  });

  const trendData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.revenue - data.expenses,
      jobs: data.jobs
    }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const handleExportCSV = () => {
    const csvData = [
      ['Analytics Report'],
      [`Date Range: ${dateRange.start} to ${dateRange.end}`],
      [''],
      ['Summary'],
      ['Total Revenue', `$${totalRevenue.toFixed(2)}`],
      ['Total Expenses', `$${totalExpenses.toFixed(2)}`],
      ['Total Profit', `$${totalProfit.toFixed(2)}`],
      ['Profit Margin', `${profitMargin}%`],
      ['Total Jobs', filteredJobs.length],
      [''],
      ['Load Size Breakdown'],
      ['Load Size', 'Jobs', 'Revenue'],
      ...loadSizeChart.map(item => [item.name, item.jobs, `$${item.revenue.toFixed(2)}`]),
      [''],
      ['Technician Performance'],
      ['Technician', 'Jobs', 'Revenue'],
      ...technicianChart.map(item => [item.name, item.jobs, `$${item.revenue.toFixed(2)}`])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${dateRange.start}-to-${dateRange.end}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
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
        <div className="max-w-7xl mx-auto">
          <a href="/Dashboard" className="inline-flex items-center text-slate-300 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </a>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8" />
              Advanced Analytics
            </h1>
            <Button
              onClick={handleExportCSV}
              className="bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Date Range Filter */}
        <Card className="shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 flex-wrap">
              <Calendar className="w-5 h-5 text-slate-500" />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profit Breakdown */}
        <Card className="shadow-lg mb-6">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Profit & Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                <span className="font-medium text-slate-700">Gross Revenue (Jobs)</span>
                <span className="text-xl font-bold text-emerald-600">${totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-slate-700">Total Expenses</span>
                <span className="text-xl font-bold text-red-600">-${totalExpenses.toLocaleString()}</span>
              </div>
              <div className="h-px bg-slate-200"></div>
              <div className={`flex justify-between items-center p-4 rounded-lg ${totalProfit >= 0 ? 'bg-gradient-to-r from-emerald-50 to-emerald-100' : 'bg-gradient-to-r from-red-50 to-red-100'}`}>
                <span className="font-semibold text-slate-900">Net Profit</span>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ${Math.abs(totalProfit).toLocaleString()}
                  </div>
                  <div className={`text-sm ${totalProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {profitMargin}% profit margin
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-slate-700">Completed Jobs</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-blue-600">{filteredJobs.length}</span>
                  <p className="text-xs text-slate-600">
                    ${filteredJobs.length > 0 ? (totalRevenue / filteredJobs.length).toFixed(0) : 0} avg per job
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue & Profit Trend */}
        <Card className="shadow-lg mb-6">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle>Revenue & Profit Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Popular Services */}
          <Card className="shadow-lg">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>
                {user?.service_type === 'junk_removal' && 'Popular Load Sizes'}
                {user?.service_type === 'lawn_care' && 'Most Popular Services'}
                {user?.service_type === 'residential_cleaning' && 'Popular Cleaning Types'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={loadSizeChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="jobs" fill="#3b82f6" name="Jobs" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Secondary Analysis */}
          <Card className="shadow-lg">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>
                {user?.service_type === 'junk_removal' && 'Debris Type Distribution'}
                {user?.service_type === 'lawn_care' && 'Service Frequency'}
                {user?.service_type === 'residential_cleaning' && 'Cleaning Frequency'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={debrisTypeChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {debrisTypeChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Customer Acquisition */}
          {sourceChart.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>Customer Acquisition Sources</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sourceChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="customers" fill="#8b5cf6" name="Customers" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Technician Performance */}
          {technicianChart.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>Technician Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={technicianChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="jobs" fill="#f59e0b" name="Jobs Completed" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* AI Insights */}
        <Card className="shadow-lg mb-6 border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              AI-Powered Business Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <AIInsights 
              jobs={filteredJobs} 
              customers={customers} 
              revenue={totalRevenue}
              expenses={totalExpenses}
            />
          </CardContent>
        </Card>

        {/* Detailed Breakdown */}
        <Card className="shadow-lg">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-slate-700 mb-3">
                  {user?.service_type === 'junk_removal' && 'Top Load Size'}
                  {user?.service_type === 'lawn_care' && 'Top Services'}
                  {user?.service_type === 'residential_cleaning' && 'Top Cleaning Types'}
                </h4>
                {loadSizeChart.sort((a, b) => b.revenue - a.revenue).slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">{item.name}</span>
                    <span className="font-semibold text-emerald-600">${item.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-semibold text-slate-700 mb-3">Top Technicians</h4>
                {technicianChart.sort((a, b) => b.revenue - a.revenue).slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">{item.name}</span>
                    <span className="font-semibold text-blue-600">{item.jobs} jobs</span>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-semibold text-slate-700 mb-3">Expense Breakdown</h4>
                {Object.entries(
                  filteredExpenses.reduce((acc, exp) => {
                    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
                    return acc;
                  }, {})
                ).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([category, amount], idx) => (
                  <div key={idx} className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">{category.replace(/_/g, ' ')}</span>
                    <span className="font-semibold text-red-600">${amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}