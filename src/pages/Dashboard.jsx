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
  Loader2
} from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

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

      const allQuotes = await base44.entities.Quote.list('-created_date', 50);
      setQuotes(allQuotes);
    } catch (err) {
      window.location.href = '/LicenseEntry';
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: quotes.length,
    thisMonth: quotes.filter(q => {
      const date = new Date(q.created_date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    revenue: quotes.reduce((sum, q) => sum + (q.total || 0), 0)
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

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Total Quotes</p>
                    <p className="text-3xl font-bold mt-1">{stats.total}</p>
                  </div>
                  <FileText className="w-10 h-10 text-emerald-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">This Month</p>
                    <p className="text-3xl font-bold mt-1">{stats.thisMonth}</p>
                  </div>
                  <Calendar className="w-10 h-10 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Total Value</p>
                    <p className="text-3xl font-bold mt-1">${stats.revenue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-yellow-400" />
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

          <Link to="/QuoteHistory">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-500 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
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
                      <div>
                        <p className="font-semibold text-slate-900">{quote.customer_name}</p>
                        <p className="text-sm text-slate-600">{quote.quote_number}</p>
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