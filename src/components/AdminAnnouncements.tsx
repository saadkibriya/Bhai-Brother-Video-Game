import { useEffect, useState, type FormEvent } from 'react';
import { adminApi } from '../lib/adminApi';
import { announcementDate, type AdminAnnouncement } from '../lib/announcements';

export function AdminAnnouncements() {
  const [items, setItems] = useState<AdminAnnouncement[] | null>(null);
  const [draft, setDraft] = useState({ title: '', body: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [working, setWorking] = useState('');

  async function load() {
    try {
      const result = await adminApi.announcements();
      setItems(result.announcements);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not load the noticeboard.');
      setItems([]);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function post(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    if (draft.body.trim().length < 3) return setError('Write the announcement before posting.');

    setWorking('post');
    try {
      await adminApi.createAnnouncement({ title: draft.title.trim(), body: draft.body.trim() });
      setDraft({ title: '', body: '' });
      setNotice('Posted. It is on the website now.');
      await load();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not post that.');
    } finally {
      setWorking('');
    }
  }

  async function toggle(item: AdminAnnouncement) {
    setWorking(`${item.id}:toggle`);
    setError('');
    try {
      await adminApi.updateAnnouncement(item.id, { active: !item.active });
      await load();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not update that post.');
    } finally {
      setWorking('');
    }
  }

  async function remove(item: AdminAnnouncement) {
    setWorking(`${item.id}:delete`);
    setError('');
    try {
      await adminApi.deleteAnnouncement(item.id);
      await load();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not delete that post.');
    } finally {
      setWorking('');
    }
  }

  return (
    <div className="admin-log">
      <p className="eyebrow">Noticeboard</p>
      <p className="admin-hint">
        Post an event, a tournament or a closure. Anything posted here appears on the home page of
        the website straight away; hide a post to take it down without deleting it.
      </p>

      {notice && (
        <p className="banner banner--ok" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <form className="announcement-form" onSubmit={post} noValidate>
        <label className="field">
          <span className="field__label">Heading (optional)</span>
          <input
            className="input"
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            maxLength={80}
            placeholder="Friday Showdown"
          />
        </label>
        <label className="field">
          <span className="field__label">Announcement</span>
          <textarea
            className="input announcement-form__body"
            value={draft.body}
            onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
            maxLength={600}
            rows={3}
            placeholder="FC 26 tournament this Friday at 4 PM. ৳100 entry, ৳2,000 prize."
          />
        </label>
        <button className="btn btn--flame" type="submit" disabled={working === 'post'}>
          {working === 'post' ? 'Posting…' : 'Post announcement'}
        </button>
      </form>

      {items && items.length > 0 && (
        <ul className="announcement-admin">
          {items.map((item) => (
            <li key={item.id} data-active={item.active}>
              <div>
                <p className="announcement-admin__meta">
                  {announcementDate(item.createdAt)}
                  {item.createdBy ? ` · @${item.createdBy}` : ''}
                  {item.active ? '' : ' · hidden'}
                </p>
                {item.title && <strong>{item.title}</strong>}
                <p>{item.body}</p>
              </div>
              <div className="announcement-admin__actions">
                <button
                  className="btn btn--ghost btn--tiny"
                  type="button"
                  disabled={working === `${item.id}:toggle`}
                  onClick={() => toggle(item)}
                >
                  {item.active ? 'Hide' : 'Show'}
                </button>
                <button
                  className="btn btn--ghost btn--tiny"
                  type="button"
                  disabled={working === `${item.id}:delete`}
                  onClick={() => remove(item)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {items && items.length === 0 && (
        <p className="summary__note">Nothing posted yet.</p>
      )}
    </div>
  );
}
