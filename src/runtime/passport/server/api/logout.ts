import { defineEventHandler, readBody } from 'h3';
import protectedMiddleware from '../middleware/protected';
import {
  getAuthConfig,
  validateStrategy,
  deleteAuthCookies,
  handleLogoutError
} from '../utils';
import type { PassportModuleOptions } from '#auth-types';

export default defineEventHandler(async (event) => {
  try {
    await protectedMiddleware(event);
    const body = await readBody<{ strategyName?: string }>(event);
    const strategyName = body?.strategyName;

    if (!strategyName) {
      throw new Error('Strategy name is required.');
    }

    const authConfig = getAuthConfig();
    const strategy = validateStrategy(strategyName, authConfig.config);

    const config = authConfig.config as PassportModuleOptions & {
      twoFactorAuth: boolean;
    };

    const { redirect } = strategy;
    const includeTwoFactor = config.twoFactorAuth || false;

    deleteAuthCookies(event, strategyName, authConfig, includeTwoFactor);

    return { success: true, redirect };
  } catch (error: any) {
    return handleLogoutError(error);
  }
});
