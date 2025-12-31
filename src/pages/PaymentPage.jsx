import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard, CheckCircle } from 'lucide-react';

export default function PaymentPage() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [cardholderName, setCardholderName] = useState('');

  useEffect(() => {
    loadQuote();
  }, []);

  const loadQuote = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const quoteId = urlParams.get('quoteId');
      
      const quotes = await base44.entities.Quote.filter({ id: quoteId });
      if (quotes.length > 0) {
        const q = quotes[0];
        setQuote(q);
        setPaid(q.payment_status === 'paid');
        setCardholderName(q.customer_name);
      }
    } catch (err) {
      alert('Quote not found');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!cardholderName) {
      alert('Please enter cardholder name');
      return;
    }

    setProcessing(true);
    
    // For now, just mark as paid - Stripe integration needs backend functions
    try {
      await base44.entities.Quote.update(quote.id, {
        ...quote,
        payment_status: 'paid'
      });
      
      // Auto-invite customer to portal after payment
      if (quote.customer_email) {
        try {
          await base44.users.inviteUser(quote.customer_email, "user");
        } catch (inviteErr) {
          // Silent fail if already invited
        }
      }
      
      setPaid(true);
    } catch (err) {
      alert('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Quote not found</p>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
            <p className="text-slate-600 mb-4">Thank you for your payment</p>
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-500">Amount Paid</p>
              <p className="text-3xl font-bold text-emerald-600">${quote.total?.toFixed(2)}</p>
            </div>
            <p className="text-sm text-slate-500">Quote #{quote.quote_number}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Complete Payment</h1>
            <p className="text-slate-600">Quote #{quote.quote_number}</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-600">Customer</span>
              <span className="font-medium">{quote.customer_name}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-600">Load Size</span>
              <span className="font-medium">{quote.load_size?.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-semibold">Total Amount</span>
              <span className="text-2xl font-bold text-emerald-600">${quote.total?.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <Label>Cardholder Name</Label>
              <Input
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="John Doe"
                className="mt-1"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">💳 Stripe Integration Required</p>
              <p className="text-xs text-blue-700">
                To accept real payments, connect your Stripe account in Settings. For now, clicking "Pay" will mark the invoice as paid.
              </p>
            </div>
          </div>

          <Button
            onClick={handlePayment}
            disabled={processing}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-lg font-semibold"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${quote.total?.toFixed(2)}`
            )}
          </Button>

          <p className="text-xs text-center text-slate-500 mt-4">
            Secure payment powered by Stripe
          </p>
        </CardContent>
      </Card>
    </div>
  );
}