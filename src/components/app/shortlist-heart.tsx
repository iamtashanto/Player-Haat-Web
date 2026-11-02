'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { PhIconButton, showPhToast } from '@/design-system';

/**
 * Save-for-later heart with spring pop animation matching Flutter's `ShortlistHeart`.
 */
export function ShortlistHeart({
  initialSaved = false,
  onToggle,
}: {
  initialSaved?: boolean;
  onToggle?: (saved: boolean) => void;
}) {
  const t = useTranslations();
  const [saved, setSaved] = useState(initialSaved);
  const [popKey, setPopKey] = useState(0);

  const handleTap = () => {
    const next = !saved;
    setSaved(next);
    setPopKey((k) => k + 1);
    onToggle?.(next);
    showPhToast(next ? t('shortlistSavedToast') : t('shortlistRemovedToast'));
  };

  return (
    <motion.div
      key={popKey}
      initial={popKey > 0 ? { scale: 0.9 } : false}
      animate={{ scale: [1, 1.32, 1] }}
      transition={{ duration: 0.28 }}
      onClick={(e) => e.stopPropagation()}
    >
      <PhIconButton
        icon={
          <Heart
            className="h-5 w-5"
            fill={saved ? 'var(--ph-danger)' : 'none'}
            stroke={saved ? 'var(--ph-danger)' : 'currentColor'}
          />
        }
        semanticLabel={t('shortlistSave')}
        filled={false}
        onPressed={handleTap}
      />
    </motion.div>
  );
}
