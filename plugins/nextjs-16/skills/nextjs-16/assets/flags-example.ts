// flags.ts (or lib/flags.ts)
import { flag } from 'flags/next';

// Simple boolean flag
export const showBanner = flag({
  key: 'show-banner',
  decide: () => false,
  description: 'Show promotional banner on homepage',
});

// Environment-based flag
export const debugMode = flag({
  key: 'debug-mode',
  decide: () => process.env.NODE_ENV === 'development',
  description: 'Enable debug features',
});

// Async flag using Next.js APIs
export const betaFeatures = flag({
  key: 'beta-features',
  async decide() {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get('beta_user')?.value === 'true';
  },
  defaultValue: false,
  description: 'Enable beta features for opted-in users',
});
