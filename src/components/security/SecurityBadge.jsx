import React from 'react';
import { Shield } from 'lucide-react';

export default function SecurityBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full">
      <Shield className="w-4 h-4 text-emerald-400" />
      <span className="text-sm font-semibold text-emerald-300">SECURED</span>
    </div>
  );
}