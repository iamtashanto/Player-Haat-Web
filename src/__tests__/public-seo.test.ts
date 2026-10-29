import { describe, expect, it } from 'vitest';
import {
  buildSeoMetadata,
  FEATURED_SEO_LOCATIONS,
  fetchPublicRequestDetail,
  fetchPublicSportsProfile,
} from '../lib/public-data';
import sitemap from '../app/sitemap';
import robots from '../app/robots';

describe('Phase 3: Public SEO, Metadata, Sitemap & Robots', () => {
  it('builds canonical and en/bn hreflang alternates for public routes', () => {
    const meta = buildSeoMetadata({
      locale: 'bn',
      path: '/p/sohel-rana-football',
      title: 'Sohel Rana — Football | PlayerHaat',
      description: 'Left-footed winger in Kalapara, Patuakhali',
      ogImage: 'https://playerhaat.com/bn/p/sohel-rana-football/opengraph-image',
    });

    expect(meta.alternates?.canonical).toBe(
      'https://playerhaat.com/bn/p/sohel-rana-football',
    );
    expect(meta.alternates?.languages).toEqual({
      en: 'https://playerhaat.com/en/p/sohel-rana-football',
      bn: 'https://playerhaat.com/bn/p/sohel-rana-football',
      'x-default': 'https://playerhaat.com/bn/p/sohel-rana-football',
    });
  });

  it('fetches public sports profiles and links to other sports profiles on the same account', async () => {
    const footballProfile = await fetchPublicSportsProfile('sohel-rana-football');
    expect(footballProfile.name).toBe('Sohel Rana');
    expect(footballProfile.activeSport.sportCode).toBe('football');
    expect(footballProfile.otherSports[0]?.profileSlug).toBe('sohel-rana-cricket');

    const cricketProfile = await fetchPublicSportsProfile('sohel-rana-cricket');
    expect(cricketProfile.activeSport.sportCode).toBe('cricket');
    expect(cricketProfile.otherSports[0]?.profileSlug).toBe('sohel-rana-football');
  });

  it('fetches public recruitment requests with venue, positions, and budget', async () => {
    const req = await fetchPublicRequestDetail('req-kalapara-gold-cup');
    expect(req.status).toBe('OPEN');
    expect(req.isPaid).toBe(true);
    expect(req.location.upazila.nameEn).toBe('Kalapara');
  });

  it('generates bilingual sitemap.xml and robots.txt', () => {
    const map = sitemap();
    expect(map.length).toBeGreaterThanOrEqual(
      (10 + FEATURED_SEO_LOCATIONS.length) * 2,
    );
    expect(
      map.some(
        (x) =>
          x.url === 'https://playerhaat.com/bn/football/patuakhali/kalapara',
      ),
    ).toBe(true);

    const rob = robots();
    expect(rob.sitemap).toBe('https://playerhaat.com/sitemap.xml');
  });
});

