// Type definition for cookie options
export type CookieOption = {
  httpOnly?: boolean; // Ensures the cookie is only accessible via HTTP (not available to JavaScript in the browser)
  secure?: boolean; // Requires HTTPS for the cookie to be sent
  sameSite?: 'Lax' | 'Strict' | 'None'; // Controls cross-site cookie sharing
  priority?: 'low' | 'medium' | 'high'; // Defines the cookie's priority in the browser
  maxAge?: number; // Cookie lifespan in seconds
  domain?: string; // The domain for which the cookie is valid
  expires?: Date; // Expiration date of the cookie
};

// Authentication cookie configuration
export type AuthOptionsCookie = {
  options: CookieOption;
  prefix: '__Secure-' | '__Host-' | 'auth.'; // Cookie prefix
  // "__Secure-" and "__Host-" are used in production for enhanced security.
  // "auth." is used only in development mode.
};

// Redirection options after authentication actions
export type RedirectOptions = {
  login?: string; // URL to redirect after login (optional)
  logout: string; // URL to redirect after logout (required)
  twoFactor?: string; // URL to redirect after two-factor authentication (optional)
  callback?: string; // URL for callback after external authentication (optional)
  home?: string; // URL to redirect after successful login (optional)
};
