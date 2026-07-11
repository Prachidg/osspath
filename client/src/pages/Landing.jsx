import { ArrowRight, ArrowUpRight, Brain, GitBranch, GitPullRequest, Sparkles, Target, TrendingUp, Zap } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const stats = [
  { value: '10K+', label: 'Issues Indexed' },
  { value: '94%', label: 'Match Accuracy' },
  { value: '384', label: 'Vector Dimensions' },
];

const features = [
  {
    icon: Brain,
    title: 'Semantic Matching',
    description:
      'Your commits and PRs are embedded into the same 384-dimensional vector space as open-source issues. No keyword matching — pure semantic understanding.',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    iconBg: 'from-cyan-500/20 to-cyan-400/10',
  },
  {
    icon: TrendingUp,
    title: 'Difficulty Calibration',
    description:
      'Complete an issue? Your score adjusts. Abandon one? It recalibrates. The system learns your growth trajectory across every language.',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    iconBg: 'from-blue-500/20 to-blue-400/10',
  },
  {
    icon: Zap,
    title: 'Live Freshness',
    description:
      'GitHub webhooks trigger instant re-ranking. Issues are re-scored the moment they are assigned, labeled, or closed upstream.',
    gradient: 'from-indigo-500/20 to-violet-500/20',
    iconBg: 'from-indigo-500/20 to-indigo-400/10',
  },
];

const steps = [
  {
    number: '01',
    title: 'Connect GitHub',
    description:
      'Sign in with your GitHub account. We analyze your public contributions, PRs, and commit history.',
  },
  {
    number: '02',
    title: 'Build Skill Profile',
    description:
      'Our ML pipeline embeds your work into a 384-dimensional skill vector, mapping your expertise.',
  },
  {
    number: '03',
    title: 'Get Matched',
    description:
      'Receive personalized issue recommendations ranked by semantic similarity to your skills.',
  },
];

