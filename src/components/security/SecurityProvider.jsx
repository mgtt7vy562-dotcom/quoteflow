import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { securityUtils } from '@/utils/security';

const SecurityContext = createContext(null);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within SecurityProvider');
  }
  return context;
};

export const SecurityProvider = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [showLegalDisclaimer, setShowLegalDisclaimer] = useState(false);
  const [currentPassword, setCurrentPassword] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showMasked, setShowMasked] = useState(true);

  // Check if password exists and legal accepted on mount
  useEffect(() => {
    const passwordHash = localStorage.getItem('passwordHash');
    const hasPasswordFlag = localStorage.getItem('hasPassword') === 'true';
    const legalAccepted = localStorage.getItem('legalAccepted') === 'true';

    if (!legalAccepted) {
      setShowLegalDisclaimer(true);
    } else if (!hasPasswordFlag || !passwordHash) {
      setShowPasswordSetup(true);
    } else {
      setHasPassword(true);
      setIsLocked(true); // Start locked if password exists
    }
  }, []);

  // Activity tracking for auto-lock
  const resetActivityTimer = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  useEffect(() => {
    if (!hasPassword || isLocked) return;

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
    
    events.forEach(event => {
      window.addEventListener(event, resetActivityTimer);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetActivityTimer);
      });
    };
  }, [hasPassword, isLocked, resetActivityTimer]);

  // Check for inactivity every 10 seconds
  useEffect(() => {
    if (!hasPassword || isLocked) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      const THIRTY_MINUTES = 30 * 60 * 1000;

      if (inactiveTime >= THIRTY_MINUTES) {
        setIsLocked(true);
        setCurrentPassword(null);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [hasPassword, isLocked, lastActivity]);

  // Auto-backup every 5 minutes
  useEffect(() => {
    if (!hasPassword || !currentPassword) return;

    const interval = setInterval(() => {
      securityUtils.createBackup(currentPassword);
      // Show brief notification
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-up';
      notification.innerHTML = '🔒 Data backed up';
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.remove();
      }, 2000);
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [hasPassword, currentPassword]);

  const setupPassword = (password) => {
    const hash = securityUtils.hashPassword(password);
    localStorage.setItem('passwordHash', hash);
    localStorage.setItem('hasPassword', 'true');
    setHasPassword(true);
    setShowPasswordSetup(false);
    setCurrentPassword(password);
    setIsLocked(false);
  };

  const unlock = (password) => {
    const hash = localStorage.getItem('passwordHash');
    if (securityUtils.verifyPassword(password, hash)) {
      setCurrentPassword(password);
      setIsLocked(false);
      setLastActivity(Date.now());
      return true;
    }
    return false;
  };

  const lock = () => {
    setIsLocked(true);
    setCurrentPassword(null);
  };

  const acceptLegal = () => {
    localStorage.setItem('legalAccepted', 'true');
    localStorage.setItem('legalAcceptedDate', new Date().toISOString());
    setShowLegalDisclaimer(false);
    
    // Check if password setup needed
    const hasPasswordFlag = localStorage.getItem('hasPassword') === 'true';
    if (!hasPasswordFlag) {
      setShowPasswordSetup(true);
    }
  };

  const resetPassword = () => {
    // Nuclear option - clear everything
    localStorage.clear();
    window.location.reload();
  };

  const toggleMasking = () => {
    setShowMasked(!showMasked);
  };

  const value = {
    isLocked,
    hasPassword,
    showPasswordSetup,
    showLegalDisclaimer,
    currentPassword,
    showMasked,
    setupPassword,
    unlock,
    lock,
    acceptLegal,
    resetPassword,
    toggleMasking,
    securityUtils
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};