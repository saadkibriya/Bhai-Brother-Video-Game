import React, { useState } from 'react';
import { Users, Sparkles, Flame } from 'lucide-react';
import { Game } from '../lib/store';
import { useNavigate } from 'react-router-dom';

function getHashColorAngle(title: string): { angle: number; hueOffset: number } {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0;
  }
  const angle = 115 + (Math.abs(hash) % 50); // 115 to 165 deg
  const hueOffset = Math.abs(hash >> 3) % 40;
  return { angle, hueOffset };
}

export const GameCard: React.FC<{ game: Game; onSelect?: (game: Game) => void }> = ({ game, onSelect }) => {
  const navigate = useNavigate();
  const [imageFailed, setImageFailed] = useState(false);
  const { angle, hueOffset } = getHashColorAngle(game.title);

  const isPS5Primary = game.platforms.includes('ps5');
  const baseColor = isPS5Primary ? `hsl(${205 + hueOffset}, 95%, 45%)` : `hsl(${260 + hueOffset}, 90%, 55%)`;

  const handleBook = () => {
    if (onSelect) {
      onSelect(game);
    } else {
      navigate(`/book?game=${game.id}`);
    }
  };

  const hasValidImage = Boolean(game.imageUrl) && !imageFailed;

  return (
    <div
      onClick={handleBook}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-[#4F7CFF]/50 hover:shadow-xl hover:shadow-[#4F7CFF]/10 cursor-pointer"
    >
      {/* 3:4 Aspect Ratio Cover */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden flex flex-col justify-between p-4"
        style={{
          background: !hasValidImage
            ? `linear-gradient(${angle}deg, ${baseColor} 0%, rgba(7, 8, 13, 0.95) 75%)`
            : undefined,
        }}
      >
        {/* Render Generated / Real Cover Photo */}
        {hasValidImage && (
          <>
            <img
              src={game.imageUrl}
              alt={game.title}
              onError={() => setImageFailed(true)}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Dark gradient scrim at top and bottom for chip and text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/90 pointer-events-none" />
          </>
        )}

        {/* Subtle grid pattern for cards without image */}
        {!hasValidImage && (
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        )}

        {/* Top Chips Row */}
        <div className="relative z-10 flex items-center justify-between gap-1.5">
          <div className="flex flex-wrap gap-1">
            {game.platforms.map((p) => (
              <span
                key={p}
                className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${
                  p === 'ps5'
                    ? 'bg-[#3DA9FC]/30 text-[#8adeff] border border-[#3DA9FC]/40'
                    : 'bg-[#8B6CFF]/30 text-[#d4c7ff] border border-[#8B6CFF]/40'
                }`}
              >
                {p}
              </span>
            ))}
          </div>

          {game.tags.includes('Popular') && (
            <span className="flex items-center gap-1 rounded-md bg-[#FF5C6C]/30 border border-[#FF5C6C]/40 px-1.5 py-0.5 text-[10px] font-bold text-[#ff808d] backdrop-blur-sm">
              <Flame className="h-3 w-3 text-[#FF5C6C]" />
              <span>Hot</span>
            </span>
          )}
          {game.tags.includes('New') && !game.tags.includes('Popular') && (
            <span className="flex items-center gap-1 rounded-md bg-[#2BD98A]/30 border border-[#2BD98A]/40 px-1.5 py-0.5 text-[10px] font-bold text-[#62ebb0] backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-[#2BD98A]" />
              <span>New</span>
            </span>
          )}
        </div>

        {/* Bottom Title & Specs */}
        <div className="relative z-10 mt-auto pt-6">
          <h3 className="font-display text-base font-bold leading-snug text-white group-hover:text-[#7ba1ff] transition-colors drop-shadow-md line-clamp-2">
            {game.title}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-200">
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-200">
              <Users className="h-3.5 w-3.5 text-slate-300" />
              <span>1–{game.maxPlayers}P</span>
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-[11px] text-slate-300 truncate">
              {game.genres.slice(0, 2).join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-[#23273A] bg-slate-50 dark:bg-[#151826]/70 px-4 py-2.5 text-xs transition-colors">
        <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition">
          Book Station
        </span>
        <span className="text-[#4F7CFF] font-bold text-xs group-hover:translate-x-0.5 transition-transform">
          →
        </span>
      </div>
    </div>
  );
};
