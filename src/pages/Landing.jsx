import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Zap, FileText, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';

export default function Landing() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authed = await base44.auth.isAuthenticated();
    setIsAuthenticated(authed);
  };

  const handleSignUp = () => {
    // TODO: After Stripe setup, redirect to checkout with trial
    // For now, just redirect to signup
    base44.auth.redirectToLogin('/Dashboard');
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin('/Dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-8 h-8 text-emerald-500" />
            <h1 className="text-2xl font-bold text-white">QuoteFlow CRM</h1>
          </div>
          <div className="flex gap-3">
            {isAuthenticated ? (
              <Button onClick={() => window.location.href = '/Dashboard'} className="bg-emerald-500 hover:bg-emerald-600">
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleLogin} className="text-white border-white/20 hover:bg-white/10">
                  Log In
                </Button>
                <Button onClick={handleSignUp} className="bg-emerald-500 hover:bg-emerald-600">
                  Start Free Trial
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
          The Complete CRM for<br />
          <span className="text-emerald-500">Junk Removal Pros</span>
        </h2>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Create quotes in seconds, schedule jobs, track revenue, and delight customers with our all-in-one platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button onClick={handleSignUp} size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-lg px-8 py-6">
            Start Your 14-Day Free Trial
          </Button>
        </div>
        <p className="text-slate-400 text-sm">No credit card required • Cancel anytime</p>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-white text-center mb-12">Everything You Need to Run Your Business</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <Zap className="w-12 h-12 text-emerald-500 mb-4" />
            <h4 className="text-xl font-bold text-white mb-2">Lightning-Fast Quotes</h4>
            <p className="text-slate-300">Generate professional PDF quotes in seconds with AI-powered pricing suggestions.</p>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <Calendar className="w-12 h-12 text-blue-500 mb-4" />
            <h4 className="text-xl font-bold text-white mb-2">Smart Scheduling</h4>
            <p className="text-slate-300">Manage jobs, track progress, and send automated reminders to customers.</p>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <DollarSign className="w-12 h-12 text-yellow-500 mb-4" />
            <h4 className="text-xl font-bold text-white mb-2">Revenue Tracking</h4>
            <p className="text-slate-300">Monitor income, expenses, and hit your monthly revenue goals with ease.</p>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <Users className="w-12 h-12 text-purple-500 mb-4" />
            <h4 className="text-xl font-bold text-white mb-2">Customer Portal</h4>
            <p className="text-slate-300">Give customers a branded portal to view jobs, pay invoices, and request quotes.</p>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <TrendingUp className="w-12 h-12 text-pink-500 mb-4" />
            <h4 className="text-xl font-bold text-white mb-2">Business Analytics</h4>
            <p className="text-slate-300">AI-powered insights to grow revenue and improve customer retention.</p>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <FileText className="w-12 h-12 text-orange-500 mb-4" />
            <h4 className="text-xl font-bold text-white mb-2">Loyalty Rewards</h4>
            <p className="text-slate-300">Built-in referral program keeps customers coming back for more.</p>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-white text-center mb-12">Simple, Transparent Pricing</h3>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly */}
          <Card className="bg-slate-800/50 border-slate-700 p-8">
            <h4 className="text-2xl font-bold text-white mb-2">Monthly</h4>
            <p className="text-slate-400 mb-6">Perfect for getting started</p>
            <div className="mb-6">
              <span className="text-5xl font-bold text-white">$29</span>
              <span className="text-slate-400">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500" />
                14-day free trial
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500" />
                Unlimited quotes & jobs
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500" />
                Customer portal
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500" />
                Analytics & insights
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500" />
                Cancel anytime
              </li>
            </ul>
            <Button onClick={handleSignUp} className="w-full bg-emerald-500 hover:bg-emerald-600">
              Start Free Trial
            </Button>
          </Card>

          {/* Yearly */}
          <Card className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border-2 border-emerald-500 p-8 relative">
            <div className="absolute -top-4 right-8 bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-full">
              SAVE $49
            </div>
            <h4 className="text-2xl font-bold text-white mb-2">Yearly</h4>
            <p className="text-slate-400 mb-6">Best value - 2 months free!</p>
            <div className="mb-6">
              <span className="text-5xl font-bold text-white">$299</span>
              <span className="text-slate-400">/year</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500" />
                14-day free trial
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500" />
                Everything in Monthly
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500" />
                Priority support
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500" />
                Early access to features
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500" />
                Save $49/year
              </li>
            </ul>
            <Button onClick={handleSignUp} className="w-full bg-emerald-500 hover:bg-emerald-600">
              Start Free Trial
            </Button>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h3 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Business?</h3>
        <p className="text-xl text-slate-300 mb-8">Join hundreds of junk removal pros using QuoteFlow</p>
        <Button onClick={handleSignUp} size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-lg px-8 py-6">
          Start Your Free Trial Today
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
          <p>&copy; 2025 QuoteFlow CRM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}