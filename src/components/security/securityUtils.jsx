import CryptoJS from 'crypto-js';

// Encryption utilities
export const securityUtils = {
  // Encrypt data using AES-256
  encrypt(data, password) {
    try {
      const jsonString = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(jsonString, password).toString();
      return encrypted;
    } catch (err) {
      console.error('Encryption error:', err);
      return null;
    }
  },

  // Decrypt data
  decrypt(encryptedData, password) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, password);
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(jsonString);
    } catch (err) {
      console.error('Decryption error:', err);
      return null;
    }
  },

  // Hash password for storage
  hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
  },

  // Verify password against stored hash
  verifyPassword(password, hash) {
    const inputHash = this.hashPassword(password);
    return inputHash === hash;
  },

  // Check password strength
  getPasswordStrength(password) {
    if (!password) return { strength: 'none', score: 0 };
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Complexity checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    if (score <= 2) return { strength: 'weak', score, color: 'red' };
    if (score <= 4) return { strength: 'medium', score, color: 'yellow' };
    return { strength: 'strong', score, color: 'green' };
  },

  // PII Masking functions
  maskPhone(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 4) {
      const last4 = cleaned.slice(-4);
      return `***-***-${last4}`;
    }
    return '***-***-****';
  },

  maskEmail(email) {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const maskedLocal = local.length > 0 ? local[0] + '***' : '***';
    return `${maskedLocal}@${domain}`;
  },

  maskName(name) {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0][0] + '***';
    }
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1][0];
    return `${firstName} ${lastInitial}***`;
  },

  maskAddress(address) {
    if (!address) return '';
    // Show only city and state
    const parts = address.split(',');
    if (parts.length >= 2) {
      return `${parts[parts.length - 2].trim()}, ${parts[parts.length - 1].trim()}`;
    }
    return '***';
  },

  // Encrypted localStorage
  setSecureItem(key, value, password) {
    try {
      const encrypted = this.encrypt(value, password);
      localStorage.setItem(key, encrypted);
      return true;
    } catch (err) {
      console.error('Error saving secure item:', err);
      return false;
    }
  },

  getSecureItem(key, password) {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return this.decrypt(encrypted, password);
    } catch (err) {
      console.error('Error loading secure item:', err);
      return null;
    }
  },

  // Auto-backup functionality
  createBackup(password) {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        data: {
          // Collect all important data from localStorage
          passwordHash: localStorage.getItem('passwordHash'),
          hasPassword: localStorage.getItem('hasPassword'),
          legalAccepted: localStorage.getItem('legalAccepted'),
          // Add any other non-encrypted data that needs backup
        }
      };

      const encrypted = this.encrypt(backupData, password);
      
      // Get existing backups
      const backupsStr = localStorage.getItem('secureBackups');
      let backups = backupsStr ? JSON.parse(backupsStr) : [];
      
      // Add new backup
      backups.unshift({
        timestamp: backupData.timestamp,
        data: encrypted
      });
      
      // Keep only last 5 backups
      backups = backups.slice(0, 5);
      
      localStorage.setItem('secureBackups', JSON.stringify(backups));
      return true;
    } catch (err) {
      console.error('Backup error:', err);
      return false;
    }
  },

  getBackups() {
    try {
      const backupsStr = localStorage.getItem('secureBackups');
      return backupsStr ? JSON.parse(backupsStr) : [];
    } catch (err) {
      return [];
    }
  }
};