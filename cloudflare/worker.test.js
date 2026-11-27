// @vitest-environment node
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import worker from './worker.js';

vi.mock('jose', () => ({
  createRemoteJWKSet: () => null,
  jwtVerify: async (token, keys, options) => {
    if (options.audience !== 'test-audience' || !['alice', 'bob'].includes(token)) {
      throw new Error('Invalid token');
    }
    return { payload: { sub: token, email: `${token}@example.com` } };
  }
}));

const origin = 'https://stairs.clearteck.org';
const inputs = {
  totalRise: 108, totalRun: 0, targetStepRise: 7.5, targetStepRun: 10, stringerWidth: 11.25
};

describe('Cloudflare saved calculations', () => {
  let sqlite;
  let env;

  beforeEach(() => {
    sqlite = new DatabaseSync(':memory:');
    sqlite.exec(readFileSync(new URL('./migrations/0001_saved_calculations.sql', import.meta.url), 'utf8'));
    env = {
      ACCESS_AUD: 'test-audience',
      DB: {
        prepare: (sql) => ({
          bind: (...args) => ({
            run: () => sqlite.prepare(sql).run(...args),
            all: () => ({ results: sqlite.prepare(sql).all(...args) })
          })
        }),
        batch: (statements) => {
          sqlite.exec('BEGIN');
          try {
            for (const statement of statements) statement.run();
            sqlite.exec('COMMIT');
          } catch (error) {
            sqlite.exec('ROLLBACK');
            throw error;
          }
        }
      }
    };
  });

  afterEach(() => sqlite.close());

  const request = (user, body, host = origin, caller = origin) => new Request(`${host}/api/calculations`, {
    method: body ? 'POST' : 'GET',
    headers: {
      ...(user && { 'Cf-Access-Jwt-Assertion': user }),
      ...(body && { 'Content-Type': 'application/json', Origin: caller })
    },
    body: body && JSON.stringify(body)
  });

  it('requires authentication and rejects alternate hostnames', async () => {
    expect((await worker.fetch(request(), env)).status).toBe(401);
    expect((await worker.fetch(request('alice', null, 'https://example.pages.dev'), env)).status).toBe(403);
  });

  it('saves and restores calculations only for the matching user', async () => {
    const saved = await worker.fetch(request('alice', { name: 'Workshop stairs', inputs }), env);
    expect(saved.status).toBe(201);
    const alice = await (await worker.fetch(request('alice'), env)).json();
    expect(alice.calculations).toMatchObject([{ name: 'Workshop stairs', ...inputs }]);
    const bob = await (await worker.fetch(request('bob'), env)).json();
    expect(bob.calculations).toEqual([]);
  });

  it('rejects invalid geometry and requests from other origins', async () => {
    expect((await worker.fetch(request('alice', { name: 'Too short', inputs: { ...inputs, totalRun: 50 } }), env)).status).toBe(400);
    expect((await worker.fetch(request('alice', { name: 'Valid', inputs }, origin, 'https://example.com'), env)).status).toBe(403);
  });
});
