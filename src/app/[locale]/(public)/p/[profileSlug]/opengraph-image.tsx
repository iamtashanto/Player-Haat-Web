import { ImageResponse } from 'next/og';
import { fetchPublicPlayer } from '@/lib/public-data';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function ProfileOpenGraphImage({ params }: { params: Promise<{ locale: string; profileSlug: string }> }) {
  const { profileSlug } = await params;
  const p = await fetchPublicPlayer(profileSlug);
  const area = p ? `${p.location.upazila.nameEn}, ${p.location.district.nameEn}` : '';
  const rating = p && p.rating.count > 0 ? `★ ${p.rating.average.toFixed(1)} (${p.rating.count})` : '';
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(135deg, #0B0F0C 0%, #0D2618 55%, #0A8443 100%)', color: '#F4F6F3', padding: '56px 64px' }}>
        <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: '#34D17A' }}>PlayerHaat</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 800 }}>{p?.name ?? 'PlayerHaat'}</div>
          <div style={{ display: 'flex', fontSize: 38, marginTop: 12, color: '#C9D4CD' }}>{area}</div>
          {rating && <div style={{ display: 'flex', fontSize: 38, marginTop: 8, color: '#FFC53D' }}>{rating}</div>}
        </div>
      </div>
    ),
    size,
  );
}
