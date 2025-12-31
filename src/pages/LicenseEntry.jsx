import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Key, Loader2, FileText, Zap, Download, Check } from 'lucide-react';

export default function LicenseEntry() {
  const [licenseKey, setLicenseKey] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [activeTab, setActiveTab] = useState('license'); // 'license' or 'subscription'

  useEffect(() => {
    checkExistingAccess();
    
    // PWA Install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const checkExistingAccess = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlKey = urlParams.get('key');
    const urlEmail = urlParams.get('email');
    
    // If we have license params, validate and proceed
    if (urlKey && urlEmail) {
      try {
        // Check if the license key exists and matches email
        const keys = await base44.entities.LicenseKey.list();
        const matchingKey = keys.find(k => 
          k.key === urlKey && 
          k.is_active && 
          k.email.toLowerCase() === urlEmail.toLowerCase()
        );
        
        if (matchingKey) {
          // Valid license - redirect to dashboard (login not required for public app)
          window.location.href = '/Dashboard';
          return;
        } else {
          setError('Invalid license key or email does not match');
          setChecking(false);
          return;
        }
      } catch (err) {
        setError('Error validating license key');
        setChecking(false);
        return;
      }
    }
    
    // Try to get user if logged in
    try {
      const user = await base44.auth.me();
      if (user.license_validated || user.subscription_status === 'active') {
        window.location.href = '/Dashboard';
        return;
      }
    } catch (err) {
      // Not logged in, that's ok for public app
    }
    
    setChecking(false);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleLicenseSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Redirect to login first - validation happens after authentication
    base44.auth.redirectToLogin(`/LicenseEntry?key=${encodeURIComponent(licenseKey.trim())}&email=${encodeURIComponent(email.trim())}`);
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

        {/* Install App Button */}
        {showInstallButton && (
          <Button
            onClick={handleInstallClick}
            className="w-full mb-4 bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-semibold"
          >
            <Download className="w-5 h-5 mr-2" />
            Add to Home Screen
          </Button>
        )}

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

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'subscription'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Subscribe
          </button>
          <button
            onClick={() => setActiveTab('license')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'license'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            License Key
          </button>
        </div>

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <Card className="bg-white/5 backdrop-blur border-slate-700 p-6">
            <div className="space-y-4">
              {/* Monthly Plan */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">Monthly</h3>
                    <p className="text-sm text-slate-400">Pay as you go</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">$12</p>
                    <p className="text-sm text-slate-400">/month</p>
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 mr-2" />
                    Unlimited quotes
                  </li>
                  <li className="flex items-center text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 mr-2" />
                    Custom branding
                  </li>
                  <li className="flex items-center text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 mr-2" />
                    Cancel anytime
                  </li>
                </ul>
                <Button
                  onClick={() => window.open('https://gumroad.com/your-monthly-product', '_blank')}
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                >
                  Subscribe Monthly
                </Button>
              </div>

              {/* Yearly Plan */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border-2 border-emerald-500 rounded-xl p-5 relative">
                <div className="absolute -top-3 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  SAVE $25
                </div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">Yearly</h3>
                    <p className="text-sm text-slate-400">Best value</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">$119</p>
                    <p className="text-sm text-slate-400">/year</p>
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 mr-2" />
                    Everything in Monthly
                  </li>
                  <li className="flex items-center text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 mr-2" />
                    2 months free
                  </li>
                  <li className="flex items-center text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 mr-2" />
                    Priority support
                  </li>
                </ul>
                <Button
                  onClick={() => window.open('https://gumroad.com/your-yearly-product', '_blank')}
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                >
                  Subscribe Yearly
                </Button>
              </div>

              <p className="text-xs text-slate-500 text-center">
                After purchase, come back and click "I've subscribed" to activate
              </p>
            </div>
          </Card>
        )}

        {/* License Key Tab */}
        {activeTab === 'license' && (
          <Card className="bg-white/5 backdrop-blur border-slate-700 p-6">
            <form onSubmit={handleLicenseSubmit} className="space-y-4">
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
              One-time purchase available at gumroad.com
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}