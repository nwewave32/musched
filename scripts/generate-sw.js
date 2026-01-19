import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load .env file
config({ path: join(rootDir, '.env') });

const template = readFileSync(
  join(rootDir, 'public', 'firebase-messaging-sw.template.js'),
  'utf-8'
);

const output = template
  .replace('__FIREBASE_API_KEY__', process.env.VITE_FIREBASE_API_KEY || '')
  .replace('__FIREBASE_AUTH_DOMAIN__', process.env.VITE_FIREBASE_AUTH_DOMAIN || '')
  .replace('__FIREBASE_PROJECT_ID__', process.env.VITE_FIREBASE_PROJECT_ID || '')
  .replace('__FIREBASE_STORAGE_BUCKET__', process.env.VITE_FIREBASE_STORAGE_BUCKET || '')
  .replace('__FIREBASE_MESSAGING_SENDER_ID__', process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '')
  .replace('__FIREBASE_APP_ID__', process.env.VITE_FIREBASE_APP_ID || '');

writeFileSync(
  join(rootDir, 'public', 'firebase-messaging-sw.js'),
  output
);

console.log('✅ firebase-messaging-sw.js generated successfully');
