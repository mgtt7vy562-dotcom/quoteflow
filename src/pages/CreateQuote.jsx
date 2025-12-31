import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  FileText, 
  Loader2,
  Download,
  Send,
  Mail,
  MessageSquare,
  PenTool
} from 'lucide-react';
import QuotePDFGenerator from '../components/quote/QuotePDFGenerator';
import SignaturePad from '../components/quote/SignaturePad';

export default function CreateQuote() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_address: '',
    customer_phone: '',
    customer_email: '',
    load_count: 1,
    items_description: '',
    base_price: '',
    fees: [],
    notes: '',
    signature_url: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser.license_validated) {
        window.location.href = '/LicenseEntry';
        return;
      }
      setUser(currentUser);
    } catch (err) {
      window.location.href = '/LicenseEntry';
    } finally {
      setLoading(false);
    }
  };

  const addFee = () => {
    setFormData({
      ...formData,
      fees: [...formData.fees, { name: '', amount: '' }]
    });
  };

  const updateFee = (index, field, value) => {
    const newFees = [...formData.fees];
    newFees[index][field] = value;
    setFormData({ ...formData, fees: newFees });
  };

  const removeFee = (index) => {
    setFormData({
      ...formData,
      fees: formData.fees.filter((_, i) => i !== index)
    });
  };

  const calculateTotal = () => {
    const base = parseFloat(formData.base_price) || 0;
    const feesTotal = formData.fees.reduce((sum, fee) => {
      return sum + (parseFloat(fee.amount) || 0);
    }, 0);
    return base + feesTotal;
  };

  const generateQuoteNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `QT-${year}${month}-${random}`;
  };

  const handleSaveAndDownload = async () => {
    setSaving(true);
    try {
      const total = calculateTotal();
      const quoteNumber = generateQuoteNumber();
      
      const quoteData = {
        ...formData,
        quote_number: quoteNumber,
        base_price: parseFloat(formData.base_price) || 0,
        total: total,
        status: formData.signature_url ? 'accepted' : 'draft'
      };

      const savedQuote = await base44.entities.Quote.create(quoteData);
      
      // Generate PDF
      QuotePDFGenerator.generatePDF({
        ...savedQuote,
        company: user
      });

      // Redirect to history
      setTimeout(() => {
        window.location.href = '/QuoteHistory';
      }, 500);
    } catch (err) {
      alert('Error saving quote');
      setSaving(false);
    }
  };

  const handleSendQuote = async (method) => {
    if (!formData.customer_email && !formData.customer_phone) {
      alert('Please add customer email or phone to send quote');
      return;
    }

    setSending(true);
    try {
      const total = calculateTotal();
      const quoteNumber = generateQuoteNumber();
      
      const quoteData = {
        ...formData,
        quote_number: quoteNumber,
        base_price: parseFloat(formData.base_price) || 0,
        total: total,
        status: 'sent'
      };

      const savedQuote = await base44.entities.Quote.create(quoteData);

      const message = `Hi ${formData.customer_name}! Here's your quote from ${user.company_name}:

Quote #${quoteNumber}
Total: $${total.toFixed(2)}
Items: ${formData.items_description}

${formData.notes ? `Notes: ${formData.notes}` : ''}

Reply to accept this quote!`;

      if (method === 'email' && formData.customer_email) {
        await base44.integrations.Core.SendEmail({
          to: formData.customer_email,
          subject: `Quote #${quoteNumber} from ${user.company_name}`,
          body: message
        });
        alert('Quote sent via email!');
      } else if (method === 'sms' && formData.customer_phone) {
        alert(`SMS sending ready! Send this to ${formData.customer_phone}:\n\n${message}`);
      }

      window.location.href = '/QuoteHistory';
    } catch (err) {
      alert('Error sending quote');
      setSending(false);
    }
  };

  const handleSignature = async (signatureDataUrl) => {
    try {
      // Convert data URL to blob
      const blob = await fetch(signatureDataUrl).then(r => r.blob());
      const file = new File([blob], 'signature.png', { type: 'image/png' });
      
      // Upload signature
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      setFormData({ ...formData, signature_url: file_url });
      setShowSignaturePad(false);
    } catch (err) {
      alert('Error saving signature');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-6 px-4 shadow-xl">
        <div className="max-w-4xl mx-auto">
          <a href="/Dashboard" className="inline-flex items-center text-slate-300 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8" />
            Create New Quote
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="space-y-6">
          {/* Customer Info */}
          <Card className="shadow-lg">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Customer Name *</Label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Address</Label>
                <Input
                  value={formData.customer_address}
                  onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                  placeholder="123 Main St, City, ST 12345"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Email (optional for sending)</Label>
                <Input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  placeholder="customer@email.com"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card className="shadow-lg">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Number of Loads *</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3].map((num) => (
                    <Button
                      key={num}
                      type="button"
                      variant={formData.load_count === num ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, load_count: num })}
                      className={formData.load_count === num ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                    >
                      {num} {num === 1 ? 'Load' : 'Loads'}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Items Description *</Label>
                <Textarea
                  value={formData.items_description}
                  onChange={(e) => setFormData({ ...formData, items_description: e.target.value })}
                  placeholder="Couch, refrigerator, 3 bags of trash..."
                  className="mt-1 h-24"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="shadow-lg">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Pricing Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Base Price *</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <Input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Additional Fees</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFee}
                    className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Fee
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.fees.map((fee, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={fee.name}
                        onChange={(e) => updateFee(index, 'name', e.target.value)}
                        placeholder="e.g. Stairs, Extra Labor"
                        className="flex-1"
                      />
                      <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                        <Input
                          type="number"
                          value={fee.amount}
                          onChange={(e) => updateFee(index, 'amount', e.target.value)}
                          placeholder="0.00"
                          className="pl-7"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFee(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Total:</span>
                  <span className="text-emerald-600">${total.toFixed(2)}</span>
                </div>
                <p className="text-sm text-slate-500 mt-2 text-right">
                  Customer sees: "All fees included"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="shadow-lg">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Additional Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special instructions or notes..."
                className="h-20"
              />
            </CardContent>
          </Card>

          {/* Signature */}
          <Card className="shadow-lg">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Customer Signature (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {formData.signature_url ? (
                <div className="space-y-3">
                  <img src={formData.signature_url} alt="Signature" className="border rounded-lg p-2 bg-white" />
                  <Button
                    variant="outline"
                    onClick={() => setFormData({ ...formData, signature_url: '' })}
                    className="w-full"
                  >
                    Clear Signature
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSignaturePad(true)}
                  className="w-full h-12"
                >
                  <PenTool className="w-5 h-5 mr-2" />
                  Add Signature
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                onClick={handleSaveAndDownload}
                disabled={saving || !formData.customer_name || !formData.base_price || !formData.items_description}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 h-14 text-lg font-semibold"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Save & Download PDF
                  </>
                )}
              </Button>
            </div>

            {formData.customer_email && (
              <Button
                onClick={() => handleSendQuote('email')}
                disabled={sending || !formData.customer_name || !formData.base_price || !formData.items_description}
                variant="outline"
                className="w-full h-12"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Send via Email
                  </>
                )}
              </Button>
            )}

            {formData.customer_phone && (
              <Button
                onClick={() => handleSendQuote('sms')}
                disabled={sending || !formData.customer_name || !formData.base_price || !formData.items_description}
                variant="outline"
                className="w-full h-12"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Send via SMS
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {showSignaturePad && (
        <SignaturePad
          onSave={handleSignature}
          onCancel={() => setShowSignaturePad(false)}
        />
      )}
    </div>
  );
}