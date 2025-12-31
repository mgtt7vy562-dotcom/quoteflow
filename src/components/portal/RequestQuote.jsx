import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Send } from 'lucide-react';

export default function RequestQuote({ user, customer, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    phone: customer?.phone || '',
    address: customer?.address || '',
    items_description: '',
    preferred_date: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await base44.entities.Lead.create({
        phone: formData.phone,
        message: `Quote Request from Customer Portal:
        
Items: ${formData.items_description}
Address: ${formData.address}
Preferred Date: ${formData.preferred_date || 'Not specified'}
Notes: ${formData.notes || 'None'}`,
        source: 'website',
        status: 'new'
      });

      // Update customer info if changed
      if (customer && (formData.phone !== customer.phone || formData.address !== customer.address)) {
        await base44.entities.Customer.update(customer.id, {
          phone: formData.phone,
          address: formData.address
        });
      }

      alert('Quote request submitted successfully! We will contact you soon.');
      setFormData({
        phone: formData.phone,
        address: formData.address,
        items_description: '',
        preferred_date: '',
        notes: ''
      });
      
      if (onSuccess) onSuccess();
    } catch (err) {
      alert('Error submitting quote request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle>Request a New Quote</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Phone Number *</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
            <div>
              <Label>Preferred Date</Label>
              <Input
                type="date"
                value={formData.preferred_date}
                onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <Label>Service Address *</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, City, ST 12345"
              required
            />
          </div>

          <div>
            <Label>What needs to be removed? *</Label>
            <Textarea
              value={formData.items_description}
              onChange={(e) => setFormData({ ...formData, items_description: e.target.value })}
              placeholder="Describe the items you need hauled away (e.g., couch, mattress, appliances, construction debris, etc.)"
              className="h-32"
              required
            />
          </div>

          <div>
            <Label>Additional Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special instructions or requirements..."
              className="h-24"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 h-12 text-lg"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit Quote Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}