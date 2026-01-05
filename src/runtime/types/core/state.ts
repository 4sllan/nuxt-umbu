// Authentication state
export type AuthState = {
  user: Record<string, any> | null; // User data (null if not authenticated)
  loggedIn: boolean; // Authentication status (true if logged in)
  strategy: string; // Name of the active strategy (must match a key in StrategiesOptions)
};
