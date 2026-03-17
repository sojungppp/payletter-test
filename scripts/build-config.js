/**
 * scripts/build-config.js
 * Netlify 빌드 시 환경변수로부터 js/config.js를 자동 생성합니다.
 * 로컬 개발 시에는 js/config.js를 직접 작성하세요 (js/config.example.js 참고).
 */

const fs   = require('fs');
const path = require('path');

const required = ['SUPABASE_URL', 'SUPABASE_KEY', 'ADMIN_PASSWORD'];
const missing  = required.filter(k => !process.env[k]);

if (missing.length > 0) {
  console.error(`[build-config] 필수 환경변수가 없습니다: ${missing.join(', ')}`);
  console.error('Netlify 대시보드 > Site settings > Environment variables 에서 설정해 주세요.');
  process.exit(1);
}

const content = `// 이 파일은 빌드 시 자동 생성됩니다. 직접 수정하지 마세요.
const SUPABASE_URL    = '${process.env.SUPABASE_URL}';
const SUPABASE_KEY    = '${process.env.SUPABASE_KEY}';
const ADMIN_PASSWORD  = '${process.env.ADMIN_PASSWORD}';
`;

const outPath = path.join(__dirname, '..', 'js', 'config.js');
fs.writeFileSync(outPath, content, 'utf8');

console.log('[build-config] js/config.js 생성 완료');
