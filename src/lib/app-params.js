/**
 * Minimal replacement for the Base44 app-params module.
 * In local-only mode, there are no external app params to resolve.
 */
export const appParams = {
  appId: 'local',
  token: null,
  appBaseUrl: null,
};
