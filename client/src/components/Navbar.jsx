import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GithubIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Profile', to: '/profile' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, login } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* ════════ Fixed Navbar ════════ */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between py-5 lg:py-6 bg-black/80 backdrop-blur-md border-b border-blue-500/10" style={{ paddingLeft: '6%', paddingRight: '6%' }}>
        {/* Brand */}
        <Link
          to="/"
          className="font-podium text-white font-bold uppercase text-2xl sm:text-3xl tracking-wider"
        >
          OSSPATH
        </Link>

        {/* Center links — desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-inter text-sm tracking-widest uppercase transition-colors ${
                location.pathname === link.to
                  ? 'text-sky-300'
                  : 'text-blue-50/75 hover:text-sky-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right — desktop */}
        <div className="hidden md:flex items-center">
          {user ? (
            <Link to="/profile" className="flex items-center gap-3 group">
              <img
                src={user.avatar_url || user.avatarUrl}
                alt={user.username || user.login}
                className="w-8 h-8 rounded-full border border-blue-400/25 group-hover:border-sky-300/50 transition-colors"
              />
              <span className="font-inter text-sm text-blue-50/80 group-hover:text-sky-100 transition-colors tracking-wider uppercase">
                {user.username || user.login}
              </span>
            </Link>
          ) : (
            <button
              onClick={login}
              className="flex items-center gap-2 rounded-full border border-blue-400/25 hover:border-sky-300/50 px-6 py-3 text-xs tracking-widest uppercase text-blue-50 font-inter hover:bg-blue-500/10 transition-all cursor-pointer"
            >
              <GithubIcon className="w-4 h-4" />
              SIGN IN WITH GITHUB
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Hamburger — mobile */}
        <button
          className="md:hidden flex flex-col space-y-1.5"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <div className="w-6 h-0.5 bg-sky-100" />
          <div className="w-6 h-0.5 bg-sky-100" />
          <div className="w-4 h-0.5 bg-sky-100" />
        </button>
      </nav>

      {/* ════════ Mobile Menu Overlay ════════ */}
      <div
        className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col transition-all duration-500 ${
          menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-6 sm:px-10 py-5">
          <span className="font-podium text-white font-bold uppercase text-2xl sm:text-3xl tracking-wider">
            OSSPATH
          </span>
          <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          {navLinks.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`font-podium text-4xl sm:text-5xl uppercase transition-all duration-500 ${
                location.pathname === link.to ? 'text-sky-300' : 'text-white'
              }`}
              style={{
                transitionDelay: `${i * 80 + 100}ms`,
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
              }}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className="mt-4 flex items-center gap-3 transition-all duration-500"
              style={{
                transitionDelay: `${navLinks.length * 80 + 100}ms`,
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
              }}
            >
              <img
                src={user.avatar_url || user.avatarUrl}
                alt={user.username || user.login}
                className="w-10 h-10 rounded-full border border-blue-400/25"
              />
              <span className="font-inter text-white text-sm tracking-wider uppercase">
                {user.username || user.login}
              </span>
            </Link>
          ) : (
            <button
              onClick={() => {
                setMenuOpen(false);
                login();
              }}
              className="mt-4 rounded-full border border-blue-400/25 hover:border-sky-300/50 px-6 py-3 text-xs tracking-widest uppercase text-blue-50 font-inter hover:bg-blue-500/10 transition-all duration-500 flex items-center gap-2 cursor-pointer"
              style={{
                transitionDelay: `${navLinks.length * 80 + 100}ms`,
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
              }}
            >
              <GithubIcon className="w-4 h-4" />
              SIGN IN WITH GITHUB
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
