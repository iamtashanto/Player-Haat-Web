import { ImageResponse } from 'next/og';
import { fetchPublicSportsProfile } from '@/lib/public-data';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function ProfileOpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string; profileSlug: string }>;
}) {
  const { locale, profileSlug } = await params;
  const profile = await fetchPublicSportsProfile(profileSlug);
  const active = profile.activeSport;

  const sportLabel = active.sportNameEn.toUpperCase();
  const areaText = `${profile.location.upazila.nameEn}, ${profile.location.district.nameEn}`;
  const positionsText = active.positions.map((p) => p.code).join(' · ');
  const ratingText =
    profile.rating.count > 0
      ? `★ ${profile.rating.average.toFixed(1)} (${profile.rating.count} ratings)`
      : 'Verified Player';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background:
            'linear-gradient(135deg, #0B0F0C 0%, #0D2618 55%, #0A8443 100%)',
          color: '#F4F6F3',
          padding: '56px 64px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Brand Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: '#34D17A',
                color: '#062012',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 800,
              }}
            >
              H
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '28px', fontWeight: 700 }}>
                PlayerHaat
              </span>
              <span
                style={{
                  fontSize: '14px',
                  color: '#34D17A',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}
              >
                Bangladesh Sports Platform
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(52, 209, 122, 0.18)',
              border: '1px solid rgba(52, 209, 122, 0.45)',
              borderRadius: '999px',
              padding: '10px 24px',
              fontSize: '20px',
              fontWeight: 700,
              color: '#34D17A',
            }}
          >
            {sportLabel} · {positionsText}
          </div>
        </div>

        {/* Center Player Identity */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '36px',
            marginTop: '12px',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              width: '148px',
              height: '148px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #0BA360 0%, #3CBA92 100%)',
              border: '4px solid #34D17A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '58px',
              fontWeight: 800,
              color: '#FFFFFF',
            }}
          >
            {profile.name.slice(0, 2).toUpperCase()}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '56px', fontWeight: 800 }}>
                {profile.name}
              </span>
              {profile.verifiedBadge && (
                <span
                  style={{
                    background: '#34D17A',
                    color: '#062012',
                    borderRadius: '999px',
                    padding: '6px 16px',
                    fontSize: '18px',
                    fontWeight: 700,
                  }}
                >
                  VERIFIED
                </span>
              )}
            </div>

            <div style={{ fontSize: '26px', color: '#D0D8D2' }}>
              {areaText} · {ratingText}
            </div>

            {active.headline && (
              <div style={{ fontSize: '22px', color: '#9BA59E' }}>
                {active.headline}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Stats & Khep Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255,255,255,0.16)',
            paddingTop: '24px',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', gap: '28px' }}>
            {active.statsLabels.slice(0, 3).map((s) => (
              <div
                key={s.key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '12px 24px',
                }}
              >
                <span style={{ fontSize: '16px', color: '#9BA59E' }}>
                  {s.nameEn}
                </span>
                <span style={{ fontSize: '28px', fontWeight: 800 }}>
                  {active.stats[s.key] ?? 0}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <span style={{ fontSize: '16px', color: '#9BA59E' }}>
              {active.khepAvailable ? 'Available for Khep' : 'Local Matches'}
            </span>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#F5B82E',
              }}
            >
              playerhaat.com/{locale}/p/{profile.slug}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

