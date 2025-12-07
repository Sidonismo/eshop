import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Vytvoř next-intl plugin s odkazem na i18n konfiguraci
const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');

const nextConfig: NextConfig = {
  // Disable Turbopack for compatibility
  experimental: {},
};

export default withNextIntl(nextConfig);
