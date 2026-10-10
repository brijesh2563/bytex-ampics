import { useState } from 'react';
import { useSyncStore } from '../../store/useSyncStore';
import { hasAdminAccess } from '../../core/authAdapter';
import {
  Activity,
  Layers,
  GitFork,
  Sliders,
  History,
  ShieldCheck,
  Cpu,
  Sun,
  Moon,
  User,
  Zap,
  Radio,
  Server,
  LogOut,
  LogIn,
  UserPlus,
  Compass,
  Menu,
  X
} from 'lucide-react';

export function TopNav() {
  const {
    activePage,
    setActivePage,
    dialState,
    conflicts,
    replicaA,
    replicaB,
    theme,
    toggleTheme,
    user,
    logout,
    toggleReplicaOnline,
  } = useSyncStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const pendingOpsCount = (replicaA.pendingOps?.length || 0) + (replicaB.pendingOps?.length || 0);

  const navItems = [
    { id: 'observatory', label: 'Observatory', icon: Activity },
    { id: 'workspace', label: 'Workspace', icon: Layers, badge: pendingOpsCount > 0 ? `${pendingOpsCount}` : null },
    { id: 'conflicts', label: 'Conflicts', icon: GitFork, badge: conflicts.length > 0 ? `${conflicts.length}` : null, badgeVariant: 'ochre' },
    { id: 'history', label: 'History', icon: History },
    { id: 'timeline', label: 'Timeline', icon: Sliders },
    { id: 'lab', label: 'Lab', icon: Radio },
    { id: 'proofs', label: 'Proofs', icon: ShieldCheck },
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);
  };

  const handleSplitBrainSim = () => {
    toggleReplicaOnline('replicaB');
  };

  return (
    <header className="sticky top-0 z-50 w-full hairline-b bg-[var(--paper)]/95 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* BRAND & MONOGRAM */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('observatory')}
            className="flex items-baseline gap-2 group text-left cursor-pointer focus:outline-hidden"
            title="NexusSync Observatory"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--copper)] transition-transform group-hover:scale-125" />
            <span className="font-display text-2xl tracking-tight text-[var(--ink)] font-semibold">
              Nexus<span className="italic text-[var(--copper)]">Sync</span>
            </span>
          </button>

          <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded bg-[var(--paper-raised)] border border-[var(--border)] text-[var(--ink-faint)] font-mono text-[9px] uppercase tracking-widest select-none">
            EST. 2026 · CRDT INSTRUMENT
          </span>
        </div>

        {/* PRIMARY DESKTOP NAVIGATION TABS */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[var(--copper)] text-[var(--paper-raised)] font-bold shadow-xs'
                    : 'text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--paper-raised)]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[var(--paper-raised)]' : 'text-[var(--copper)]'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                      item.badgeVariant === 'ochre'
                        ? 'bg-[var(--ochre)] text-white'
                        : 'bg-[var(--paper)] text-[var(--ink)]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* STATUS TELEMETRY & CONTROLS */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Engine Convergence State Readout */}
          <button
            onClick={() => handleNavClick('status')}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] tracking-wider uppercase border cursor-pointer transition-all ${
              dialState === 'SYNCED'
                ? 'bg-[var(--verdigris)]/10 text-[var(--verdigris)] border-[var(--verdigris)]/30'
                : dialState === 'CONFLICT'
                ? 'bg-[var(--ochre)]/15 text-[var(--ochre)] border-[var(--ochre)]/40 animate-pulse'
                : 'bg-[var(--rust)]/10 text-[var(--rust)] border-[var(--rust)]/30'
            }`}
            title="View Real-Time System Status"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  dialState === 'SYNCED' ? 'bg-[var(--verdigris)]' : dialState === 'CONFLICT' ? 'bg-[var(--ochre)]' : 'bg-[var(--rust)]'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  dialState === 'SYNCED' ? 'bg-[var(--verdigris)]' : dialState === 'CONFLICT' ? 'bg-[var(--ochre)]' : 'bg-[var(--rust)]'
                }`}
              />
            </span>
            <span>
              {dialState === 'SYNCED' ? 'ENGINE: CONVERGED · v14' : dialState === 'CONFLICT' ? 'FORK: CONFLICT' : 'REPLICA: DIVERGING'}
            </span>
          </button>

          {/* Quick Action: Simulate Split-Brain */}
          <button
            onClick={handleSplitBrainSim}
            className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--paper-raised)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--ink-soft)] hover:text-[var(--ink)] font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer"
            title="Sever replica link to simulate network partition"
          >
            <Zap className="w-3 h-3 text-[var(--copper)]" />
            <span>Partition B</span>
          </button>

          {/* Theme Light / Dark Astrolabe Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md hover:bg-[var(--paper-raised)] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]"
            title={`Switch to ${theme === 'dark' ? 'Light Observatory' : 'Dark Astrolabe'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[var(--ochre)]" /> : <Moon className="w-4 h-4 text-[var(--copper)]" />}
          </button>

          {/* User / Operator Session Profile */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-8 h-8 rounded-full bg-[var(--copper)] text-[var(--paper-raised)] flex items-center justify-center font-mono text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              title={user ? `${user.name} (${user.role})` : 'Operator Login'}
            >
              {user ? (
                <span>{user.name.slice(0, 2).toUpperCase()}</span>
              ) : (
                <User className="w-4 h-4" />
              )}
            </button>

            {userMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-60 bg-[var(--paper-raised)] border border-[var(--border)] rounded-xl shadow-xl py-2 font-mono text-xs z-50 text-[var(--ink)] animate-in fade-in slide-in-from-top-2"
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                {user ? (
                  <>
                    <div className="px-3.5 py-2 border-b border-[var(--line)]">
                      <div className="font-bold text-[var(--ink)] truncate">{user.name}</div>
                      <div className="text-[10px] text-[var(--copper)] uppercase tracking-wider font-bold">{user.role}</div>
                      <div className="text-[9px] text-[var(--ink-faint)] mt-0.5 truncate font-mono">REPLICA: {user.replicaId || 'r_local'}</div>
                      <div className="text-[9px] text-[var(--verdigris)] font-bold mt-0.5">AUTH: LOCAL / DEMO</div>
                    </div>

                    {/* Admin Page: Only enabled for Tier-0 / Chief Operators */}
                    {hasAdminAccess(user) ? (
                      <button
                        onClick={() => { handleNavClick('admin'); setUserMenuOpen(false); }}
                        className="w-full text-left px-3.5 py-2 hover:bg-[var(--paper)] flex items-center justify-between text-[var(--ink-soft)] hover:text-[var(--ink)] cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Server className="w-3.5 h-3.5 text-[var(--copper)]" />
                          <span>Cluster Control</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[var(--copper)]/15 text-[var(--copper)] font-bold">ADMIN</span>
                      </button>
                    ) : (
                      <div
                        className="w-full text-left px-3.5 py-2 flex items-center justify-between text-[var(--ink-faint)] opacity-60 cursor-not-allowed select-none"
                        title="Requires Tier-0 Arbiter or Chief Operator role"
                      >
                        <div className="flex items-center gap-2">
                          <Server className="w-3.5 h-3.5" />
                          <span>Cluster Control</span>
                        </div>
                        <span className="text-[8px] px-1 rounded border border-[var(--border)]">LOCKED</span>
                      </div>
                    )}

                    <button
                      onClick={() => { handleNavClick('settings'); setUserMenuOpen(false); }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-[var(--paper)] flex items-center gap-2 text-[var(--ink-soft)] hover:text-[var(--ink)] cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[var(--copper)]" />
                      <span>Instrument Settings</span>
                    </button>
                    <button
                      onClick={() => { handleNavClick('motion-lab'); setUserMenuOpen(false); }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-[var(--paper)] flex items-center gap-2 text-[var(--ink-soft)] hover:text-[var(--ink)] cursor-pointer"
                    >
                      <Radio className="w-3.5 h-3.5 text-[var(--ochre)]" />
                      <span>Motion Lab (/dev)</span>
                    </button>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-[var(--paper)] flex items-center gap-2 text-[var(--rust)] cursor-pointer border-t border-[var(--line)] mt-1 font-bold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect Session</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-3.5 py-2 border-b border-[var(--line)]">
                      <div className="text-[10px] text-[var(--ink-faint)] uppercase tracking-wider font-bold">
                        UNAUTHENTICATED OPERATOR
                      </div>
                      <div className="text-[9px] text-[var(--ink-soft)] mt-0.5">
                        Local demo enclave active
                      </div>
                    </div>
                    <button
                      onClick={() => { handleNavClick('auth'); setUserMenuOpen(false); }}
                      className="w-full text-left px-3.5 py-2 hover:bg-[var(--paper)] flex items-center gap-2 text-[var(--copper)] font-bold cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5 text-[var(--copper)]" />
                      <span>Operator Access Gate</span>
                    </button>
                    <button
                      onClick={() => { handleNavClick('login'); setUserMenuOpen(false); }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-[var(--paper)] flex items-center gap-2 text-[var(--ink-soft)] hover:text-[var(--ink)] cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In (Login)</span>
                    </button>
                    <button
                      onClick={() => { handleNavClick('signup'); setUserMenuOpen(false); }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-[var(--paper)] flex items-center gap-2 text-[var(--ink-soft)] hover:text-[var(--ink)] cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Account (Signup)</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-md hover:bg-[var(--paper-raised)] text-[var(--ink)] cursor-pointer border border-[var(--border)]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE EXPANDED MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 bg-[var(--paper-raised)] hairline-b space-y-1 font-mono text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md ${
                  isActive
                    ? 'bg-[var(--copper)] text-[var(--paper-raised)] font-bold'
                    : 'text-[var(--ink)] hover:bg-[var(--paper)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-[var(--ochre)] text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-[var(--line)] flex flex-col gap-1">
            <button
              onClick={() => handleNavClick('status')}
              className="w-full text-left px-3 py-1.5 rounded text-[var(--ink-soft)] hover:bg-[var(--paper)] flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-[var(--verdigris)]" />
              <span>System Status</span>
            </button>
            {hasAdminAccess(user) && (
              <button
                onClick={() => handleNavClick('admin')}
                className="w-full text-left px-3 py-1.5 rounded text-[var(--ink-soft)] hover:bg-[var(--paper)] flex items-center gap-2"
              >
                <Server className="w-4 h-4 text-[var(--copper)]" />
                <span>Cluster Control Admin</span>
              </button>
            )}
            <button
              onClick={() => handleNavClick('auth')}
              className="w-full text-left px-3 py-1.5 rounded text-[var(--ink-soft)] hover:bg-[var(--paper)] flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-[var(--copper)]" />
              <span>Operator Gate</span>
            </button>
            <button
              onClick={() => handleNavClick('motion-lab')}
              className="w-full text-left px-3 py-1.5 rounded text-[var(--ink-soft)] hover:bg-[var(--paper)] flex items-center gap-2"
            >
              <Radio className="w-4 h-4 text-[var(--ochre)]" />
              <span>Motion Lab</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
