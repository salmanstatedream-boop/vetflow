import { describe, expect, it } from 'vitest';
import { AuthError, assertCanViewPrescriptionPdf, type ServerAuthContext } from '@/lib/auth/context';
import type { UserSessionDetails } from '@/lib/services/auth';

function mockCtx(role: NonNullable<UserSessionDetails['role']>): ServerAuthContext {
  return {
    userId: '00000000-0000-0000-0000-000000000001',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    hasAvatar: false,
    isSuperAdmin: false,
    role,
    organizationId: '00000000-0000-0000-0000-000000000002',
    organizationName: 'Test Clinic',
    branches: [],
    allowedBranchIds: [],
    activeBranchId: null,
    capabilities: [],
    features: [],
    subscriptionStatus: 'active',
    currency: 'USD',
    clinicLogoUrl: null,
    isImpersonating: false,
  };
}

describe('assertCanViewPrescriptionPdf', () => {
  it('allows doctors with manage_prescriptions', () => {
    expect(() => assertCanViewPrescriptionPdf(mockCtx('doctor'))).not.toThrow();
  });

  it('allows clinic admins', () => {
    expect(() => assertCanViewPrescriptionPdf(mockCtx('clinic_admin'))).not.toThrow();
  });

  it('allows receptionists via billing_checkout', () => {
    expect(() => assertCanViewPrescriptionPdf(mockCtx('receptionist'))).not.toThrow();
  });

  it('denies roles without prescription or billing access', () => {
    expect(() => assertCanViewPrescriptionPdf(mockCtx('super_admin'))).toThrow(AuthError);
  });
});
