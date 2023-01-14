import React from 'react';
import { Routes, Route, Outlet, Link } from 'react-router-dom';
import { createClient, configureChains, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { mainnet } from 'wagmi/chains';
import Signin from './components/Signin'
import User from './components/User'
import './App.css';

const { provider, webSocketProvider } = configureChains([mainnet], [publicProvider()]);
const wagmiClient = createClient({ provider, webSocketProvider, autoConnect: true });

export default function App() {
  return (
    <WagmiConfig client={wagmiClient}>
      <div>
        <h1>Home</h1>
        <p>Home</p>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="signin" element={<Signin />} />
            <Route path="user" element={<User />} />
            <Route path="account" element={<Account />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="*" element={<NoMatch />} />
          </Route>
        </Routes>
      </div>
    </WagmiConfig>
  );
}

function Layout() {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/signin">signin</Link>
          </li>
          <li>
            <Link to="/user">user</Link>
          </li>
          <li>
            <Link to="/account">Account</Link>
          </li>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/nothing-here">Nothing Here</Link>
          </li>
        </ul>
      </nav>

      <hr />
      <Outlet />
    </div>
  );
}

function Home() {
  return (
    <div>
      <h2>Home</h2>
    </div>
  );
}

function Account() {
  return (
    <div>
      <h2>Account</h2>
    </div>
  );
}

function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
    </div>
  );
}

function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}
