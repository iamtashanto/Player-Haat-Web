'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PhSegmented } from '@/design-system';
import Opportunities from './opportunities';
import Applications from './applications';

/** The player's Games tab: open requests to join, and the applications they've sent. */
export default function PlayerGames() {
  const t = useTranslations();
  const [tab, setTab] = useState<'open' | 'mine'>('open');
  return (
    <>
      <div className="px-5 pt-2">
        <PhSegmented
          options={{ open: t('tabGames'), mine: t('navApplications') }}
          value={tab}
          onChanged={setTab}
        />
      </div>
      {tab === 'open' ? <Opportunities /> : <Applications />}
    </>
  );
}
