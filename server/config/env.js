const path = require('path');
const fs = require('fs');

const envPaths = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'server/.env')
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    break;
  }
}
require('dotenv').config(); // Fallback to default

const config = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  AUTH_SECRET: process.env.AUTH_SECRET || 'mospi-samarthya-sankhyiki-secret-2026',
  
  // AI Configuration (OpenAI Backend Service)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',

  // iGOT Karmayogi Official Integration Layer
  IGOT_BASE_URL: process.env.IGOT_BASE_URL || 'https://igotkarmayogi.gov.in/',
  IGOT_API_BASE_URL: process.env.IGOT_API_BASE_URL || 'https://api.igotkarmayogi.gov.in/v1',
  IGOT_CLIENT_ID: process.env.IGOT_CLIENT_ID || '',
  IGOT_CLIENT_SECRET: process.env.IGOT_CLIENT_SECRET || '',
  IGOT_API_KEY: process.env.IGOT_API_KEY || '',
  IGOT_REDIRECT_URI: process.env.IGOT_REDIRECT_URI || 'http://localhost:5173/auth/igot/callback',
  IGOT_ENABLED: Boolean(process.env.IGOT_API_KEY || process.env.IGOT_CLIENT_ID),

  // NSSTA / TPAC Official Integration Layer
  NSSTA_BASE_URL: process.env.NSSTA_BASE_URL || 'https://www.nssta.gov.in/',
  NSSTA_API_BASE_URL: process.env.NSSTA_API_BASE_URL || 'https://api.nssta.gov.in/v1',
  NSSTA_API_KEY: process.env.NSSTA_API_KEY || '',
  NSSTA_ENABLED: Boolean(process.env.NSSTA_API_KEY),
  NSSTA_PORTAL_SAFE: process.env.NSSTA_PORTAL_SAFE === 'true' // Defaults to false due to NET::ERR_CERT_AUTHORITY_INVALID on external portal
};

module.exports = config;
