import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import ReadinessGauge from '../components/ReadinessGauge';
import IssueCard from '../components/IssueCard';
import SkillRadar from '../components/SkillRadar';
import ActivityHeatmap from '../components/ActivityHeatmap';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Dashboard = () => {
  const { user, loading: authLoading, login } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [readinessScore, setReadinessScore] = useState(0);

  const displayName = user?.username || 'EXPLORER';
  const skills = useMemo(
    () =>
      (user?.skills || []).slice(0, 5).map((skill, index) => ({
        name: skill,
        level: Math.max(42, 92 - index * 9),
      })),
    [user]
  );

  useEffect(() => {
    setReadinessScore(user?.readinessScore || 0);
  }, [user]);

  const loadRecommendations = async ({ refresh = false } = {}) => {
    if (!user) return;

    setError('');
    refresh ? setRefreshing(true) : setLoading(true);

    try {
      const endpoint = refresh ? '/recommendations/refresh' : '/recommendations';
      const response = refresh ? await api.post(endpoint) : await api.get(endpoint);
      setRecommendations(response.data.recommendations || []);
      setReadinessScore(response.data.readinessScore || 0);
    } catch {
      setError('Unable to load recommendations. Refresh your GitHub profile and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadRecommendations();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, user]);

  const handleProfileRefresh = async () => {
    setRefreshing(true);
    setError('');

    try {
      await api.get('/github/repos');
      await loadRecommendations({ refresh: true });
    } catch {
      setError('GitHub profile sync failed. Please try again in a moment.');
      setRefreshing(false);
    }
  };

  const recordAttempt = async (issueId) => {
    if (!issueId) return;

    try {
      await api.post('/recommendations/interactions', {
        issueId,
        status: 'attempted',
      });
    } catch {
      // Recommendation links should still open even if feedback capture fails.
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center" style={{ paddingTop: '160px', paddingLeft: '6%', paddingRight: '6%', paddingBottom: '96px' }}>
        <div className="w-full max-w-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl shadow-2xl rounded-2xl text-center" style={{ padding: '40px' }}>
          <FaGithub className="w-10 h-10 text-cyan-400 mx-auto" style={{ marginBottom: '24px' }} />
          <h1 className="font-podium text-4xl text-white uppercase leading-none">
            Connect GitHub
          </h1>
          <p className="text-sm text-white/50 font-inter leading-6" style={{ marginTop: '20px' }}>
            OSSPath needs your public contribution history to build a skill profile and recommend issues.
          </p>
          <button
            type="button"
            onClick={login}
            className="inline-flex items-center bg-gradient-to-r from-cyan-400 to-sky-500 text-black rounded-xl text-sm font-semibold font-inter hover:opacity-90 transition-opacity"
            style={{ marginTop: '32px', gap: '8px', padding: '10px 20px' }}
          >
            <FaGithub className="w-4 h-4" />
            Continue with GitHub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black" style={{ paddingTop: '140px', paddingLeft: '6%', paddingRight: '6%', paddingBottom: '96px' }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      {/* ═══════ Welcome Banner ═══════ */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between animate-fade-up" style={{ padding: '40px 44px', gap: '32px' }}>
        <div>
          <p className="text-sm tracking-[0.25em] text-white/40 uppercase font-inter">
            Welcome back,
          </p>
          <h1 className="font-podium text-5xl sm:text-6xl text-white uppercase leading-none" style={{ marginTop: '12px' }}>
            {displayName}
          </h1>
          <p className="text-sm text-white/45 font-inter max-w-xl leading-6" style={{ marginTop: '16px' }}>
            Your next contribution path is being tuned from GitHub activity.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center w-full lg:w-auto" style={{ gap: '24px' }}>
          <button
            type="button"
            onClick={handleProfileRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center border border-white/[0.08] bg-white/[0.04] hover:border-cyan-500/20 rounded-xl text-sm text-white/60 hover:text-white/80 disabled:opacity-50 transition-colors font-inter w-full sm:w-auto"
            style={{ gap: '8px', padding: '12px 20px' }}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Profile
          </button>
          <ReadinessGauge score={readinessScore} />
        </div>
      </div>

      {/* ═══════ Two-Column Layout ═══════ */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_400px]" style={{ gap: '48px', marginTop: '60px' }}>
        {/* Left Column — Top Matches */}
        <div className="animate-fade-up-delay-1">
          <h2 className="font-podium text-3xl text-white uppercase tracking-wider" style={{ marginBottom: '28px' }}>
            Top Matches
          </h2>
          {error && (
            <div className="bg-red-500/[0.06] border border-red-500/15 rounded-xl text-sm text-red-200 font-inter" style={{ padding: '16px', marginBottom: '24px' }}>
              {error}
            </div>
          )}
          {loading ? (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl text-sm text-white/45 font-inter" style={{ padding: '32px' }}>
              Loading contribution matches...
            </div>
          ) : recommendations.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {recommendations.map((issue, i) => (
                <div key={issue.id} className={i > 0 ? `animate-fade-up-delay-${Math.min(i, 4)}` : ''}>
                  <IssueCard
                    issue={{
                      ...issue,
                      onAttempt: () => recordAttempt(issue.issueId),
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl" style={{ padding: '32px' }}>
              <p className="text-sm text-white/50 font-inter leading-6">
                No matches yet. Refresh your GitHub profile to generate your first recommendation set.
              </p>
            </div>
          )}
        </div>

        {/* Right Column — Skills */}
        <div className="animate-fade-up-delay-2">
          <h2 className="font-podium text-3xl text-white uppercase tracking-wider" style={{ marginBottom: '28px' }}>
            Your Skills
          </h2>
          {skills.length ? (
            <SkillRadar skills={skills} />
          ) : (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl text-sm text-white/45 font-inter" style={{ padding: '32px' }}>
              Sync GitHub to build your skill map.
            </div>
          )}
        </div>
      </div>

      {/* ═══════ Activity Heatmap ═══════ */}
      <div className="animate-fade-up-delay-3" style={{ marginTop: '80px' }}>
        <h2 className="font-podium text-3xl text-white uppercase tracking-wider" style={{ marginBottom: '28px' }}>
          Activity
        </h2>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl backdrop-blur-sm" style={{ padding: '28px' }}>
          <ActivityHeatmap />
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
