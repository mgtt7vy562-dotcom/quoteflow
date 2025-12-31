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
  PenTool,
  Sparkles
} from 'lucide-react';
import QuotePDFGenerator from '../components/quote/QuotePDFGenerator';
import SignaturePad from '../components/quote/SignaturePad';
import { JunkRemovalFields, LawnCareFields, ResidentialCleaningFields } from '../components/quote/ServiceFields';

export default function CreateQuote() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [sending, setSending] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_address: '',
    customer_phone: '',
    customer_email: '',
    load_size: 'half_load',
    debris_type: 'household_items',
    items_description: '',
    base_price: '',
    fees: [],
    tax_rate: '',
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
      
      // Set default tax rate from user settings
      if (currentUser.default_tax_rate) {
        setFormData(prev => ({ ...prev, tax_rate: currentUser.default_tax_rate }));
      }
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
    const subtotal = base + feesTotal;
    const taxRate = parseFloat(formData.tax_rate) || 0;
    const taxes = (subtotal * taxRate) / 100;
    return subtotal + taxes;
  };

  const calculateTaxAmount = () => {
    const base = parseFloat(formData.base_price) || 0;
    const feesTotal = formData.fees.reduce((sum, fee) => {
      return sum + (parseFloat(fee.amount) || 0);
    }, 0);
    const subtotal = base + feesTotal;
    const taxRate = parseFloat(formData.tax_rate) || 0;
    return (subtotal * taxRate) / 100;
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
        tax_rate: parseFloat(formData.tax_rate) || 0,
        taxes: calculateTaxAmount(),
        total: total,
        status: formData.signature_url ? 'accepted' : 'draft'
      };

      const savedQuote = await base44.entities.Quote.create(quoteData);
      
      // Add/update customer in database
      const customers = await base44.entities.Customer.filter({ 
        name: formData.customer_name 
      });
      
      if (customers.length > 0) {
        // Update existing customer
        await base44.entities.Customer.update(customers[0].id, {
          email: formData.customer_email || customers[0].email,
          phone: formData.customer_phone || customers[0].phone,
          address: formData.customer_address || customers[0].address
        });
      } else {
        // Create new customer
        await base44.entities.Customer.create({
          name: formData.customer_name,
          email: formData.customer_email,
          phone: formData.customer_phone,
          address: formData.customer_address,
          total_jobs: 0,
          total_revenue: 0
        });
      }
      
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
        tax_rate: parseFloat(formData.tax_rate) || 0,
        taxes: calculateTaxAmount(),
        total: total,
        status: 'sent'
      };

      const savedQuote = await base44.entities.Quote.create(quoteData);
      
      // Add/update customer in database
      const customers = await base44.entities.Customer.filter({ 
        name: formData.customer_name 
      });
      
      if (customers.length > 0) {
        await base44.entities.Customer.update(customers[0].id, {
          email: formData.customer_email || customers[0].email,
          phone: formData.customer_phone || customers[0].phone,
          address: formData.customer_address || customers[0].address
        });
      } else {
        await base44.entities.Customer.create({
          name: formData.customer_name,
          email: formData.customer_email,
          phone: formData.customer_phone,
          address: formData.customer_address,
          total_jobs: 0,
          total_revenue: 0
        });
      }

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

  const handleAIAnalysis = async () => {
    if (!formData.items_description || formData.items_description.trim().length < 10) {
      alert('Please provide a detailed description of items to analyze');
      return;
    }

    setAnalyzing(true);
    try {
      let prompt = '';
      
      if (user.service_type === 'junk_removal') {
        prompt = `You are a junk removal pricing expert. Analyze this job description and provide detailed estimates.

Job Description: "${formData.items_description}"

Based on this, estimate:
1. Load Size: Choose from minimum_pickup (few small items), quarter_load (1-2 large items), half_load (couch + misc), three_quarter_load (room full), full_load (entire house/garage), other
2. Debris Type: AUTO-CATEGORIZE into household_items, construction_debris, outdoor_debris, mixed_trash, or other based on the items mentioned
3. Estimated Labor Hours: How many hours will this take? (0.5 to 8)
4. Truck Trips: How many truck trips needed? (1 to 5)
5. Base Price: Estimate fair market price based on: $75 minimum, +$50 per quarter load, +$25-50 per extra labor hour
6. Additional Fees: List any extra fees needed (stairs $25-50, heavy items $30-75, long carry $20-40, tight access $25, hazmat extra)
7. Upsell Opportunities: Suggest 2-3 additional services they might need (e.g., dumpster rental, recurring service, yard cleanup)
8. Notes: Brief explanation of pricing and any considerations

Provide realistic pricing for a professional junk removal service.`;
      } else if (user.service_type === 'lawn_care') {
        prompt = `You are a lawn care pricing expert. Analyze this job description and provide detailed estimates.

Job Description: "${formData.items_description}"
Property Size: ${formData.property_size || 'not specified'} sq ft

Based on this, estimate:
1. Estimated Labor Hours: How many hours will this take? (0.5 to 8)
2. Base Price: Estimate fair market price based on property size and services ($40-150 for typical residential)
3. Additional Fees: List any extra services needed (trimming $20-40, edging $15-30, fertilizing $50-100, aeration $75-150)
4. Upsell Opportunities: Suggest 2-3 additional services they might need (e.g., seasonal cleanup, mulching, pest control)
5. Notes: Brief explanation of pricing and any considerations

Provide realistic pricing for a professional lawn care service.`;
      } else {
        prompt = `You are a residential cleaning pricing expert. Analyze this job description and provide detailed estimates.

Job Description: "${formData.items_description}"
Bedrooms: ${formData.bedrooms || 'not specified'}
Bathrooms: ${formData.bathrooms || 'not specified'}

Based on this, estimate:
1. Estimated Labor Hours: How many hours will this take? (1 to 8)
2. Base Price: Estimate fair market price based on home size and cleaning type ($80-250 for typical homes)
3. Additional Fees: List any add-on services (windows $30-60, oven $40-80, fridge $30-50, laundry $25)
4. Upsell Opportunities: Suggest 2-3 additional services they might need (e.g., recurring weekly service, deep clean add-ons, organization)
5. Notes: Brief explanation of pricing and any considerations

Provide realistic pricing for a professional residential cleaning service.`;
      }
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            load_size: { type: "string" },
            debris_type: { type: "string" },
            labor_hours: { type: "number" },
            truck_trips: { type: "number" },
            base_price: { type: "number" },
            additional_fees: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  amount: { type: "number" }
                }
              }
            },
            upsell_opportunities: {
              type: "array",
              items: { type: "string" }
            },
            notes: { type: "string" }
          }
        }
      });

      const upsellText = response.upsell_opportunities?.length > 0 
        ? `\n\nUpsell Opportunities:\n${response.upsell_opportunities.map(u => `• ${u}`).join('\n')}`
        : '';

      setFormData({
        ...formData,
        load_size: response.load_size,
        debris_type: response.debris_type,
        base_price: response.base_price.toString(),
        fees: response.additional_fees || [],
        notes: formData.notes + (formData.notes ? '\n\n' : '') + 
          `AI Analysis: ${response.notes}\n` +
          `Est. Labor: ${response.labor_hours}hrs | Trips: ${response.truck_trips}${upsellText}`
      });

      alert('AI analysis complete with upsell recommendations! Review and adjust as needed.');
    } catch (err) {
      alert('Error analyzing job: ' + err.message);
    } finally {
      setAnalyzing(false);
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
              {user?.service_type === 'junk_removal' && (
                <JunkRemovalFields formData={formData} setFormData={setFormData} />
              )}
              {user?.service_type === 'lawn_care' && (
                <LawnCareFields formData={formData} setFormData={setFormData} />
              )}
              {user?.service_type === 'residential_cleaning' && (
                <ResidentialCleaningFields formData={formData} setFormData={setFormData} />
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>
                    {user?.service_type === 'junk_removal' && 'Items Description'}
                    {user?.service_type === 'lawn_care' && 'Job Description'}
                    {user?.service_type === 'residential_cleaning' && 'Cleaning Details'}
                  </Label>
                  <Button
                    type="button"
                    onClick={handleAIAnalysis}
                    disabled={analyzing || !formData.items_description || formData.items_description.trim().length < 10}
                    variant="outline"
                    size="sm"
                    className="text-purple-600 border-purple-600 hover:bg-purple-50"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-1" />
                        AI Estimate
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={formData.items_description}
                  onChange={(e) => setFormData({ ...formData, items_description: e.target.value })}
                  placeholder={
                    user?.service_type === 'junk_removal' 
                      ? "Be detailed: Couch, refrigerator, 3 bags of trash, old mattress, kitchen table with 4 chairs..."
                      : user?.service_type === 'lawn_care'
                      ? "Describe the property: Front and backyard, overgrown grass, bushes need trimming, flower beds..."
                      : "Describe the space: Kitchen needs deep clean, 2 bathrooms standard, living areas dusting..."
                  }
                  className="mt-1 h-24"
                />
                <p className="text-xs text-slate-500 mt-1">
                  💡 Describe the job in detail, then click "AI Estimate" to auto-generate pricing
                </p>
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

              <div>
                <Label>Tax Rate (%)</Label>
                <div className="relative mt-1">
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                    placeholder="7.5"
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Set your default rate in Settings
                </p>
              </div>

              <div className="pt-4 border-t">
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${(parseFloat(formData.base_price) || 0).toFixed(2)}</span>
                  </div>
                  {formData.fees.length > 0 && (
                    <div className="flex justify-between">
                      <span>Fees:</span>
                      <span>${formData.fees.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0).toFixed(2)}</span>
                    </div>
                  )}
                  {parseFloat(formData.tax_rate) > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({formData.tax_rate}%):</span>
                      <span>${calculateTaxAmount().toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Total:</span>
                  <span className="text-emerald-600">${total.toFixed(2)}</span>
                </div>
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
                disabled={saving || !formData.customer_name || !formData.base_price}
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
                disabled={sending || !formData.customer_name || !formData.base_price}
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
                disabled={sending || !formData.customer_name || !formData.base_price}
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