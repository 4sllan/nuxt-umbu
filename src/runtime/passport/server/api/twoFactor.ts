import { defineEventHandler, readBody, getCookie, createError, setHeader } from 'h3';
import protectedMiddleware from '../middleware/protected';
import {
  getAuthConfig,
  validateStrategy,
  makeAuthRequest,
  validateTwoFactorResponse,
  formatTwoFactorResponse,
  setTwoFactorCookies,
  handleAuthError
} from '../utils';

interface RequestBody {
  strategyName: string;
  code: string;
}

export default defineEventHandler(async (event) => {
  try {
    await protectedMiddleware(event);
    const body = await readBody<RequestBody>(event);
    if (!body?.strategyName || !body?.code) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: strategyName or code',
      });
    }

    const authConfig = getAuthConfig();
    const strategy = validateStrategy(body.strategyName, authConfig.config);

    if (!strategy.endpoints?.twoFactor) {
      throw createError({
        statusCode: 400,
        statusMessage: '2FA endpoint not configured for strategy ' + body.strategyName,
      });
    }

    const token = getCookie(event, authConfig.prefix + '_token.' + body.strategyName);
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication token missing',
      });
    }
    const response: Get2FAResponse = await makeAuthRequest<Get2FAResponse>(
      strategy.endpoints.twoFactor.url,
      authConfig.baseURL,
      {
        method: strategy.endpoints.twoFactor.method || 'POST',
        body: { code: body.code },
        headers: {
          Authorization: token,
        },
        onRequest() {
          // no-op: avoid leaking Authorization to response headers
        },
      }
    );

    validateTwoFactorResponse(response, strategy.endpoints?.twoFactor);
    const twoFactorResponse = formatTwoFactorResponse(response, strategy.endpoints?.twoFactor);

    setTwoFactorCookies(
      event,
      body.strategyName,
      twoFactorResponse.token,
      twoFactorResponse.expires,
      authConfig
    );

    return twoFactorResponse;
  } catch (error: any) {
    handleAuthError(error, 'Auth');
  }
});
