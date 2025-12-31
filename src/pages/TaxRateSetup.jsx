import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, DollarSign } from 'lucide-react';

export default function TaxRateSetup() {
  const [taxRate, setTaxRate] = useState('');
  const [saving, setSaving] = useState(false);
  const [skipTax, setSkipTax] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const rate = skipTax ? 0 : parseFloat(taxRate);
      await base44.auth.updateMe({ default_tax_rate: rate });
      window.location.href = '/Dashboard';
    } catch (err) {
      alert('Error saving tax rate');
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setSkipTax(true);
    setSaving(true);
    try {
      await base44.auth.updateMe({ default_tax_rate: 0 });
      window.location.href = '/Dashboard';
    } catch (err) {
      alert('Error saving settings');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardContent className="p-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <DollarSign className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Set Your Tax Rate</h1>
          <p className="text-slate-600 text-center mb-6">
            This will be automatically applied to all quotes. You can always change it later in Settings.
          </p>

          <div className="space-y-4">
            <div>
              <Label>Default Tax Rate (%)</Label>
              <div className="relative mt-2">
                <Input
                  type="number"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  placeholder="7.5"
                  className="pr-8 text-lg h-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Enter your local sales tax rate (e.g., 7.5 for 7.5%)
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || !taxRate}
              className="w-full bg-emerald-500 hover:bg-emerald-600 h-12 text-lg"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save & Continue'
              )}
            </Button>

            <Button
              onClick={handleSkip}
              disabled={saving}
              variant="outline"
              className="w-full h-10"
            >
              Skip - I charge flat rates
            </Button>

            <p className="text-xs text-slate-500 text-center">
              💡 Many service businesses don't charge tax. If you charge flat rates without tax, click "Skip"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}