import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Key, Loader2, FileText, Zap } from 'lucide-react';

export default function LicenseEntry() {
  const [licenseKey, setLicenseKey] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkExistingLicense();
  }, []);

  const checkExistingLicense = async () => {
    try {
      const user = await base44.auth.me();
      if (user.license_validated) {
        window.location.href = '/Dashboard';
      }
    } catch (err) {
      // User not logged in or no license
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if license key exists and is active
      const keys = await base44.entities.LicenseKey.filter({ 
        key: licenseKey,
        is_active: true 
      });

      if (keys.length === 0) {
        setError('Invalid or inactive license key');
        setLoading(false);
        return;
      }

      const keyData = keys[0];
      
      // Check if email matches
      if (keyData.email.toLowerCase() !== email.toLowerCase()) {
        setError('Email does not match license key');
        setLoading(false);
        return;
      }

      // Update user with license info
      await base44.auth.updateMe({
        email: email,
        license_key: licenseKey,
        license_validated: true
      });

      window.location.href = '/Dashboard';
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/20">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Quote Generator</h1>
          <p className="text-slate-400">Professional quotes in seconds</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <Zap className="w-5 h-5 text-emerald-400 mb-2" />
            <p className="text-sm text-slate-300 font-medium">Fast PDFs</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <FileText className="w-5 h-5 text-emerald-400 mb-2" />
            <p className="text-sm text-slate-300 font-medium">Your Branding</p>
          </div>
        </div>

        {/* License Form */}
        <Card className="bg-white/5 backdrop-blur border-slate-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                License Key
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email (from purchase)
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                'Activate License'
              )}
            </Button>
          </form>

          <p className="text-xs text-slate-500 text-center mt-4">
            Purchase at gumroad.com if you don't have a license
          </p>
        </Card>
      </div>
    </div>
  );
}