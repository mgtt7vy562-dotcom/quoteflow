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

  // Popular Services Analysis
  const loadSizeData = {};
  const debrisTypeData = {};
  
  filteredJobs.forEach(job => {
    loadSizeData[job.load_size] = (loadSizeData[job.load_size] || 0) + 1;
    debrisTypeData[job.debris_type] = (debrisTypeData[job.debris_type] || 0) + 1;
  });

  const loadSizeChart = Object.entries(loadSizeData).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').toUpperCase(),
    jobs: value,
    revenue: filteredJobs.filter(j => j.load_size === name).reduce((sum, j) => sum + (j.total_price || 0), 0)
  }));

  const debrisTypeChart = Object.entries(debrisTypeData).map(([name, value]) => ({
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <TrendingUp className="w-8 h-8" />
              Advanced Analytics
            </h1>
            <Button
              onClick={handleExportCSV}
              className="bg-emerald-500 hover:bg-emerald-600"
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-emerald-600">${totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-10 h-10 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Net Profit</p>
                  <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${totalProfit.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{profitMargin}% margin</p>
                </div>
                <Award className="w-10 h-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Completed Jobs</p>
                  <p className="text-2xl font-bold text-blue-600">{filteredJobs.length}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    ${filteredJobs.length > 0 ? (totalRevenue / filteredJobs.length).toFixed(0) : 0} avg
                  </p>
                </div>
                <Package className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

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
          {/* Popular Load Sizes */}
          <Card className="shadow-lg">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Popular Load Sizes</CardTitle>
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

          {/* Debris Types */}
          <Card className="shadow-lg">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Debris Type Distribution</CardTitle>
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

        {/* Detailed Breakdown */}
        <Card className="shadow-lg">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-slate-700 mb-3">Top Load Size</h4>
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