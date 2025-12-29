import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ES Module에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase Admin SDK 초기화
// Service Account Key가 필요합니다
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 사용자 UID를 입력받아 커스텀 토큰 생성
const generateToken = async (uid) => {
  try {
    const customToken = await admin.auth().createCustomToken(uid);
    console.log('\n===========================================');
    console.log('Custom Token Generated Successfully!');
    console.log('===========================================');
    console.log(`\nUser ID: ${uid}`);
    console.log(`\nToken:\n${customToken}`);
    console.log('\n===========================================');
    console.log('Copy the token above and paste it in the login page');
    console.log('===========================================\n');
    return customToken;
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
};

// 명령줄에서 UID 받기
const uid = process.argv[2];

if (!uid) {
  console.error('\nUsage: node generateToken.js <USER_UID>\n');
  console.error('Example: node generateToken.js abc123xyz\n');
  process.exit(1);
}

generateToken(uid)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
