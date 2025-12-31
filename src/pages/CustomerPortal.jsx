import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Calendar, FileText, DollarSign, User } from 'lucide-react';
import JobHistory from '../components/portal/JobHistory';
import UpcomingJobs from '../components/portal/UpcomingJobs';
import InvoicesList from '../components/portal/InvoicesList';
import RequestQuote from '../components/portal/RequestQuote';
import ProfileManager from '../components/portal/ProfileManager';
import LoyaltyStatus from '../components/portal/LoyaltyStatus';

export default function CustomerPortal() {
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Load customer data for loyalty info
      const customers = await base44.entities.Customer.filter({ 
        email: currentUser.email 
      });
      if (customers.length > 0) {
        setCustomer(customers[0]);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold mb-2">Customer Portal</h1>
          <p className="text-slate-400">Welcome back, {user?.full_name || user?.email}</p>
          {customer && (
            <div className="mt-4 flex gap-6 text-sm">
              <div>
                <span className="text-slate-400">Total Jobs: </span>
                <span className="font-semibold">{customer.total_jobs || 0}</span>
              </div>
              <div>
                <span className="text-slate-400">Total Spent: </span>
                <span className="font-semibold text-emerald-400">
                  ${(customer.total_revenue || 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <LoyaltyStatus customer={customer || { 
          loyalty_tier: 'bronze', 
          loyalty_points: 0, 
          referrals_made: 0, 
          email: user?.email 
        }} />
        
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="upcoming" className="flex items-center gap-2 py-3">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Upcoming</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 py-3">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2 py-3">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Invoices</span>
            </TabsTrigger>
            <TabsTrigger value="request" className="flex items-center gap-2 py-3">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">New Quote</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 py-3">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <UpcomingJobs userEmail={user?.email} />
          </TabsContent>

          <TabsContent value="history">
            <JobHistory userEmail={user?.email} />
          </TabsContent>

          <TabsContent value="invoices">
            <InvoicesList userEmail={user?.email} />
          </TabsContent>

          <TabsContent value="request">
            <RequestQuote user={user} customer={customer} onSuccess={loadData} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileManager customer={customer} user={user} onUpdate={loadData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}