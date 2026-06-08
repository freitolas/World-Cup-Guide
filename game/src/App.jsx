import { useEffect } from 'react';
import Landing from './components/Landing.jsx';
import Game from './components/Game.jsx';
import Warmups from './components/Warmups.jsx';
import Account from './components/Account.jsx';
import Knockouts from './components/Knockouts.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import TeamDetail from './components/TeamDetail.jsx';
import AiMark from './components/AiMark.jsx';
import { useHashRoute, go } from './hooks.js';
import { useAuth, signOut } from './auth.js';
import { ERRORS } from './voice.js';

// The single quiet affordance (brief §0/§3): no nav, no competing exits.
// Logged out → "Sign in / Sign up". Logged in → "Account" + "Log off".
function TopBar() {
  const { user, ready } = useAuth();
  return (
    <header className="topbar">
      <a href="#/" className="brand" aria-label="THE AI — home"><AiMark /></a>
      <nav className="auth">
        {ready && user ? (
          <>
            <a href="#/account" className="authbtn">Account</a>
            <button className="authbtn" onClick={() => signOut()}>Log off</button>
          </>
        ) : (
          <a href="#/account" className="authbtn primary">Sign in / Sign up</a>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  const route = useHashRoute();

  // After the user clicks the magic-link email, they land on /?code=…
  // Clean the URL and send them to #/account so they see their signed-in state.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('code') || params.has('access_token')) {
      window.history.replaceState(null, '', '/');
      go('/account');
    }
  }, []);

  let view;
  if (route === '/' || route === '') {
    view = <Landing />;
  } else if (route === '/play') {
    view = <Game />;
  } else if (route === '/warmups') {
    view = <Warmups />;
  } else if (route === '/account') {
    view = <Account />;
  } else if (route === '/knockouts') {
    view = <Knockouts />;
  } else if (route === '/leaderboard') {
    view = <Leaderboard />;
  } else if (route.startsWith('/team/')) {
    view = <TeamDetail id={decodeURIComponent(route.slice('/team/'.length))} />;
  } else {
    view = (
      <div className="pad center" style={{ paddingTop: 80 }}>
        <p className="voiceline">{ERRORS.notFound}</p>
        <button className="btn btn-primary" onClick={() => go('/play')}>Back to the games →</button>
      </div>
    );
  }

  return (
    <div className="app">
      <TopBar />
      {view}
    </div>
  );
}
