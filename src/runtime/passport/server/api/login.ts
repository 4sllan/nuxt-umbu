import { defineEventHandler, readBody, createError } from 'h3';
import { defu } from 'defu';
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
  value: Record<string, any>;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AuthRequestBody>(event);
    if (!body?.strategyName || !body?.value) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid request body' });
    }

    const authConfig = getAuthConfig();
    const strategy = validateStrategy(body.strategyName, authConfig.config);

    if (!strategy.endpoints?.login?.url) {
      throw createError({ statusCode: 500, statusMessage: 'Login endpoint not configured' });
    }

    const credentials = defu(body.value, authConfig.secret?.[body.strategyName]);

    const response = await makeAuthRequest(
      strategy.endpoints.login.url,
      authConfig.baseURL,
      {
        method: strategy.endpoints.login.method || 'POST',
        body: credentials,
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
