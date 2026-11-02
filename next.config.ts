import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // The app is one role-aware shell now; the old role-prefixed URLs keep working. Exact paths only:
  // `/player/:id` and `/recruiter/:id` are real screens.
  async redirects() {
    const legacy: Record<string, string> = {
      '/player': '/home',
      '/recruiter': '/home',
      '/player/opportunities': '/games',
      '/player/applications': '/games',
      '/recruiter/requests': '/games',
      '/player/players': '/players',
      '/recruiter/discover': '/players',
      '/player/alerts': '/alerts',
      '/recruiter/alerts': '/alerts',
      '/player/me': '/me',
      '/recruiter/me': '/me',
      '/player/ratings': '/me',
      '/player/settings': '/settings',
      '/recruiter/settings': '/settings',
      '/player/profiles': '/profile/edit',
      '/player/onboarding': '/setup',
      '/recruiter/onboarding': '/setup/recruiter',
      '/recruiter/shortlist': '/shortlist',
      '/auth/forgot-password': '/auth/forgot',
      '/auth/reset-password': '/auth/reset',
    };
    return Object.entries(legacy).map(([source, destination]) => ({
      source: `/:locale(en|bn)${source}`,
      destination: `/:locale${destination}`,
      permanent: true,
    }));
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);

