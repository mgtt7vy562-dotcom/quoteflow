import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, AlertTriangle } from 'lucide-react';

export default function LegalDisclaimer({ onAccept }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            Legal Disclaimer & Data Privacy Notice
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-amber-900 mb-2">
              ⚠️ IMPORTANT: READ BEFORE USING THIS APPLICATION
            </p>
            <p className="text-xs text-amber-800">
              This CRM stores sensitive customer data. You are legally responsible for its protection and proper use.
            </p>
          </div>

          <div className="space-y-3 text-sm text-slate-700 max-h-96 overflow-y-auto">
            <div>
              <h3 className="font-bold text-slate-900 mb-2">📋 Data Privacy Responsibilities</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>You must obtain customer consent before collecting personal information</li>
                <li>You are responsible for protecting customer data from unauthorized access</li>
                <li>You must notify customers of data breaches per applicable laws</li>
                <li>Customer data must not be shared without explicit consent</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-2">🌍 GDPR & CCPA Compliance</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>EU customers have rights under GDPR (General Data Protection Regulation)</li>
                <li>California customers have rights under CCPA (California Consumer Privacy Act)</li>
                <li>You must honor customer requests to access, delete, or export their data</li>
                <li>You must maintain records of data processing activities</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-2">📧 Review Request Legal Requirements</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Review requests must comply with CAN-SPAM Act</li>
                <li>You cannot send marketing emails without consent</li>
                <li>All emails must include opt-out mechanism</li>
                <li>False or misleading information in emails is prohibited</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-2">💳 Payment Data Security</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Never store full credit card numbers</li>
                <li>Use PCI-DSS compliant payment processors</li>
                <li>Encrypt all payment-related data</li>
                <li>Maintain audit logs of payment activities</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-2">🔒 Security Best Practices</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Use a strong master password and never share it</li>
                <li>Lock your device when not in use</li>
                <li>Do not access customer data on public WiFi</li>
                <li>Regularly backup encrypted data</li>
                <li>Delete exported files when no longer needed</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-red-900 font-semibold">
                ⚠️ DISCLAIMER: This application provides security features but YOU are ultimately responsible for:
              </p>
              <ul className="list-disc list-inside text-xs text-red-800 mt-2 ml-2">
                <li>Legal compliance with all applicable laws</li>
                <li>Protecting customer privacy and data</li>
                <li>Proper use of customer information</li>
                <li>Consequences of data breaches or misuse</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg">
            <Checkbox
              id="legal-agree"
              checked={agreed}
              onCheckedChange={setAgreed}
              className="mt-1"
            />
            <label htmlFor="legal-agree" className="text-sm text-slate-700 cursor-pointer">
              <span className="font-semibold">I have read and understand the above responsibilities.</span>
              <br />
              I agree to comply with all applicable privacy laws and regulations, and I acknowledge that I am solely responsible for the proper handling of customer data.
            </label>
          </div>

          <Button
            onClick={onAccept}
            disabled={!agreed}
            className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg font-semibold"
          >
            <Shield className="w-5 h-5 mr-2" />
            I Accept - Continue to Setup
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}