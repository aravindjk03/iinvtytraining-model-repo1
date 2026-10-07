/**
 * Centralized environment variable configuration.
 * Avoids direct access to import.meta.env across components.
 */

interface EnvConfig {
  modelApiUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

export const env: EnvConfig = {
  modelApiUrl: (import.meta.env.VITE_MODEL_API_URL as string) || 'http://localhost:8000',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};
