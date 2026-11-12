import { useEffect, useState, type FormEvent } from 'react';
import { SHOP } from '../data/shop';
import { whatsappUrl } from '../lib/booking';
import { passwordProblem, usernameProblem } from '../lib/credentials';
import { adminApi, type AdminRole, type PendingReset, type TeamMember } from '../lib/adminApi';
import { formatDayTime } from '../lib/stations';

interface Props {
  currentAdminId: number;
}

export function AdminTeam({ currentAdminId }: Props) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [pending, setPending] = useState<PendingReset[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<{ username: string; displayName: string; role: AdminRole; password: string }>({
    username: '',
    displayName: '',
    role: 'admin',
    password: '',
  });
  const [newPassword, setNewPassword] = useState<{ username: string; password: string } | null>(null);
  const [issued, setIssued] = useState<{ username: string; code: string } | null>(null);
  const [working, setWorking] = useState('');

  const load = async () => {
    try {
      const data = await adminApi.team();
      setMembers(data.admins);
      setPending(data.pendingResets);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not load the team.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');

    const nameIssue = usernameProblem(form.username);
    if (nameIssue) return setError(nameIssue);
    if (form.password) {
      const passwordIssue = passwordProblem(form.password);
      if (passwordIssue) return setError(passwordIssue);
    }

    setWorking('create');
    try {
      const result = await adminApi.createAdmin({
        username: form.username.trim().toLowerCase(),
        displayName: form.displayName.trim(),
        role: form.role,
        password: form.password || undefined,
      });
      setNewPassword({ username: result.admin.username, password: result.tempPassword });
      setNotice(
        `${result.admin.displayName} can now sign in as “${result.admin.username}”. Send them the temporary password below — it is shown once.`
      );
      setForm({ username: '', displayName: '', role: 'admin', password: '' });
      setCreating(false);
      load();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not create that admin.');
    } finally {
      setWorking('');
    }
  }

  async function toggleDisabled(member: TeamMember) {
    setError('');
    setWorking(`disabled:${member.id}`);
    try {
      await adminApi.setDisabled(member.id, !member.disabled);
      load();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not update that admin.');
    } finally {
      setWorking('');
    }
  }

  async function issue(member: TeamMember) {
    setError('');
    setNotice('');
    setWorking(`code:${member.id}`);
    try {
      const result = await adminApi.issueReset(member.id);
      setIssued({ username: member.username, code: result.code });
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not issue a code.');
    } finally {
      setWorking('');
    }
  }

  const notifyHref = newPassword
    ? whatsappUrl(
        `Bhai Brother counter panel — new admin added.\nUsername: ${newPassword.username}\nTemporary password: ${newPassword.password}\n\nThey should change it after their first sign-in.`
      )
    : '';

  return (
    <section className="admin-team" aria-label="Admins">
      <div className="admin-team__head">
        <div>
          <p className="eyebrow">Team</p>
          <h2>Who can run the counter</h2>
        </div>
        <button className="btn btn--flame" type="button" onClick={() => setCreating((open) => !open)}>
          {creating ? 'Close' : 'Add admin'}
        </button>
      </div>

      <p className="admin-hint">
        Main admins can add people, issue reset codes and disable accounts. Counter admins can time
        sessions and block stations, but cannot manage the team. Every new admin notifies the main
        WhatsApp on {SHOP.phone}.
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

      {newPassword && (
        <div className="code-box">
          <p className="eyebrow">Temporary password</p>
          <p className="code-box__code">{newPassword.password}</p>
          <p className="summary__note">
            Shown once. Send it to {newPassword.username}, then ask them to change it from “Change
            password”.
          </p>
          <div className="code-box__actions">
            <a className="btn btn--flame" href={notifyHref} target="_blank" rel="noreferrer">
              Notify main WhatsApp
            </a>
            <button className="btn btn--ghost" type="button" onClick={() => setNewPassword(null)}>
              Done
            </button>
          </div>
        </div>
      )}

      {issued && (
        <div className="code-box">
          <p className="eyebrow">Reset code for {issued.username}</p>
          <p className="code-box__code">{issued.code}</p>
          <p className="summary__note">
            Verify it is really them on WhatsApp first, then send this code. It expires in 30
            minutes and works once.
          </p>
          <button className="btn btn--ghost" type="button" onClick={() => setIssued(null)}>
            Done
          </button>
        </div>
      )}

      {pending.length > 0 && (
        <div className="pending">
          <p className="eyebrow">Waiting for a reset</p>
          {pending.map((request) => (
            <p className="pending__row" key={request.id}>
              <span>
                <strong>{request.username}</strong> asked {formatDayTime(request.createdAt)}
              </span>
              {request.issued ? (
                <span className="muted">code issued</span>
              ) : (
                <button
                  className="btn btn--ghost"
                  type="button"
                  onClick={() => {
                    const member = members.find((item) => item.id === request.adminId);
                    if (member) issue(member);
                  }}
                  disabled={working === `code:${request.adminId}`}
                >
                  Issue code
                </button>
              )}
            </p>
          ))}
        </div>
      )}

      {creating && (
        <form className="team-form" onSubmit={create} noValidate>
          <div className="two-up">
            <label className="field">
              <span className="field__label">Username</span>
              <input
                className="input"
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="username"
                autoCapitalize="none"
                autoComplete="off"
              />
            </label>
            <label className="field">
              <span className="field__label">Name</span>
              <input
                className="input"
                value={form.displayName}
                onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                placeholder="Counter admin"
              />
            </label>
          </div>

          <div className="two-up">
            <label className="field">
              <span className="field__label">Role</span>
              <select
                className="input"
                value={form.role}
                onChange={(event) =>
                  setForm((current) => ({ ...current, role: event.target.value as AdminRole }))
                }
              >
                <option value="admin">Counter admin</option>
                <option value="owner">Main admin</option>
              </select>
            </label>
            <label className="field">
              <span className="field__label">Temporary password</span>
              <input
                className="input"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Leave blank to generate"
                autoComplete="new-password"
              />
            </label>
          </div>

          <button className="btn btn--flame" type="submit" disabled={working === 'create'}>
            {working === 'create' ? 'Creating…' : 'Create admin'}
          </button>
        </form>
      )}

      <table className="pass-table pass-table--dark team-table">
        <caption className="sr-only">Counter admins</caption>
        <thead>
          <tr>
            <th scope="col">Admin</th>
            <th scope="col">Role</th>
            <th scope="col">Last in</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td>
                {member.displayName}
                <small>@{member.username}</small>
              </td>
              <td>{member.role === 'owner' ? 'Main admin' : 'Counter'}</td>
              <td>{member.lastLoginAt ? formatDayTime(member.lastLoginAt) : 'never'}</td>
              <td>
                <span className="team-table__actions">
                  <button
                    className="btn btn--ghost btn--tiny"
                    type="button"
                    onClick={() => issue(member)}
                    disabled={working === `code:${member.id}`}
                  >
                    Reset code
                  </button>
                  <button
                    className="btn btn--ghost btn--tiny"
                    type="button"
                    onClick={() => toggleDisabled(member)}
                    disabled={member.id === currentAdminId || working === `disabled:${member.id}`}
                  >
                    {member.disabled ? 'Enable' : 'Disable'}
                  </button>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
