import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, AlertTriangle, Trash2 } from 'lucide-react';

export default function LockScreen({ onUnlock, onReset }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetConfirm, setResetConfirm] = useState('');

  const handleUnlock = (e) => {
    e.preventDefault();
    setError('');
    
    const success = onUnlock(password);
    if (success) {
      setPassword('');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleReset = () => {
    if (resetConfirm === 'DELETE EVERYTHING') {
      onReset();
    } else {
      setError('Please type "DELETE EVERYTHING" to confirm');
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full shadow-2xl border-2 border-slate-700">
        <CardHeader className="bg-slate-800 border-b border-slate-700">
          <CardTitle className="flex items-center gap-3 text-2xl text-white">
            <Lock className="w-8 h-8 text-emerald-400" />
            CRM Locked
          </CardTitle>
          <p className="text-sm text-slate-400 mt-2">
            {showReset ? 'Reset your password' : 'Enter your master password to continue'}
          </p>
        </CardHeader>
        <CardContent className="p-6 bg-slate-900">
          {!showReset ? (
            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <Label htmlFor="unlock-password" className="text-slate-300">Master Password</Label>
                <Input
                  id="unlock-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="mt-1 bg-slate-800 border-slate-700 text-white"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-3">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg font-semibold"
              >
                <Lock className="w-5 h-5 mr-2" />
                Unlock CRM
              </Button>

              <button
                type="button"
                onClick={() => setShowReset(true)}
                className="w-full text-sm text-slate-400 hover:text-slate-300 underline"
              >
                Forgot Password?
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-200 font-semibold mb-2">⚠️ WARNING: NUCLEAR OPTION</p>
                    <p className="text-sm text-red-300">
                      This will permanently delete ALL data from this application:
                    </p>
                    <ul className="text-xs text-red-300 mt-2 space-y-1">
                      <li>• All customer records</li>
                      <li>• All quotes and invoices</li>
                      <li>• All jobs and schedules</li>
                      <li>• All settings and backups</li>
                      <li>• Your master password</li>
                    </ul>
                    <p className="text-xs text-red-200 font-semibold mt-3">
                      This action CANNOT be undone!
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="reset-confirm" className="text-slate-300">
                  Type <span className="font-mono font-bold text-red-400">DELETE EVERYTHING</span> to confirm:
                </Label>
                <Input
                  id="reset-confirm"
                  type="text"
                  value={resetConfirm}
                  onChange={(e) => setResetConfirm(e.target.value)}
                  placeholder="DELETE EVERYTHING"
                  className="mt-1 bg-slate-800 border-slate-700 text-white font-mono"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowReset(false);
                    setResetConfirm('');
                    setError('');
                  }}
                  variant="outline"
                  className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReset}
                  disabled={resetConfirm !== 'DELETE EVERYTHING'}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Everything
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}