export default function Landing() {
  const { login } = useAuth();

  return (
    <div className="w-full bg-black text-white overflow-hidden">
      {/* ═══════ Ambient Background ═══════ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/[0.07] rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/[0.06] rounded-full blur-[120px] animate-float-delayed" />
        <div className="absolute top-[40%] right-[15%] w-[350px] h-[350px] bg-indigo-500/[0.04] rounded-full blur-[100px] animate-float-slow" />
      </div>

      {/* ═══════ Hero Section ═══════ */}
      <section className="relative min-h-screen flex items-center">
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.025)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative z-10 w-full mx-auto" style={{ maxWidth: '1200px', paddingLeft: '6%', paddingRight: '6%', paddingTop: '180px', paddingBottom: '100px' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center" style={{ gap: '80px' }}>
            {/* ── Left Content ── */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/[0.06] animate-fade-up" style={{ marginBottom: '40px' }}>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-300/90 text-xs font-inter tracking-wider uppercase">
                  AI-Powered Open Source Navigator
                </span>
              </div>

              {/* Heading */}
              <h1
                className="font-podium text-white uppercase leading-[0.92] tracking-tight animate-fade-up-delay-1"
                style={{ fontSize: 'clamp(2.8rem, 5.5vw, 5.2rem)' }}
              >
                Find Your
                <br />
                <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-400 bg-clip-text text-transparent">
                  Perfect Issue
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-blue-100/55 text-base sm:text-lg font-inter leading-relaxed max-w-lg animate-fade-up-delay-2" style={{ marginTop: '32px' }}>
                We match your exact skill vector to open-source issues using ML
                embeddings — no keyword guessing,{' '}
                <span className="text-cyan-300 font-medium">
                  pure semantic understanding.
                </span>
              </p>

              {/* CTA Row */}
              <div className="flex flex-wrap items-center gap-5 animate-fade-up-delay-3" style={{ marginTop: '48px' }}>
                <button
                  onClick={login}
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-cyan-400 to-sky-500 text-black px-8 py-4 rounded-xl text-sm tracking-wider uppercase font-inter font-semibold transition-all duration-300 hover:shadow-[0_0_40px_rgba(56,189,248,0.3)] cursor-pointer"
                >
                  <FaGithub className="w-[18px] h-[18px]" />
                  Start Your Journey
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 text-blue-200/55 hover:text-cyan-300 text-sm font-inter transition-colors px-4 py-4"
                >
                  See How It Works
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

              {/* Stats */}
              <div className="flex animate-fade-up-delay-4" style={{ marginTop: '64px', gap: '60px' }}>
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="font-podium text-3xl sm:text-4xl text-white tracking-tight">
                      {stat.value}
                    </p>
                    <p className="text-blue-200/35 text-[11px] tracking-widest uppercase mt-1.5 font-inter">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right — Dashboard Preview Card ── */}
            <div className="hidden lg:block animate-fade-up-delay-2">
              <div className="relative">
                {/* Glow behind card */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-3xl blur-2xl scale-110" />

                {/* Main card */}
                <div className="relative bg-[#0a0f1a]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-7 shadow-2xl">
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-sky-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <Target className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-inter font-medium">
                          Top Match Found
                        </p>
                        <p className="text-blue-200/35 text-xs font-inter mt-0.5">
                          Just now
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-emerald-400 text-xs font-inter font-medium">
                        92% Match
                      </span>
                    </div>
                  </div>

                  {/* Mock issue card */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <GitPullRequest className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-white text-sm font-inter font-medium leading-snug">
                          Add WebSocket support for real-time notifications
                        </p>
                        <p className="text-blue-200/35 text-xs font-inter mt-2">
                          vercel/next.js · ★ 124k
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 ml-7">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/15 text-cyan-300/70 text-[10px] font-inter">
                        TypeScript
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/15 text-blue-300/70 text-[10px] font-inter">
                        WebSocket
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-emerald-300/70 text-[10px] font-inter">
                        good first issue
                      </span>
                    </div>
                  </div>

                  {/* Skill alignment bars */}
                  <div className="mt-6 space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-blue-200/45 text-xs font-inter">
                          Skill Alignment
                        </span>
                        <span className="text-cyan-400 text-xs font-inter font-medium">
                          92%
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full w-[92%] bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-blue-200/45 text-xs font-inter">
                          Difficulty Fit
                        </span>
                        <span className="text-blue-400 text-xs font-inter font-medium">
                          87%
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full w-[87%] bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating accent badge */}
                <div className="absolute -right-3 -bottom-3 bg-[#0c1220]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl px-4 py-3 shadow-xl animate-float-slow">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-white/80 text-xs font-inter">
                      3 repos analyzed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black to-transparent" />
      </section>

      {/* ═══════ Spacer ═══════ */}
      <div style={{ height: '120px' }} aria-hidden="true" />

      {/* ═══════ How It Works ═══════ */}
      <section id="how-it-works" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingLeft: '6%', paddingRight: '6%' }}>
          {/* Section header */}
          <div className="text-center" style={{ marginBottom: '80px' }}>
            <span className="text-cyan-400/70 text-xs tracking-[0.3em] uppercase font-inter">
              How It Works
            </span>
            <h2 className="font-podium text-4xl sm:text-5xl lg:text-6xl text-white uppercase mt-4 tracking-tight leading-[0.95]">
              Three Steps to Your
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
                First Contribution
              </span>
            </h2>
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '40px' }}>
            {steps.map((step, idx) => (
              <div
                key={step.number}
                className="group bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:border-cyan-500/20 hover:bg-white/[0.04] transition-all duration-500 animate-fade-up"
                style={{ padding: '48px', animationDelay: `${idx * 0.15}s` }}
              >
                <span className="font-podium text-5xl lg:text-6xl bg-gradient-to-b from-cyan-400/25 to-transparent bg-clip-text text-transparent leading-none">
                  {step.number}
                </span>
                <h3 className="font-podium text-2xl text-white uppercase tracking-wide" style={{ marginTop: '24px' }}>
                  {step.title}
                </h3>
                <p className="text-blue-200/45 text-sm font-inter leading-relaxed" style={{ marginTop: '16px' }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ Spacer with divider ═══════ */}
      <div style={{ height: '160px', display: 'flex', alignItems: 'center' }} aria-hidden="true">
        <div style={{ height: '1px', width: '100%', maxWidth: '1200px', margin: '0 auto', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
      </div>

      {/* ═══════ Features ═══════ */}
      <section style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingLeft: '6%', paddingRight: '6%' }}>
          {/* Section header */}
          <div style={{ marginBottom: '80px' }}>
            <span className="text-cyan-400/70 text-xs tracking-[0.3em] uppercase font-inter">
              Under The Hood
            </span>
            <h2 className="font-podium text-4xl sm:text-5xl lg:text-6xl text-white uppercase mt-4 tracking-tight leading-[0.95]">
              Contribution
              <br />
              Evolved
            </h2>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '40px' }}>
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:border-cyan-500/20 transition-all duration-500 animate-fade-up"
                  style={{ padding: '44px', animationDelay: `${idx * 0.15}s` }}
                >
                  {/* Hover gradient overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                  />

                  <div className="relative">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.iconBg} border border-white/[0.08] flex items-center justify-center`}
                      style={{ marginBottom: '32px' }}
                    >
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>

                    <h3 className="font-podium text-2xl lg:text-[1.7rem] text-white uppercase tracking-wide">
                      {feature.title}
                    </h3>
                    <p className="text-blue-200/45 text-sm font-inter leading-relaxed" style={{ marginTop: '20px' }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ Spacer with divider ═══════ */}
      <div style={{ height: '160px', display: 'flex', alignItems: 'center' }} aria-hidden="true">
        <div style={{ height: '1px', width: '100%', maxWidth: '1200px', margin: '0 auto', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
      </div>

      {/* ═══════ Final CTA ═══════ */}
      <section className="relative" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/[0.04] via-transparent to-transparent pointer-events-none" />

        <div className="relative text-center" style={{ maxWidth: '1200px', margin: '0 auto', paddingLeft: '6%', paddingRight: '6%' }}>
          <h2 className="font-podium text-4xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight leading-[0.95]">
            Ready to Find Your
            <br />
            <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
              Next Contribution?
            </span>
          </h2>
          <p className="text-blue-200/45 text-base font-inter max-w-lg mx-auto leading-relaxed" style={{ marginTop: '32px' }}>
            Connect your GitHub, let our ML pipeline analyze your skills, and
            start receiving personalized issue matches within seconds.
          </p>
          <button
            onClick={login}
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-cyan-400 to-sky-500 text-black px-10 py-5 rounded-xl text-sm tracking-wider uppercase font-inter font-semibold transition-all duration-300 hover:shadow-[0_0_50px_rgba(56,189,248,0.35)] cursor-pointer"
            style={{ marginTop: '48px' }}
          >
            <FaGithub className="w-5 h-5" />
            Get Started Free
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* ═══════ Spacer ═══════ */}
      <div style={{ height: '60px' }} aria-hidden="true" />

      {/* ═══════ Footer ═══════ */}
      <footer className="relative" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div style={{ height: '1px', position: 'absolute', top: 0, left: '6%', right: '6%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4" style={{ maxWidth: '1200px', margin: '0 auto', paddingLeft: '6%', paddingRight: '6%' }}>
          <span className="font-podium text-white/80 text-lg uppercase tracking-wider">
            OSSPath
          </span>
          <p className="text-blue-200/25 text-sm font-inter">
            Built with ML · Open Source
          </p>
        </div>
      </footer>
    </div>
  );
}

