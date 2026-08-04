export const PRODUCT_NAME = 'Phoenix OS';

export const LOGO_SRC = '/phoenix-logo.png';
/** Tight crop of the mark (transparent padding) for small chrome slots. */
export const LOGO_MARK_SRC = '/phoenix-logo-mark.png';
export const LOGO_ALT = 'Phoenix OS';

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const NOREPLY_FROM =
  process.env.PHOENIX_OS_NOREPLY_FROM ??
  'Phoenix OS <noreply@localhost>';

export const SALES_EMAIL =
  process.env.PHOENIX_OS_SALES_EMAIL ??
  process.env.CLINIXDEV_SALES_EMAIL ??
  'sales@localhost';
