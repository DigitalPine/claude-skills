// app/.well-known/vercel/flags/route.ts
import { getProviderData, createFlagsDiscoveryEndpoint } from 'flags/next';
import * as flags from '@/flags'; // Update path to your flags file

export const GET = createFlagsDiscoveryEndpoint(async () => {
  return getProviderData(flags);
});
