/**
 * netlify/functions/save-result.js
 * 테스트 결과를 Supabase에 저장합니다.
 * POST { result_code, nickname }
 */
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let result_code, nickname;
  try {
    ({ result_code, nickname } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!result_code) {
    return { statusCode: 400, body: JSON.stringify({ error: 'result_code is required' }) };
  }

  try {
    const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/results`, {
      method: 'POST',
      headers: {
        'apikey':        process.env.SUPABASE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify({ result_code, nickname }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Supabase ${res.status}: ${text}`);
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('[save-result]', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
