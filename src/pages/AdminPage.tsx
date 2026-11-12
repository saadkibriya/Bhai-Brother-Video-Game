import { useEffect, useState, type FormEvent } from 'react';
import { SHOP } from '../data/shop';
import { whatsappUrl } from '../lib/booking';
import { codeProblem, normalizeCode, passwordProblem, usernameProblem } from '../lib/credentials';
import { ApiError, adminApi, type Admin } from '../lib/adminApi';
import { CounterPanel } from '../components/CounterPanel';

type Screen = 'loading' | 'setup' | 'login' | 'forgot' | 'reset' | 'panel' | 'offline';

export function AdminPage() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [working, setWorking] = useState('');

  const [login, setLogin] = useState({ username: '', password: '' });
  const [setup, setSetup] = useState({ username: '', password: '', confirm: '', key: '' });
  const [forgotName, setForgotName] = useState('');
  const [reset, setReset] = useState({ username: '', code: '', password: '' });
  const [needsSetup, setNeedsSetup] = useState(false);

  async function checkSession() {
    setScreen('loading');
    setError('');

    // A dropped connection is not a sign-out: only a 401 means signed out.
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const status = await adminApi.setupStatus();
        setNeedsSetup(status.needsSetup);
        if (status.needsSetup) {
          setScreen('setup');
          return;
        }
        const current = await adminApi.me();
        setAdmin(current.admin);
        setScreen('panel');
        return;
      } catch (problem) {
        if (problem instanceof ApiError && problem.status === 401) {
          setScreen('login');
          return;
        }
        if (attempt === 1) {
          setError(problem instanceof Error ? problem.message : 'Could not reach the counter server.');
          setScreen('offline');
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 1200));
      }
    }
  }

  useEffect(() => {
    void checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setWorking('login');
    try {
      const result = await adminApi.login(login.username, login.password);
      setAdmin(result.admin);
      setLogin({ username: '', password: '' });
      setScreen('panel');
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not sign in.');
    } finally {
      setWorking('');
    }
  }

  async function runSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const nameIssue = usernameProblem(setup.username);
    if (nameIssue) return setError(nameIssue);
    const passwordIssue = passwordProblem(setup.password);
    if (passwordIssue) return setError(passwordIssue);
    if (setup.password !== setup.confirm) return setError('The two passwords do not match.');
    if (!setup.key) return setError('Paste the setup key from the site owner.');

    setWorking('setup');
    try {
      await adminApi.setup(setup.username, setup.password, setup.key);
      setNeedsSetup(false);
      setScreen('login');
      setNotice('Main admin created. Sign in with that username and password.');
      setSetup({ username: '', password: '', confirm: '', key: '' });
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not finish setup.');
    } finally {
      setWorking('');
    }
  }

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const nameIssue = usernameProblem(forgotName);
    if (nameIssue) return setError(nameIssue);
    setWorking('forgot');
    try {
      await adminApi.forgot(forgotName.trim().toLowerCase());
      setReset((current) => ({ ...current, username: forgotName.trim().toLowerCase() }));
      setScreen('reset');
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not send the request.');
    } finally {
      setWorking('');
    }
  }

  async function submitReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const codeIssue = codeProblem(reset.code);
    if (codeIssue) return setError(codeIssue);
    const passwordIssue = passwordProblem(reset.password);
    if (passwordIssue) return setError(passwordIssue);

    setWorking('reset');
    try {
      await adminApi.reset(reset.username, reset.code, reset.password);
      setScreen('login');
      setLogin({ username: reset.username, password: '' });
      setNotice('Password changed. Sign in with the new one.');
      setReset({ username: '', code: '', password: '' });
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not reset the password.');
    } finally {
      setWorking('');
    }
  }

  const backToLogin = () => {
    setError('');
    setScreen('login');
  };

  const heading = needsSetup
    ? 'Set up the counter'
    : screen === 'forgot'
      ? 'Reset your password'
      : screen === 'reset'
        ? 'Enter your reset code'
        : screen === 'offline'
          ? 'Cannot reach the counter'
          : 'Admin sign in';

  const intro = needsSetup
    ? 'No admin exists yet. Create the main admin account with the setup key, then add the counter team.'
    : screen === 'forgot'
      ? 'Enter your username. The main admin verifies it is you on WhatsApp, then sends a one-time code.'
      : screen === 'reset'
        ? 'Type the 6-digit code from the main admin and choose a new password.'
        : screen === 'offline'
          ? 'The panel could not reach the counter server. Check the connection and try again — you are still signed in.'
          : 'Sign in to time sessions, log players and manage the station board. The panel is for staff only.';

  if (screen === 'panel' && admin) {
    return (
      <CounterPanel
        admin={admin}
        onSignOut={() => {
          setAdmin(null);
          setScreen('login');
          setNotice('Signed out.');
        }}
      />
    );
  }

  return (
    <>
      <section className="band band--ink page-head">
        <div className="wrap">
          <p className="eyebrow">Staff</p>
          <h1>{heading}</h1>
          <p className="lede">{intro}</p>
        </div>
      </section>

      <section className="band band--ink-2">
        <div className="wrap auth">
          <div className="auth-card">
            {screen === 'loading' && <p className="summary__note">Checking your session…</p>}

            {screen === 'offline' && (
              <div className="auth-form">
                <p className="summary__note">
                  Sessions last for months, so a failed request does not sign you out. If this keeps
                  happening, check that the shop wifi is working.
                </p>
                <button className="btn btn--flame" type="button" onClick={() => void checkSession()}>
                  Try again
                </button>
                <button
                  className="link-underline auth__back"
                  type="button"
                  onClick={() => {
                    setError('');
                    setScreen('login');
                  }}
                >
                  Sign in instead
                </button>
              </div>
            )}

            {notice && screen !== 'panel' && (
              <p className="banner banner--ok" role="status">
                {notice}
              </p>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}

            {screen === 'setup' && (
              <form className="auth-form" onSubmit={runSetup} noValidate>
                <label className="field">
                  <span className="field__label">Username</span>
                  <input
                    className="input"
                    value={setup.username}
                    onChange={(event) => setSetup((current) => ({ ...current, username: event.target.value }))}
                    placeholder="owner"
                    autoCapitalize="none"
                    autoComplete="username"
                  />
                </label>
                <label className="field">
                  <span className="field__label">Password</span>
                  <input
                    className="input"
                    type="password"
                    value={setup.password}
                    onChange={(event) => setSetup((current) => ({ ...current, password: event.target.value }))}
                    autoComplete="new-password"
                  />
                </label>
                <label className="field">
                  <span className="field__label">Repeat password</span>
                  <input
                    className="input"
                    type="password"
                    value={setup.confirm}
                    onChange={(event) => setSetup((current) => ({ ...current, confirm: event.target.value }))}
                    autoComplete="new-password"
                  />
                </label>
                <label className="field">
                  <span className="field__label">Setup key</span>
                  <input
                    className="input"
                    type="password"
                    value={setup.key}
                    onChange={(event) => setSetup((current) => ({ ...current, key: event.target.value }))}
                    placeholder="ADMIN_KEY from Sites → Secrets"
                  />
                </label>
                <p className="summary__note">
                  The setup key is the <code>ADMIN_KEY</code> secret, stored in <code>.admin-key</code>{' '}
                  in the project. It is only needed once.
                </p>
                <button className="btn btn--flame" type="submit" disabled={working === 'setup'}>
                  {working === 'setup' ? 'Creating…' : 'Create main admin'}
                </button>
              </form>
            )}

            {screen === 'login' && (
              <>
                <form className="auth-form" onSubmit={signIn} noValidate>
                  <label className="field">
                    <span className="field__label">Username</span>
                    <input
                      className="input"
                      value={login.username}
                      onChange={(event) => setLogin((current) => ({ ...current, username: event.target.value }))}
                      autoCapitalize="none"
                      autoComplete="username"
                      placeholder="owner"
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Password</span>
                    <input
                      className="input"
                      type="password"
                      value={login.password}
                      onChange={(event) => setLogin((current) => ({ ...current, password: event.target.value }))}
                      autoComplete="current-password"
                    />
                  </label>
                  <button className="btn btn--flame" type="submit" disabled={working === 'login'}>
                    {working === 'login' ? 'Signing in…' : 'Sign in'}
                  </button>
                </form>
                <p className="summary__note">
                  Forgot it?{' '}
                  <button
                    className="link-underline"
                    type="button"
                    onClick={() => {
                      setError('');
                      setScreen('forgot');
                    }}
                  >
                    Reset with WhatsApp
                  </button>{' '}
                  · or call the counter on{' '}
                  <a className="link-underline" href={`tel:${SHOP.tel}`}>
                    {SHOP.phone}
                  </a>
                  .
                </p>
              </>
            )}

            {screen === 'forgot' && (
              <>
                <form className="auth-form" onSubmit={requestReset} noValidate>
                  <p className="summary__note">
                    Enter your username. The main admin gets the request on WhatsApp, checks it is
                    really you, and sends back a 6-digit code.
                  </p>
                  <label className="field">
                    <span className="field__label">Username</span>
                    <input
                      className="input"
                      value={forgotName}
                      onChange={(event) => setForgotName(event.target.value)}
                      autoCapitalize="none"
                      placeholder="username"
                    />
                  </label>
                  <button className="btn btn--flame" type="submit" disabled={working === 'forgot'}>
                    {working === 'forgot' ? 'Sending…' : 'Request a reset code'}
                  </button>
                </form>
                <button className="link-underline auth__back" type="button" onClick={backToLogin}>
                  Back to sign in
                </button>
              </>
            )}

            {screen === 'reset' && (
              <>
                <div className="banner banner--ok">
                  Request sent for <strong>{reset.username}</strong>.
                </div>
                <a
                  className="btn btn--ghost"
                  href={whatsappUrl(
                    `Password reset request for the counter panel.\nUsername: ${reset.username}\nPlease verify it is me and send the 6-digit code.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  Message the counter on WhatsApp
                </a>
                <form className="auth-form" onSubmit={submitReset} noValidate>
                  <label className="field">
                    <span className="field__label">6-digit code</span>
                    <input
                      className="input"
                      value={reset.code}
                      onChange={(event) =>
                        setReset((current) => ({ ...current, code: normalizeCode(event.target.value) }))
                      }
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="123456"
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">New password</span>
                    <input
                      className="input"
                      type="password"
                      value={reset.password}
                      onChange={(event) => setReset((current) => ({ ...current, password: event.target.value }))}
                      autoComplete="new-password"
                    />
                  </label>
                  <button className="btn btn--flame" type="submit" disabled={working === 'reset'}>
                    {working === 'reset' ? 'Saving…' : 'Set new password'}
                  </button>
                </form>
                <p className="summary__note">
                  Codes expire after 30 minutes and work once. If it has expired, ask the main admin
                  for a new one.
                </p>
                <button className="link-underline auth__back" type="button" onClick={backToLogin}>
                  Back to sign in
                </button>
              </>
            )}
          </div>

          <aside className="auth-side">
            <p className="eyebrow">Staff only</p>
            <p>
              Accounts are per person so the owner can see who started a session and can remove
              access when someone leaves. Passwords are stored hashed — nobody, including the owner,
              can read them.
            </p>
            <p>
              Forgot a password? The main admin issues a one-time code from the panel, after
              verifying you on WhatsApp.
            </p>
            <p className="summary__note">
              No admin account yet? Ask the owner. This is the counter panel for{' '}
              {SHOP.fullName}.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
