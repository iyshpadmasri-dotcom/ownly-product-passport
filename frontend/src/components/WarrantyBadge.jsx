import React from 'react';
import { ShieldCheck, AlertCircle, Clock, ShieldX } from 'lucide-react';

const WarrantyBadge = ({ warrantyInfo }) => {
  if (!warrantyInfo || warrantyInfo.status === 'NO_DETAILS') {
    return (
      <span className="badge badge-neutral">
        <Clock size={13} />
        <span>No Warranty Details</span>
      </span>
    );
  }

  if (warrantyInfo.status === 'ACTIVE') {
    return (
      <span className="badge badge-success">
        <ShieldCheck size={13} />
        <span>{warrantyInfo.label || 'Warranty Active'}</span>
      </span>
    );
  }

  if (warrantyInfo.status === 'EXPIRING_SOON') {
    return (
      <span className="badge badge-warning">
        <AlertCircle size={13} />
        <span>{warrantyInfo.label || 'Expiring Soon'}</span>
      </span>
    );
  }

  if (warrantyInfo.status === 'EXPIRED') {
    return (
      <span className="badge badge-danger">
        <ShieldX size={13} />
        <span>Expired</span>
      </span>
    );
  }

  return null;
};

export default WarrantyBadge;
