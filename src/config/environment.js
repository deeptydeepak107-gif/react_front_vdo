// Environment configuration that works everywhere
const config = {
  development: {
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
    debug: true,
    logLevel: 'debug'
  },
  production: {
    apiUrl: process.env.REACT_APP_API_URL || 'https://your-api-domain.com',
    debug: false,
    logLevel: 'error'
  },
  test: {
    apiUrl: 'http://localhost:3001',
    debug: true,
    logLevel: 'debug'
  }
};

export const getConfig = () => {
  const env = process.env.REACT_APP_ENV || 
              (process.env.NODE_ENV === 'production' ? 'production' : 'development');
  
  return config[env] || config.development;
};

export const API_BASE_URL = getConfig().apiUrl;
export const IS_DEVELOPMENT = getConfig().debug;