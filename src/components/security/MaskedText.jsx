import React from 'react';
import { useSecurity } from './SecurityProvider';

export default function MaskedText({ type, value, className = '' }) {
  const { showMasked, securityUtils } = useSecurity();

  if (!value) return <span className={className}>-</span>;

  if (!showMasked) {
    return <span className={className}>{value}</span>;
  }

  let maskedValue = value;
  switch (type) {
    case 'phone':
      maskedValue = securityUtils.maskPhone(value);
      break;
    case 'email':
      maskedValue = securityUtils.maskEmail(value);
      break;
    case 'name':
      maskedValue = securityUtils.maskName(value);
      break;
    case 'address':
      maskedValue = securityUtils.maskAddress(value);
      break;
    default:
      maskedValue = value;
  }

  return (
    <span className={className} title={showMasked ? 'Click "Show Full Details" to reveal' : ''}>
      {maskedValue}
    </span>
  );
}