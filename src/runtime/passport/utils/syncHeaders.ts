/**
 * Sincroniza os tokens conhecidos com o objeto Headers da lib
 */
import type {PassportModuleOptions, PassportStrategiesOptions} from '#auth-types';

export const syncHeaders = (
    headers: Headers,
    token?: string | null,
    token2fa?: string | null,
    config?: PassportModuleOptions,
    strategyConfig?: PassportStrategiesOptions,
) => {

    // 1. Define o nome do header de 2FA vindo do config ou fallback para '2fa'
    const headerNameT2fa = strategyConfig?.endpoints?.twoFactor?.headerName || '2fa';

    // 2. Sincroniza o Token de Autorização
    if (token) {
        const authValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        headers.set('Authorization', authValue);
    }

    // 3. Sincroniza o Token de 2FA se estiver ativo
    if (config?.twoFactorAuth && token2fa) {
        // AQUI: Usando a variável dinâmica headerNameT2fa em vez de '2fa' fixa
        headers.set(headerNameT2fa, token2fa);
    }

    return headers;
};