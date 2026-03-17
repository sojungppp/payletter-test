/**
 * config.example.js
 * 로컬 개발용 설정 템플릿입니다.
 * 이 파일을 js/config.js 로 복사한 뒤 실제 값을 채워 넣으세요.
 *
 *   cp js/config.example.js js/config.js
 *
 * ⚠️  js/config.js 는 .gitignore에 포함되어 있습니다. 절대 커밋하지 마세요.
 * 프로덕션 값은 Netlify 대시보드 > Site settings > Environment variables 에서 관리합니다.
 */

// SUPABASE_URL / SUPABASE_KEY는 Netlify Functions(서버사이드)에서만 사용합니다.
// 로컬에서 Netlify Functions를 테스트하려면 .env 파일에 설정하세요.
const ADMIN_PASSWORD = '<your-admin-password>';
