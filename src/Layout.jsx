import React from 'react';
import { SecurityProvider } from '@/components/security/SecurityProvider';
import LegalDisclaimer from '@/components/security/LegalDisclaimer';
import PasswordSetup from '@/components/security/PasswordSetup';
import LockScreen from '@/components/security/LockScreen';
import { useSecurity } from '@/components/security/SecurityProvider';

function LayoutContent({ children }) {
  const {
    isLocked,
    showPasswordSetup,
    showLegalDisclaimer,
    setupPassword,
    unlock,
    acceptLegal,
    resetPassword
  } = useSecurity();

  // Show legal disclaimer first
  if (showLegalDisclaimer) {
    return <LegalDisclaimer onAccept={acceptLegal} />;
  }

  // Show password setup after legal
  if (showPasswordSetup) {
    return <PasswordSetup onSetup={setupPassword} />;
  }

  // Show lock screen if locked
  if (isLocked) {
    return <LockScreen onUnlock={unlock} onReset={resetPassword} />;
  }

  // Show app content when unlocked
  return <>{children}</>;
}

export default function Layout({ children }) {
  return (
    <SecurityProvider>
      <LayoutContent>{children}</LayoutContent>
    </SecurityProvider>
  );
}