import React, { useState } from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

import AuthPage from './pages/Auth.js';
import EventsPage from './pages/Events.js';
import BookingsPage from './pages/Bookings.js';
import MainNavigation from './components/Navigation/MainNavigation.js';
import AuthContext from './context/auth-context.js';

import './App.css';

const App = () => {

  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const login = (token, userId, tokenExpiration) => {
    setToken(token);
    setUserId(userId);
  }

  const logout = () => {
    setToken(null);
    setUserId(null);
  }

  return (
    <BrowserRouter>
      <AuthContext.Provider value={{ token: token, userId: userId, login: login, logout: logout }}>
        <MainNavigation />
        <main className="main-content">
          <Switch>
            {token && <Redirect from="/" to="/events" exact />}
            {token && <Redirect from="/auth" to="/events" exact />}
            {!token && (
              <Route path="/auth" component={AuthPage} />
              )}
            <Route path="/events" component={EventsPage} />
            {token && (
              <Route path="/bookings" component={BookingsPage} />
            )}
            {!token && <Redirect to="/auth" exact />}
          </Switch>
        </main>
      </AuthContext.Provider>
    </BrowserRouter>
  )
}

export default App;
