'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Player } from '@/app/types/player';

type ShareButtonProps = {
  label: string;
  className: string;
  onClick: () => void;
};

function ShareButton({ label, className, onClick }: ShareButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold shadow-md transition-transform duration-200 hover:scale-[1.02] ${className}`}
    >
      {label}
    </button>
  );
}

export default function PlayerShareSection({ player }: { player: Player }) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);

  const averageRating = useMemo(() => {
    const value = typeof player.average_rating === 'number' ? player.average_rating : player.rating_avg || 0;
    return value.toFixed(1);
  }, [player.average_rating, player.rating_avg]);

  const shareText = useMemo(() => {
    const urlPart = shareUrl || `/players/${player.slug}`;
    return `${player.name} dostał średnio ${averageRating} od kibiców na Grillu... Kto da mu jeszcze mniej? 😂 Oceń sam: ${urlPart}`;
  }, [averageRating, player.name, player.slug, shareUrl]);

  const shareLink = shareUrl || `/players/${player.slug}`;

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Grill Ekstraklasa - ${player.name}`,
          text: shareText,
          url: shareLink,
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  const openShareUrl = async (url: string) => {
    const usedNative = await handleNativeShare();
    if (usedNative) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = async () => {
    const usedNative = await handleNativeShare();
    if (usedNative) return;

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareLink);

  return (
    <section className="mt-8 card">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h3 className="text-xl font-bold text-slate-900">Udostępnij ten dramat 😂</h3>
        <p className="text-xs text-slate-500">Niech cały stadion to zobaczy</p>
      </div>
      <p className="mt-3 text-sm text-slate-600">{shareText}</p>

      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        <ShareButton
          label="X"
          className="bg-slate-900 text-white"
          onClick={() => openShareUrl(`https://twitter.com/intent/tweet?text=${encodedText}`)}
        />
        <ShareButton
          label="Facebook"
          className="bg-blue-600 text-white"
          onClick={() =>
            openShareUrl(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`)
          }
        />
        <ShareButton
          label="WhatsApp"
          className="bg-emerald-500 text-white"
          onClick={() => openShareUrl(`https://api.whatsapp.com/send?text=${encodedText}`)}
        />
        <ShareButton
          label={copied ? 'Skopiowano!' : 'Kopiuj link'}
          className="bg-amber-400 text-slate-900"
          onClick={handleCopy}
        />
      </div>
    </section>
  );
}
