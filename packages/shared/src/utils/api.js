import ky from 'ky';

const resolvedPrefixUrl = process.env.REACT_APP_API_URL || '/';
console.log('[API] prefixUrl resolved to:', JSON.stringify(resolvedPrefixUrl));

/** API instance with environment prefix. Falls back to origin-relative '/' for same-origin production deploys. */
const api = ky.create({
  prefixUrl: resolvedPrefixUrl,
});

export default api;