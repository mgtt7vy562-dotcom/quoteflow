import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield,
  Users,
  Loader2,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Mail,
  ArrowLeft,
  Receipt,
  Send
} from 'lucide-react';
import EmailBroadcast from '../components/admin/EmailBroadcast.jsx';
import SalesTaxCalculator from '../components/admin/SalesTaxCalculator.jsx';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      // Only admins can access this page
      if (currentUser.role !== 'admin') {
        window.location.href = '/Dashboard';
        return;
      }
      
      setUser(currentUser);

      // Load all users (admin can see all users)
      const allUsers = await base44.entities.User.list('-created_date');
      setUsers(allUsers);
    } catch (err) {
      window.location.href = '/Landing';
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    trial: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  const planColors = {
    monthly: 'bg-purple-100 text-purple-700',
    yearly: 'bg-emerald-100 text-emerald-700'
  };

  const activeSubscribers = users.filter(u => u.subscription_status === 'active');
  const trialUsers = users.filter(u => u.subscription_status === 'trial');
  
  // Calculate MRR (convert yearly to monthly)
  const totalMRR = users.reduce((sum, u) => {
    if (u.subscription_status === 'active') {
      const monthlyRevenue = u.subscription_plan === 'yearly' ? 299 / 12 : 29;
      return sum + monthlyRevenue;
    }
    return sum;
  }, 0);

  const activeMonthly = activeSubscribers.filter(u => u.subscription_plan === 'monthly').length;
  const activeYearly = activeSubscribers.filter(u => u.subscription_plan === 'yearly').length;

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
          <a href="/Dashboard" className="inline-flex items-center text-slate-300 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8" />
            Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-2">Manage subscribers and monitor revenue</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Monthly MRR</p>
                  <p className="text-3xl font-bold mt-1 text-emerald-600">
                    ${totalMRR.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {activeMonthly} monthly • {activeYearly} yearly
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Active Subscribers</p>
                  <p className="text-3xl font-bold mt-1">{activeSubscribers.length}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Free Trials</p>
                  <p className="text-3xl font-bold mt-1">{trialUsers.length}</p>
                </div>
                <Users className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Total Users</p>
                  <p className="text-3xl font-bold mt-1">{users.length}</p>
                </div>
                <Users className="w-10 h-10 text-slate-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="subscribers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subscribers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Subscribers
            </TabsTrigger>
            <TabsTrigger value="tax" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Sales Tax
            </TabsTrigger>
            <TabsTrigger value="broadcast" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Email Broadcast
            </TabsTrigger>
          </TabsList>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers">
            <Card className="shadow-lg">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>All Subscribers</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {users.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No users yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {users.map((userData) => (
                      <div
                        key={userData.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div>
                              <p className="font-semibold text-slate-900">{userData.full_name || 'No Name'}</p>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Mail className="w-3 h-3" />
                                {userData.email}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge className={statusColors[userData.subscription_status] || statusColors.inactive}>
                              {userData.subscription_status || 'inactive'}
                            </Badge>
                            
                            {userData.subscription_plan && (
                              <Badge className={planColors[userData.subscription_plan]}>
                                {userData.subscription_plan === 'monthly' ? '$29/mo' : '$299/yr'}
                              </Badge>
                            )}

                            {userData.role === 'admin' && (
                              <Badge className="bg-purple-100 text-purple-700">
                                Admin
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="text-right text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Joined: {new Date(userData.created_date).toLocaleDateString()}
                          </div>
                          {userData.subscription_started_at && (
                            <div className="text-xs text-slate-500 mt-1">
                              Subscribed: {new Date(userData.subscription_started_at).toLocaleDateString()}
                            </div>
                          )}
                          {userData.trial_ends_at && userData.subscription_status === 'trial' && (
                            <div className="text-xs text-blue-600 mt-1">
                              Trial ends: {new Date(userData.trial_ends_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tax Tab */}
          <TabsContent value="tax">
            <SalesTaxCalculator users={users} />
          </TabsContent>

          {/* Email Broadcast Tab */}
          <TabsContent value="broadcast">
            <EmailBroadcast users={users} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}