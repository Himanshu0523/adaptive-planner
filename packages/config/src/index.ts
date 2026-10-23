export interface AppConfig {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  databaseUrl: string;
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  appUrl: string;
  webAppUrl: string;
  ai: {
    provider: 'gemini' | 'openai';
    geminiApiKey?: string;
    geminiModel: string;
    openaiApiKey?: string;
    openaiModel?: string;
  };
  security: {
    oauthEncryptionKey: string;
    sessionSecret: string;
    jwtSecret: string;
  };
}

export function loadAndValidateConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  const nodeEnv = (env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  const port = parseInt(env.PORT || '3000', 10);
  const databaseUrl = env.DATABASE_URL || 'postgresql://app:local_dev_only@127.0.0.1:5432/personal_agent?schema=public';

  const redisHost = env.REDIS_HOST || '127.0.0.1';
  const redisPort = parseInt(env.REDIS_PORT || '6379', 10);

  const appUrl = env.APP_URL || 'http://localhost:3000';
  const webAppUrl = env.WEB_APP_URL || 'http://localhost:3001';

  const aiProvider = (env.AI_PROVIDER || 'gemini') as 'gemini' | 'openai';
  const geminiApiKey = env.GEMINI_API_KEY || '';
  const geminiModel = env.GEMINI_MODEL || 'gemini-2.5-flash';

  const oauthEncryptionKey = env.OAUTH_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const sessionSecret = env.SESSION_SECRET || 'dev-session-secret-change-in-production-min32chars';
  const jwtSecret = env.JWT_SECRET || 'dev-jwt-secret-change-in-production-min32chars';

  return {
    nodeEnv,
    port,
    databaseUrl,
    redis: {
      host: redisHost,
      port: redisPort,
      password: env.REDIS_PASSWORD,
    },
    appUrl,
    webAppUrl,
    ai: {
      provider: aiProvider,
      geminiApiKey,
      geminiModel,
      openaiApiKey: env.OPENAI_API_KEY,
      openaiModel: env.OPENAI_MODEL,
    },
    security: {
      oauthEncryptionKey,
      sessionSecret,
      jwtSecret,
    },
  };
}
