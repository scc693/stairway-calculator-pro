import { createRemoteJWKSet, jwtVerify } from 'jose';
import { calculateStairPlan } from '../src/utils/stairMath.js';

const issuer = 'https://clearteck.cloudflareaccess.com';
const keys = createRemoteJWKSet(new URL('/cdn-cgi/access/certs', issuer));
const origin = 'https://stairs.clearteck.org';
const fields = 'id, name, totalRise, totalRun, targetStepRise, targetStepRun, stringerWidth, createdAt';

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' }
  });
}

async function authenticate(request, audience) {
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token || !audience) return null;
  try {
    const { payload } = await jwtVerify(token, keys, {
      issuer, audience, algorithms: ['RS256'], requiredClaims: ['exp', 'sub']
    });
    if (typeof payload.email === 'string' && payload.email) return payload;
  } catch (error) {
    console.warn('Access token validation failed', error.code);
  }
  return null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (url.origin !== origin) return json({ error: 'Saved calculations use stairs.clearteck.org.' }, 403);

    const user = await authenticate(request, env.ACCESS_AUD);
    if (!user) return json({ error: 'Sign in to access saved calculations.' }, 401);

    if (request.method === 'GET' && url.pathname === '/api/sign-in') {
      return new Response(null, { status: 303, headers: { Location: '/', 'Cache-Control': 'no-store' } });
    }
    if (request.method === 'GET' && url.pathname === '/api/session') {
      return json({ email: user.email });
    }
    if (url.pathname !== '/api/calculations') return json({ error: 'Page not found.' }, 404);

    try {
      if (request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT ' + fields + ' FROM saved_calculations WHERE owner = ? ORDER BY createdAt DESC, id DESC'
        ).bind(user.sub).all();
        return json({ calculations: results });
      }

      if (request.method === 'POST') {
        if (request.headers.get('Origin') !== origin || !/^application\/json(?:;|$)/i.test(request.headers.get('Content-Type') ?? '')) {
          return json({ error: 'Send JSON from stairs.clearteck.org.' }, 403);
        }

        let name, inputs;
        try {
          const body = await request.json();
          name = body.name?.trim();
          inputs = body.inputs;
          if (!name || name.length > 100) throw new Error('Enter a name of 1 to 100 characters.');
          calculateStairPlan(inputs ?? {});
        } catch (error) {
          return json({ error: error instanceof SyntaxError ? 'Invalid JSON.' : error.message }, 400);
        }

        const id = crypto.randomUUID();
        await env.DB.batch([
          env.DB.prepare('INSERT INTO users (subject, email) VALUES (?, ?) ON CONFLICT(subject) DO UPDATE SET email = excluded.email')
            .bind(user.sub, user.email),
          env.DB.prepare('INSERT INTO saved_calculations (id, owner, name, totalRise, totalRun, targetStepRise, targetStepRun, stringerWidth) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
            .bind(id, user.sub, name, inputs.totalRise, inputs.totalRun, inputs.targetStepRise, inputs.targetStepRun, inputs.stringerWidth)
        ]);
        return json({ id }, 201);
      }
      return json({ error: 'Method not allowed.' }, 405);
    } catch (error) {
      console.error('Saved calculations database request failed', error.message);
      return json({ error: 'Saved calculations are temporarily unavailable.' }, 503);
    }
  }
};
