import { useEffect } from 'react';
import Landing from './components/Landing.jsx';
import Game from './components/Game.jsx';
import Warmups from './components/Warmups.jsx';
import Account from './components/Account.jsx';
import Knockouts from './components/Knockouts.jsx';
import TeamDetail from './components/TeamDetail.jsx';
import { useHashRoute, go } from './hooks.js';
import { ERRORS } from './voice.js';

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

  return <div className="app">{view}</div>;
}
