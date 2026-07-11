import { useAuth } from '../context/AuthContext';
import { LogOut, ExternalLink } from 'lucide-react';

const getStats = (user) => [
  { value: String(user?.githubStats?.repoCount || 0), label: 'Repos Analyzed' },
  { value: String(user?.skills?.length || 0), label: 'Skills Detected' },
  { value: String(user?.readinessScore || 0), label: 'Readiness Score' },
];

export default function Profile() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="font-podium text-white text-2xl uppercase tracking-wider animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="font-inter text-blue-200/50 text-sm">
          Please sign in to view your profile.
        </p>
      </div>
    );
  }

  const username = user.username || user.login;
  const avatar = user.avatar_url || user.avatarUrl;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center" style={{ paddingTop: '160px', paddingBottom: '100px', paddingLeft: '6%', paddingRight: '6%' }}>
      {/* Profile Card */}
      <div
        className="bg-white/[0.02] border border-white/[0.06] rounded-2xl backdrop-blur-sm w-full animate-fade-up"
        style={{ maxWidth: '480px', padding: '56px 48px', textAlign: 'center' }}
      >
        {/* Avatar */}
        <img
          src={avatar}
          alt={username}
          className="rounded-full border-2 border-cyan-400/30 mx-auto"
          style={{ width: '120px', height: '120px', boxShadow: '0 0 30px rgba(56, 189, 248, 0.15)' }}
        />

        {/* Username */}
        <h1 className="font-podium text-5xl text-white uppercase" style={{ marginTop: '24px' }}>
          {username}
        </h1>

        {/* GitHub Link */}
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-cyan-400/70 hover:text-cyan-300 text-sm font-inter transition-colors"
          style={{ marginTop: '12px' }}
        >
          github.com/{username}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap justify-center animate-fade-up-delay-1" style={{ marginTop: '48px', gap: '20px' }}>
        {getStats(user).map((stat) => (
          <div
            key={stat.label}
            className="text-center bg-white/[0.02] border border-white/[0.06] rounded-2xl"
            style={{ padding: '28px 36px', minWidth: '170px' }}
          >
            <p className="font-inter text-cyan-400 text-3xl sm:text-4xl font-bold tracking-tight">
              {stat.value}
            </p>
            <p className="text-blue-200/40 text-xs tracking-widest uppercase" style={{ marginTop: '8px' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Sign Out */}
      <button
        onClick={logout}
        className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] text-red-400/70 hover:text-red-300 hover:border-red-500/20 hover:bg-red-500/[0.06] text-xs tracking-widest uppercase font-inter transition-all cursor-pointer animate-fade-up-delay-2"
        style={{ marginTop: '48px', padding: '12px 32px' }}
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}
