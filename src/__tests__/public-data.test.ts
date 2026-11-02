import { afterEach, describe, expect, it, vi } from 'vitest';
import { areaPath, buildSeoMetadata, fetchPublicPlayer, listActiveAreas, resolveArea, slugify } from '../lib/public-data';
import sitemap from '../app/sitemap';
import robots from '../app/robots';

const ok = (data: unknown) => new Response(JSON.stringify({ data, meta: {} }), { status: 200 });

afterEach(() => vi.unstubAllGlobals());

describe('public data', () => {
  it('builds canonical and en/bn hreflang alternates', () => {
    const m = buildSeoMetadata({ locale: 'en', path: '/p/abc', title: 'T', description: 'D' });
    expect(m.alternates?.canonical).toMatch(/\/en\/p\/abc$/);
    expect(m.alternates?.languages).toMatchObject({ en: expect.stringMatching(/\/en\/p\/abc$/), bn: expect.stringMatching(/\/bn\/p\/abc$/) });
  });

  it('slugifies like the server (apostrophes dropped)', () => {
    expect(slugify("Cox's Bazar")).toBe('coxs-bazar');
    expect(slugify('Barishal Sadar')).toBe('barishal-sadar');
  });

  it('returns null for an unknown player instead of inventing one', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 404 })));
    expect(await fetchPublicPlayer('nope')).toBeNull();
  });

  it('throws on server errors so pages show an error, not a blank', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 500 })));
    await expect(fetchPublicPlayer('x')).rejects.toThrow();
  });

  it('resolves a district/upazila slug pair through the locations search', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ok([{ level: 'upazila', id: 9, nameEn: 'Kalapara', nameBn: 'কলাপাড়া', district: { id: 5, nameEn: 'Patuakhali', nameBn: 'পটুয়াখালী' } }])));
    expect(await resolveArea('patuakhali', 'kalapara')).toMatchObject({ districtId: 5, upazilaId: 9 });
    expect(await resolveArea('dhaka', 'kalapara')).toBeNull();
  });

  it('lists only areas that have real players, and the sitemap only lists real pages', async () => {
    const sports = [{ id: 1, code: 'FOOTBALL', nameEn: 'Football', nameBn: 'ফুটবল', positions: [], statFields: [] }];
    const player = { id: 'p1', name: 'A', location: { district: { id: 5, nameEn: 'Patuakhali', nameBn: '' }, upazila: { id: 9, nameEn: 'Kalapara', nameBn: '' } }, sports: [{ sportId: 1 }] };
    vi.stubGlobal('fetch', vi.fn(async (url: string) => (url.includes('/sports') ? ok(sports) : url.includes('/public/players') ? ok([player]) : ok([]))));
    const areas = await listActiveAreas(sports as never);
    expect(areas.map(areaPath)).toEqual(['/football/patuakhali/kalapara']);
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls.some((u) => u.endsWith('/en/p/p1'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/bn/football/patuakhali/kalapara'))).toBe(true);
    expect(urls.some((u) => /sohel|req-kalapara/.test(u))).toBe(false);
  });

  it('robots disallows the signed-in app', () => {
    const r = robots();
    expect(JSON.stringify(r)).toContain('sitemap');
  });
});
