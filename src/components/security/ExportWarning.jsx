import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Download, Shield } from 'lucide-react';

export default function ExportWarning({ onConfirm, onCancel }) {
  const [understood, setUnderstood] = useState(false);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
          <CardTitle className="flex items-center gap-3 text-xl">
            <AlertTriangle className="w-7 h-7 text-orange-600" />
            Security Warning: Exporting Sensitive Data
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <p className="text-red-900 font-bold mb-3 text-lg">
              ⚠️ This file contains SENSITIVE CUSTOMER DATA
            </p>
            <p className="text-sm text-red-800 mb-3">
              Including: names, addresses, phone numbers, emails, payment information, and service details.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              You are responsible for:
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span><strong>Storing this file securely</strong> - Use encrypted storage or password-protected folders</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span><strong>Deleting when no longer needed</strong> - Don't keep customer data indefinitely</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span><strong>NOT sharing without customer consent</strong> - Violates privacy laws</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span><strong>Complying with privacy laws</strong> - GDPR, CCPA, and other regulations apply</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
            <p className="text-xs text-amber-900">
              <strong>Legal Notice:</strong> Unauthorized disclosure of customer data may result in fines, legal action, and loss of customer trust. You are solely responsible for the security of exported data.
            </p>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
            <Checkbox
              id="export-understand"
              checked={understood}
              onCheckedChange={setUnderstood}
              className="mt-0.5"
            />
            <label htmlFor="export-understand" className="text-sm text-slate-700 cursor-pointer">
              I understand my responsibilities and will handle this sensitive customer data securely and legally.
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={!understood}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              <Download className="w-4 h-4 mr-2" />
              I Accept - Download Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}