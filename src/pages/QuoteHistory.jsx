import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  FileText, 
  Loader2,
  Download,
  Search,
  Calendar,
  DollarSign,
  Mail
} from 'lucide-react';
import QuotePDFGenerator from '../components/quote/QuotePDFGenerator';

export default function QuoteHistory() {
  const [user, setUser] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = quotes.filter(q => 
        q.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.quote_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredQuotes(filtered);
    } else {
      setFilteredQuotes(quotes);
    }
  }, [searchTerm, quotes]);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser.license_validated) {
        window.location.href = '/LicenseEntry';
        return;
      }
      setUser(currentUser);

      const allQuotes = await base44.entities.Quote.list('-created_date');
      setQuotes(allQuotes);
      setFilteredQuotes(allQuotes);
    } catch (err) {
      window.location.href = '/LicenseEntry';
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (quote) => {
    QuotePDFGenerator.generatePDF({
      ...quote,
      company: user
    });
  };

  const handleScheduleJob = (quoteId) => {
    window.location.href = `/ScheduleJob?quoteId=${quoteId}`;
  };

  const handleSendPaymentLink = async (quote) => {
    const paymentUrl = `${window.location.origin}/PaymentPage?quoteId=${quote.id}`;
    
    if (quote.customer_email) {
      try {
        await base44.integrations.Core.SendEmail({
          to: quote.customer_email,
          subject: `Payment Request - Quote #${quote.quote_number}`,
          body: `Hi ${quote.customer_name},\n\nYour quote is ready! Please complete payment using this link:\n\n${paymentUrl}\n\nTotal Amount: $${quote.total?.toFixed(2)}\n\nThank you!`
        });
        alert('Payment link sent via email!');
      } catch (err) {
        alert('Error sending email');
      }
    } else {
      navigator.clipboard.writeText(paymentUrl);
      alert('Payment link copied to clipboard!');
    }
  };

  const handleInviteCustomer = async (quote) => {
    if (!quote.customer_email) {
      alert('No email address for this customer');
      return;
    }

    try {
      await base44.users.inviteUser(quote.customer_email, "user");
      alert(`Portal invitation sent to ${quote.customer_email}!`);
    } catch (err) {
      if (err.message.includes('already exists')) {
        alert('Customer already has portal access');
      } else {
        alert('Error sending invitation: ' + err.message);
      }
    }
  };

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700',
    sent: 'bg-blue-100 text-blue-700',
    accepted: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-purple-100 text-purple-700'
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
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-6 px-4 shadow-xl">
        <div className="max-w-6xl mx-auto">
          <a href="/Dashboard" className="inline-flex items-center text-slate-300 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8" />
            Quote History
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Search */}
        <Card className="shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by customer name or quote number..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quotes List */}
        {filteredQuotes.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg font-medium">
                {searchTerm ? 'No quotes found' : 'No quotes yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map((quote) => (
              <Card key={quote.id} className="shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">{quote.customer_name}</h3>
                          <p className="text-sm text-slate-600">{quote.quote_number}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-slate-500 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Date
                          </p>
                          <p className="font-medium text-slate-900">
                            {new Date(quote.created_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {quote.service_type === 'junk_removal' ? 'Load Size' : 'Details'}
                          </p>
                          <p className="font-medium text-slate-900">
                            {quote.service_type === 'junk_removal' && quote.load_size ? quote.load_size.replace(/_/g, ' ') : 
                             quote.items_description ? (quote.items_description.length > 30 ? quote.items_description.substring(0, 30) + '...' : quote.items_description) :
                             'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            Total
                          </p>
                          <p className="font-bold text-emerald-600 text-lg">
                            ${quote.total?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Status</p>
                          <Badge className={statusColors[quote.status]}>
                            {quote.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2">
                      <Button
                        onClick={() => handleDownload(quote)}
                        className="bg-emerald-500 hover:bg-emerald-600"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                      {quote.payment_status === 'unpaid' && (
                        <Button
                          onClick={() => handleSendPaymentLink(quote)}
                          variant="outline"
                          className="border-green-500 text-green-600 hover:bg-green-50"
                        >
                          💳 Payment
                        </Button>
                      )}
                      {quote.status === 'accepted' && !quote.job_id && (
                        <Button
                          onClick={() => handleScheduleJob(quote.id)}
                          variant="outline"
                          className="border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule
                        </Button>
                      )}
                      {quote.customer_email && (
                        <Button
                          onClick={() => handleInviteCustomer(quote)}
                          variant="outline"
                          size="sm"
                          className="border-purple-500 text-purple-600 hover:bg-purple-50"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Invite
                        </Button>
                      )}
                    </div>
                  </div>

                  {quote.customer_address && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Address:</span> {quote.customer_address}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}