'use client';

import React, { useState } from 'react';
import { Search, Trophy } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import {
  PhCard,
  PhChip,
  PhInput,
  PhLargeTitleBar,
  RatingPill,
} from '@/design-system';
import { PlayerTileCard } from '@/components/shared/domain-cards';

export default function PlayerCommunityPage() {
  const t = useTranslations();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const samplePlayers = [
    {
      id: 'p-1',
      name: 'Rakibul Hasan',
      sportName: 'Cricket',
      positions: ['Fast Bowler', 'All-Rounder'],
      experienceYears: 5,
      ratingAverage: 4.8,
      ratingCount: 19,
      upazilaName: 'Mirpur',
      districtName: 'Dhaka',
      khepAvailable: true,
      rateMin: 2000,
      rateMax: 3500,
      verifiedBadge: true,
    },
    {
      id: 'p-2',
      name: 'Tanvir Ahmed',
      sportName: 'Football',
      positions: ['Goalkeeper'],
      experienceYears: 4,
      ratingAverage: 4.7,
      ratingCount: 14,
      upazilaName: 'Beanibazar',
      districtName: 'Sylhet',
      khepAvailable: true,
      rateMin: 1200,
      rateMax: 2000,
      verifiedBadge: false,
    },
    {
      id: 'p-3',
      name: 'Imran Hossain',
      sportName: 'Football',
      positions: ['Striker', 'CAM'],
      experienceYears: 6,
      ratingAverage: 4.9,
      ratingCount: 28,
      upazilaName: 'Amtali',
      districtName: 'Barguna',
      khepAvailable: true,
      rateMin: 1500,
      rateMax: 2500,
      verifiedBadge: true,
    },
  ];

  const filtered = samplePlayers.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.sportName.toLowerCase().includes(query.toLowerCase()) ||
    p.upazilaName.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      <PhLargeTitleBar
        title="Players"
        subtitle="Explore other players and connect across Bangladesh."
      />

      <div className="max-w-md">
        <PhInput
          leading={<Search className="h-4 w-4" />}
          placeholder="Search by name, sport, or area…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((player) => (
          <PlayerTileCard
            key={player.id}
            player={player}
            onTap={() => router.push(`/p/${player.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

