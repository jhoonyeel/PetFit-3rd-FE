export const IS_DEV = import.meta.env.MODE === 'development';

const MODE = import.meta.env.MODE;

export const ENV = {
  MODE,

  IS_DEV: MODE === 'development',
  IS_PROD: MODE === 'production',
  IS_DEMO: MODE === 'demo',
} as const;
