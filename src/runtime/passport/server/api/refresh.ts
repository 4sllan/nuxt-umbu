import { defineEventHandler, readBody, getCookie, createError } from 'h3';
import protectedMiddleware from '../middleware/protected';
import {
  getAuthConfig,
  validateStrategy,
  setAuthCookies,
  makeAuthRequest,
  validateTokenResponse,
  formatTokenResponse,
  handleAuthError
} from '../utils';

interface AuthRequestBody {
  strategyName: string;
}

export default defineEventHandler(async (event) => {
  try {
    await protectedMiddleware(event);
    const body = await readBody<AuthRequestBody>(event);
    if (!body?.strategyName) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid request body' });
    }

    const authConfig = getAuthConfig();
    const strategy = validateStrategy(body.strategyName, authConfig.config);

    if (!strategy.endpoints?.refresh?.url) {
      throw createError({ statusCode: 500, statusMessage: 'Refresh endpoint not configured' });
    }

    const refreshToken = getCookie(event, authConfig.prefix + `_refresh_token.` + body.strategyName);

    if (!refreshToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No refresh token found. Please log in again.',
      });
    }

    const response = await makeAuthRequest(
      strategy.endpoints.refresh.url,
      authConfig.baseURL,
      {
        method: strategy.endpoints.refresh.method || 'POST',
        body: { refresh_token: refreshToken },
      }
    );

    validateTokenResponse(response);
    const tokenResponse = formatTokenResponse(response);

    setAuthCookies(
      event,
      body.strategyName,
      tokenResponse.token,
      tokenResponse.refresh_token,
      tokenResponse.expires,
      authConfig
    );

    return tokenResponse;
  } catch (error: any) {
    handleAuthError(error, 'Auth');
  }
});
