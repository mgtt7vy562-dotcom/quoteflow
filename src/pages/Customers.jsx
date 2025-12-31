import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Search,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  Loader2,
  Send,
  Download
} from 'lucide-react';

export default function Customers() {
  const [user, setUser] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(null);

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

      const allCustomers = await base44.entities.Customer.list('-total_revenue');
      setCustomers(allCustomers);
    } catch (err) {
      window.location.href = '/LicenseEntry';
    } finally {
      setLoading(false);
    }
  };

  const sendFollowUp = async (customer) => {
    if (!customer.email) {
      alert('Customer has no email address');
      return;
    }

    setSending(customer.id);
    try {
      const googleLink = user.google_business_url || 'https://g.page/r/YOUR_GOOGLE_BUSINESS_ID/review';
      
      await base44.integrations.Core.SendEmail({
        to: customer.email,
        subject: `Thank you from ${user.company_name}!`,
        body: `Hi ${customer.name},

Thank you for choosing ${user.company_name} for your junk removal needs! We truly appreciate your business.

If you were happy with our service, we'd be grateful if you could leave us a review:
${googleLink}

Your feedback helps us grow and serve more customers like you!

Best regards,
${user.company_name}
${user.phone || ''}`
      });

      alert('Follow-up email sent!');
    } catch (err) {
      alert('Error sending email');
    } finally {
      setSending(null);
    }
  };

  const handleExportCustomers = () => {
    const csvData = [
      ['Customer Database Export'],
      [`Export Date: ${new Date().toLocaleDateString()}`],
      [''],
      ['Name', 'Email', 'Phone', 'Address', 'Source', 'Total Jobs', 'Total Revenue', 'Last Job Date', 'Notes'],
      ...customers.map(c => [
        c.name || '',
        c.email || '',
        c.phone || '',
        c.address || '',
        c.source || '',
        c.total_jobs || 0,
        c.total_revenue || 0,
        c.last_job_date || '',
        c.notes || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

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
          <Link to={createPageUrl('Dashboard')} className="inline-flex items-center text-slate-300 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Customer Database</h1>
              <p className="text-slate-400 mt-1">{customers.length} customers</p>
            </div>
            <Button
              onClick={handleExportCustomers}
              className="bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customers..."
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Customer List */}
        <div className="space-y-4">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-slate-900">{customer.name}</h3>
                      {customer.services_used && customer.services_used.length > 0 && (
                        <div className="flex gap-1">
                          {customer.services_used.includes('junk_removal') && (
                            <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                              🗑️ Junk Removal
                            </span>
                          )}
                          {customer.services_used.includes('lawn_care') && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                              🌱 Lawn Care
                            </span>
                          )}
                          {customer.services_used.includes('residential_cleaning') && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                              ✨ Cleaning
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {customer.email && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4" />
                          {customer.email}
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4" />
                          {customer.phone}
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4" />
                          {customer.address}
                        </div>
                      )}
                      {customer.last_job_date && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4" />
                          Last job: {new Date(customer.last_job_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm text-slate-500">Jobs</p>
                      <p className="text-2xl font-bold text-slate-900">{customer.total_jobs || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-500">Revenue</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        ${(customer.total_revenue || 0).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => sendFollowUp(customer)}
                      disabled={sending === customer.id || !customer.email}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {sending === customer.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Follow Up
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600">No customers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}