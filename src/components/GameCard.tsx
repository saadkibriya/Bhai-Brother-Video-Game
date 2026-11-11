import type { Game } from '../data/shop';

export function GameCard({ game }: { game: Game }) {
  return (
    <article className="game-card">
      <div className="game-card__art">
        {game.cover ? (
          <img
            src={game.cover}
            alt={`${game.title} cover`}
            width={560}
            height={750}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="game-card__initials" aria-hidden="true">
            {game.title.slice(0, 2).toUpperCase()}
          </span>
        )}
        {game.tag && <span className="tag">{game.tag}</span>}
      </div>
      <div className="game-card__body">
        <h3>{game.title}</h3>
        <p className="game-card__meta">
          {game.genre} · {game.players}P · {game.platforms.map((p) => p.toUpperCase()).join(' / ')}
        </p>
        <p className="game-card__blurb">{game.blurb}</p>
      </div>
    </article>
  );
}
