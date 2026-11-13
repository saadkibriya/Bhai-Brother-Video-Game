import { useEffect, useState } from 'react';
import { announcementDate, fetchAnnouncements, type Announcement } from '../lib/announcements';

export function Announcements() {
  const [items, setItems] = useState<Announcement[]>([]);

  useEffect(() => {
    let alive = true;
    fetchAnnouncements()
      .then((next) => {
        if (alive) setItems(next);
      })
      .catch(() => {
        /* the noticeboard is optional; the rest of the page still works */
      });
    return () => {
      alive = false;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="band band--flame announcements" id="news">
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">Noticeboard</p>
            <h2>What&rsquo;s on.</h2>
          </div>
          <p>Posts from the counter: events, tournaments and anything changing on the floor.</p>
        </div>

        <div className="announcement-list">
          {items.map((item) => (
            <article className="announcement" key={item.id}>
              <p className="announcement__date">{announcementDate(item.createdAt)}</p>
              {item.title && <h3>{item.title}</h3>}
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
