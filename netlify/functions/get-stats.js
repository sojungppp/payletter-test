/**
 * netlify/functions/get-stats.js
 * 어드민 대시보드용 결과 데이터를 Supabase에서 조회합니다.
 * GET (인증 없음 — admin.html 자체가 ADMIN_PASSWORD로 접근 제한됨)
 */
exports.handler = async () => {
  try {
    const res = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/results?select=*&order=created_at.desc`,
      {
        headers: {
          'apikey':        process.env.SUPABASE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Supabase ${res.status}: ${text}`);
    }

    const rows = await res.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows),
    };
  } catch (err) {
    console.error('[get-stats]', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
