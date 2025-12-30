/**
 * 타임존 변환 테스트 스크립트
 *
 * 실행 방법: node test-timezone.js
 */

import { fromZonedTime, toZonedTime, formatInTimeZone } from 'date-fns-tz';

console.log('='.repeat(60));
console.log('타임존 변환 테스트');
console.log('='.repeat(60));
console.log();

// 테스트 시나리오 1: 필리핀 사용자가 21:00에 이벤트 생성
console.log('📌 시나리오 1: 필리핀 사용자가 2025-12-30 21:00에 이벤트 생성');
console.log('-'.repeat(60));

const dateString = '2025-12-30';
const timeString = '21:00';
const philippinesTimezone = 'Asia/Manila';
const koreaTimezone = 'Asia/Seoul';

// 1. 이벤트 생성 (필리핀 타임존)
const dateTimeString = `${dateString}T${timeString}:00`;
const localDate = new Date(dateTimeString);
console.log(`1️⃣  입력값: ${dateString} ${timeString} (${philippinesTimezone})`);
console.log(`   로컬 Date 객체: ${localDate.toISOString()}`);

// 2. 필리핀 타임존의 시간으로 해석하고 UTC로 변환
const utcDate = fromZonedTime(localDate, philippinesTimezone);
console.log(`2️⃣  UTC 변환: ${utcDate.toISOString()}`);
console.log(`   → Firebase 저장값`);
console.log();

// 3. 필리핀 사용자가 조회
const philippinesView = toZonedTime(utcDate, philippinesTimezone);
const philippinesTimeDisplay = philippinesView.toLocaleTimeString('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
console.log(`3️⃣  필리핀 사용자 조회 (${philippinesTimezone}):`);
console.log(`   표시 시간: ${philippinesTimeDisplay}`);
console.log(`   Date 객체: ${philippinesView.toISOString()}`);
console.log(`   ✅ 예상: 21:00`);
console.log();

// 4. 한국 사용자가 조회
const koreaView = toZonedTime(utcDate, koreaTimezone);
const koreaTimeDisplay = koreaView.toLocaleTimeString('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
console.log(`4️⃣  한국 사용자 조회 (${koreaTimezone}):`);
console.log(`   표시 시간: ${koreaTimeDisplay}`);
console.log(`   Date 객체: ${koreaView.toISOString()}`);
console.log(`   ✅ 예상: 22:00`);
console.log();

console.log('='.repeat(60));
console.log('📌 시나리오 2: 한국 사용자가 2025-12-30 22:00에 이벤트 생성');
console.log('-'.repeat(60));

const koreaTimeString = '22:00';
const koreaDateTimeString = `${dateString}T${koreaTimeString}:00`;
const koreaLocalDate = new Date(koreaDateTimeString);
console.log(`1️⃣  입력값: ${dateString} ${koreaTimeString} (${koreaTimezone})`);
console.log(`   로컬 Date 객체: ${koreaLocalDate.toISOString()}`);

// 한국 타임존의 시간으로 해석하고 UTC로 변환
const koreaUtcDate = fromZonedTime(koreaLocalDate, koreaTimezone);
console.log(`2️⃣  UTC 변환: ${koreaUtcDate.toISOString()}`);
console.log(`   → Firebase 저장값`);
console.log();

// 필리핀 사용자가 조회
const philippinesView2 = toZonedTime(koreaUtcDate, philippinesTimezone);
const philippinesTimeDisplay2 = philippinesView2.toLocaleTimeString('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
console.log(`3️⃣  필리핀 사용자 조회 (${philippinesTimezone}):`);
console.log(`   표시 시간: ${philippinesTimeDisplay2}`);
console.log(`   ✅ 예상: 21:00`);
console.log();

// 한국 사용자가 조회
const koreaView2 = toZonedTime(koreaUtcDate, koreaTimezone);
const koreaTimeDisplay2 = koreaView2.toLocaleTimeString('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
console.log(`4️⃣  한국 사용자 조회 (${koreaTimezone}):`);
console.log(`   표시 시간: ${koreaTimeDisplay2}`);
console.log(`   ✅ 예상: 22:00`);
console.log();

console.log('='.repeat(60));
console.log('✅ 테스트 결과 확인:');
console.log(`   - 두 시나리오의 UTC 시간이 동일한가? ${utcDate.toISOString() === koreaUtcDate.toISOString() ? '✅ YES' : '❌ NO'}`);
console.log(`   - 필리핀 표시 시간이 일치하는가? ${philippinesTimeDisplay === philippinesTimeDisplay2 ? '✅ YES' : '❌ NO'}`);
console.log(`   - 한국 표시 시간이 일치하는가? ${koreaTimeDisplay === koreaTimeDisplay2 ? '✅ YES' : '❌ NO'}`);
console.log('='.repeat(60));
