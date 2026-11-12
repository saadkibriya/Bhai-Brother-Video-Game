import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi, type Admin } from '../lib/adminApi';
import { passwordProblem, usernameProblem } from '../lib/credentials';

export function AdminSettingsPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [working, setWorking] = useState('');

  const [name, setName] = useState({ username: '', password: '' });
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

  useEffect(() => {
    (async () => {
      try {
        const current = await adminApi.me();
        setAdmin(current.admin);
        setName({ username: current.admin.username, password: '' });
      } catch {
        setAdmin(null);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  async function saveUsername(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    const requested = name.username.trim().toLowerCase();
    const nameIssue = usernameProblem(requested);
    if (nameIssue) return setError(nameIssue);
    if (!name.password) return setError('Type your current password to confirm the change.');

    setWorking('username');
    try {
      const result = await adminApi.changeUsername(name.password, requested);
      setAdmin(result.admin);
      setName({ username: result.admin.username, password: '' });
      setNotice(`Username changed to @${result.admin.username}. Sign in with it next time.`);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not change the username.');
    } finally {
      setWorking('');
    }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    const passwordIssue = passwordProblem(passwords.next);
    if (passwordIssue) return setError(passwordIssue);
    if (passwords.next !== passwords.confirm) return setError('The two new passwords do not match.');
    if (passwords.next === passwords.current) {
      return setError('Choose a password different from the current one.');
    }

    setWorking('password');
    try {
      await adminApi.changePassword(passwords.current, passwords.next);
      setPasswords({ current: '', next: '', confirm: '' });
      setNotice('Password changed. Any other device signed in to the panel has been signed out.');
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not change the password.');
    } finally {
      setWorking('');
    }
  }

  async function signOut() {
    try {
      await adminApi.logout();
    } finally {
      navigate('/admin');
    }
  }

  return (
    <>
      <section className="band band--ink page-head">
        <div className="wrap">
          <p className="eyebrow">Staff</p>
          <h1>Account settings</h1>
          <p className="lede">
            Change the username and password you sign in with. Both changes ask for your current
            password first, so a phone left open at the counter cannot be used to lock you out.
          </p>
        </div>
      </section>

      <section className="band band--ink-2">
        <div className="wrap auth">
          <div className="auth-card">
            {checking && <p className="summary__note">Checking your session…</p>}

            {!checking && !admin && (
              <>
                <p className="eyebrow">Signed out</p>
                <p>Sign in to the counter panel first, then come back here to change your details.</p>
                <Link className="btn btn--flame" to="/admin">
                  Go to sign in
                </Link>
              </>
            )}

            {admin && (
              <>
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

                {admin.mustChange && (
                  <p className="banner banner--warn">
                    You are still using a temporary password. Change it below.
                  </p>
                )}

                <form className="auth-form" onSubmit={saveUsername} noValidate>
                  <p className="eyebrow">Username</p>
                  <p className="summary__note">
                    Signed in as <strong>@{admin.username}</strong> ({admin.role === 'owner' ? 'main admin' : 'counter admin'}).
                  </p>
                  <label className="field">
                    <span className="field__label">New username</span>
                    <input
                      className="input"
                      value={name.username}
                      onChange={(event) => setName((current) => ({ ...current, username: event.target.value }))}
                      autoCapitalize="none"
                      autoComplete="username"
                      maxLength={24}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Current password</span>
                    <input
                      className="input"
                      type="password"
                      value={name.password}
                      onChange={(event) => setName((current) => ({ ...current, password: event.target.value }))}
                      autoComplete="current-password"
                    />
                  </label>
                  <button
                    className="btn btn--flame"
                    type="submit"
                    disabled={working === 'username' || name.username.trim().toLowerCase() === admin.username}
                  >
                    {working === 'username' ? 'Saving…' : 'Change username'}
                  </button>
                </form>

                <hr className="settings-rule" />

                <form className="auth-form" onSubmit={savePassword} noValidate>
                  <p className="eyebrow">Password</p>
                  <p className="summary__note">
                    At least 8 characters. Use something only you know — not the shop phone number.
                  </p>
                  <label className="field">
                    <span className="field__label">Current password</span>
                    <input
                      className="input"
                      type="password"
                      value={passwords.current}
                      onChange={(event) =>
                        setPasswords((current) => ({ ...current, current: event.target.value }))
                      }
                      autoComplete="current-password"
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">New password</span>
                    <input
                      className="input"
                      type="password"
                      value={passwords.next}
                      onChange={(event) =>
                        setPasswords((current) => ({ ...current, next: event.target.value }))
                      }
                      autoComplete="new-password"
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Repeat new password</span>
                    <input
                      className="input"
                      type="password"
                      value={passwords.confirm}
                      onChange={(event) =>
                        setPasswords((current) => ({ ...current, confirm: event.target.value }))
                      }
                      autoComplete="new-password"
                    />
                  </label>
                  <button className="btn btn--flame" type="submit" disabled={working === 'password'}>
                    {working === 'password' ? 'Saving…' : 'Change password'}
                  </button>
                </form>
              </>
            )}
          </div>

          <aside className="auth-side">
            <p className="eyebrow">Keeping it safe</p>
            <p>
              Username and password changes need your current password, and changing the password
              signs out every other device still logged in to the panel.
            </p>
            <p>
              You stay signed in on this device after a change, so carry on timing sessions straight
              away.
            </p>
            {admin && (
              <p className="summary__note">
                Forgot the current password? Sign out and use{' '}
                <Link className="link-underline" to="/admin">
                  Reset with WhatsApp
                </Link>
                .
              </p>
            )}
            <div className="hero__actions">
              <Link className="btn btn--ghost" to="/admin">
                Back to counter
              </Link>
              {admin && (
                <button className="btn btn--ghost" type="button" onClick={signOut}>
                  Sign out
                </button>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
