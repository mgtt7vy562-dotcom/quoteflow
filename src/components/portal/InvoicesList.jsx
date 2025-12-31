import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, DollarSign, FileText, Loader2, CreditCard } from 'lucide-react';
import QuotePDFGenerator from '../quote/QuotePDFGenerator';

export default function InvoicesList({ userEmail }) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState(null);

  useEffect(() => {
    loadData();
  }, [userEmail]);

  const loadData = async () => {
    try {
      const allQuotes = await base44.entities.Quote.list('-created_date');
      const userQuotes = allQuotes.filter(q => q.customer_email === userEmail);
      setQuotes(userQuotes);

      const users = await base44.entities.User.list();
      if (users.length > 0) {
        setCompanyInfo(users[0]);
      }
    } catch (err) {
      console.error('Error loading invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (quote) => {
    QuotePDFGenerator.generatePDF({
      ...quote,
      company: companyInfo
    });
  };

  const handlePayNow = (quote) => {
    if (quote.payment_link) {
      window.open(quote.payment_link, '_blank');
    } else {
      alert('Payment link not available. Please contact us.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">No quotes or invoices yet</p>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700',
    sent: 'bg-blue-100 text-blue-700',
    accepted: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700'
  };

  const paymentColors = {
    unpaid: 'bg-red-100 text-red-700',
    paid: 'bg-green-100 text-green-700',
    refunded: 'bg-orange-100 text-orange-700'
  };

  return (
    <div className="space-y-4">
      {quotes.map((quote) => (
        <Card key={quote.id} className="shadow-lg">
          <CardHeader className="bg-slate-50 border-b">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-lg">Quote #{quote.quote_number}</CardTitle>
              <div className="flex gap-2">
                <Badge className={statusColors[quote.status]}>
                  {quote.status.toUpperCase()}
                </Badge>
                <Badge className={paymentColors[quote.payment_status]}>
                  {quote.payment_status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-500">Date</p>
                <p className="font-semibold">
                  {new Date(quote.created_date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-2xl font-bold text-emerald-600">
                  ${quote.total?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Load Size</span>
                <span className="font-medium">{quote.load_size?.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Debris Type</span>
                <span className="font-medium">{quote.debris_type?.replace(/_/g, ' ')}</span>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => handleDownload(quote)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              {quote.payment_status === 'unpaid' && (
                <Button
                  onClick={() => handlePayNow(quote)}
                  size="sm"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}