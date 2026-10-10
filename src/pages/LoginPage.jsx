import { useState } from 'react';
import { useSyncStore } from '../store/useSyncStore';
import { authenticateOperator, DEMO_OPERATORS } from '../core/authAdapter';
import { ScrambleText } from '../components/ui/ScrambleText';
import {
  Compass,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  HardDrive
} from 'lucide-react';

export function LoginPage() {
  const { login, setActivePage } = useSyncStore();

  const [operatorEmail, setOperatorEmail] = useState('aarav@nexussync.org');
  const [password, setPassword] = useState('causal-clock-2026');
  const [showPassword, setShowPassword] = useState(false);

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [sessionOpened, setSessionOpened] = useState(false);
  const [activeSessionData, setActiveSessionData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [shake, setShake] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(operatorEmail.trim());
  const isPasswordEntered = password.length > 0;

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!isEmailValid || !isPasswordEntered) {
      setErrorMessage('Please provide valid operator designation and secret.');
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    setErrorMessage(null);
    setIsAuthenticating(true);

    try {
      const res = await authenticateOperator(operatorEmail, password);

      if (res.success) {
        setIsAuthenticating(false);
        setActiveSessionData(res.operator);
        setSessionOpened(true);

        // Commit user session to Zustand store
        login(res.operator);

        // Targeted 1.4-2.0s precision entrance sequence before application transition
        setTimeout(() => {
          setActivePage('observatory');
        }, 1800);
      }
    } catch {
      setIsAuthenticating(false);
      setErrorMessage('Authentication handshake failed.');
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const handleQuickDemo = (profile) => {
    setOperatorEmail(profile.email);
    setPassword('causal-clock-2026');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] py-6 sm:py-10 w-full animate-mech-fade">
      <div className={`max-w-md w-full space-y-6 ${shake ? 'animate-mech-shake' : ''}`}>
        {/* 1. MASTHEAD & OBSERVATORY INSTRUMENT HEADER (0-800ms) */}
        <div className="text-center space-y-2 relative">
          <div className="inline-flex items-center justify-center relative w-14 h-14 rounded-full bg-[var(--paper-raised)] border border-[var(--border)] shadow-xs mb-1 animate-mech-rise delay-mech-2">
            <svg className="w-12 h-12 animate-spin text-[var(--copper)]" viewBox="0 0 100 100" style={{ animationDuration: '10s' }}>
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="14 10"
              />
            </svg>
            <Compass className="w-5 h-5 text-[var(--copper)] absolute animate-mech-needle delay-mech-4" />
          </div>

          <div className="flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[var(--copper)] font-bold animate-mech-rise-sm delay-mech-3">
            <span>OPERATOR ACCESS PORTAL</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--copper)]" />
            <ScrambleText text="CRYPTOGRAPHIC SESSION GATE" />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl text-[var(--ink)] tracking-tight animate-mech-rise delay-mech-5">
            Authenticate Operator
          </h1>

          <p className="font-newsreader text-sm sm:text-base text-[var(--ink-soft)] max-w-sm mx-auto leading-relaxed animate-mech-rise delay-mech-6">
            Authorize local replica session to engrave state modifications into the immutable causal journal.
          </p>

          <div className="w-24 h-0.5 bg-[var(--copper)] mx-auto animate-mech-line delay-mech-4" />
        </div>

        {/* 2. PRECISION SESSION OPENED PLATE (If Logged In) */}
        {sessionOpened && activeSessionData ? (
          <div className="bg-[var(--paper-raised)] border-2 border-[var(--copper)] rounded-2xl p-6 sm:p-8 shadow-md space-y-6 animate-mech-plate relative overflow-hidden">
            {/* Engraved Top Copper Calibration Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--copper)] animate-mech-line" />

            <div className="text-center space-y-4 font-mono">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                {/* Miniature Dial Calibrating */}
                <svg className="w-16 h-16 animate-spin text-[var(--verdigris)]" viewBox="0 0 100 100" style={{ animationDuration: '3s' }}>
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeDasharray="20 10"
                  />
                </svg>
                <CheckCircle2 className="w-8 h-8 text-[var(--verdigris)] absolute" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-[var(--copper)] font-bold block">
                  CALIBRATION VERIFIED · 0.04ms
                </span>
                <h2 className="font-display text-2xl text-[var(--ink)]">
                  Session Opened
                </h2>
              </div>

              {/* Truthful Operator Data Plate */}
              <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--border)] text-left text-xs space-y-2">
                <div className="flex justify-between items-center border-b border-[var(--line)] pb-2">
                  <span className="text-[var(--ink-faint)]">OPERATOR:</span>
                  <span className="font-bold text-[var(--ink)]">{activeSessionData.name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[var(--line)] pb-2">
                  <span className="text-[var(--ink-faint)]">ROLE:</span>
                  <span className="text-[var(--copper)] font-bold">{activeSessionData.role}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[var(--line)] pb-2">
                  <span className="text-[var(--ink-faint)]">REPLICA ID:</span>
                  <span className="font-mono text-[var(--ink)]">{activeSessionData.replicaId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--ink-faint)]">STATUS:</span>
                  <span className="text-[var(--verdigris)] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--verdigris)] animate-ping" />
                    READY · CONVERGED
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setActivePage('observatory')}
                  className="w-full py-2.5 rounded-lg bg-[var(--copper)] text-[var(--paper-raised)] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[var(--copper-deep)] transition cursor-pointer"
                >
                  Enter Application Now (Skip)
                </button>
                <span className="text-[10px] text-[var(--ink-faint)]">
                  Automatic transition to Observatory in progress...
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* 3. LOGIN INSTRUMENT CARD (1300-2450ms) */
          <div className="bg-[var(--paper-raised)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 relative animate-mech-rise delay-mech-7">
            {/* Registration Crosses */}
            <div className="absolute top-2.5 left-2.5 text-[var(--border)] font-mono text-xs select-none">+</div>
            <div className="absolute top-2.5 right-2.5 text-[var(--border)] font-mono text-xs select-none">+</div>
            <div className="absolute bottom-2.5 left-2.5 text-[var(--border)] font-mono text-xs select-none">+</div>
            <div className="absolute bottom-2.5 right-2.5 text-[var(--border)] font-mono text-xs select-none">+</div>

            {/* Truthful Telemetry Strip (Replaced fake hardware key slot) */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[var(--paper)] border border-[var(--line)] font-mono text-[10px]">
              <div>
                <span className="text-[var(--ink-faint)] block">ACCESS MODE:</span>
                <span className="text-[var(--copper)] font-bold">LOCAL / DEMO</span>
              </div>
              <div className="text-right">
                <span className="text-[var(--ink-faint)] block">SESSION TYPE:</span>
                <span className="text-[var(--verdigris)] font-bold">LOCAL OPERATOR</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-[var(--rust)]/10 border border-[var(--rust)]/30 text-[var(--rust)] font-mono text-xs flex items-center gap-2">
                <span>⚠ {errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
              {/* Field 1: OPERATOR EMAIL / DESIGNATION */}
              <div className="space-y-1 animate-mech-rise-sm delay-mech-8">
                <div className="flex justify-between items-baseline">
                  <label className="text-[10px] uppercase text-[var(--ink-faint)] tracking-wider font-bold">
                    Operator Designation (Email)
                  </label>
                  {operatorEmail && (
                    <span className={`text-[9px] ${isEmailValid ? 'text-[var(--verdigris)]' : 'text-[var(--rust)]'}`}>
                      {isEmailValid ? '✓ VALID DESIGNATION' : '⚠ INVALID FORMAT'}
                    </span>
                  )}
                </div>
                <div className="engineered-input-wrapper relative flex items-center">
                  <User className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={operatorEmail}
                    onChange={(e) => setOperatorEmail(e.target.value)}
                    className="engineered-input w-full pl-9 pr-3 py-2.5 rounded-lg bg-[var(--paper)] border border-[var(--border)] text-[var(--ink)] focus:outline-hidden transition-colors"
                    placeholder="operator@nexussync.org"
                  />
                  <div className="engineered-input-baseline" />
                </div>
              </div>

              {/* Field 2: PASSPHRASE */}
              <div className="space-y-1 animate-mech-rise-sm delay-mech-9">
                <div className="flex justify-between items-baseline">
                  <label className="text-[10px] uppercase text-[var(--ink-faint)] tracking-wider font-bold">
                    Passphrase / Master Secret
                  </label>
                  {password && (
                    <span className="text-[9px] text-[var(--verdigris)]">
                      ✓ SECRET ENTERED
                    </span>
                  )}
                </div>
                <div className="engineered-input-wrapper relative flex items-center">
                  <Lock className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="engineered-input w-full pl-9 pr-10 py-2.5 rounded-lg bg-[var(--paper)] border border-[var(--border)] text-[var(--ink)] focus:outline-hidden transition-colors"
                    placeholder="Enter passkey"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1 text-[var(--ink-faint)] hover:text-[var(--copper)] transition cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <div className="engineered-input-baseline" />
                </div>
              </div>

              {/* Truthful Enclave Micro-Notice */}
              <div className="flex items-center gap-2 text-[10px] text-[var(--ink-faint)] pt-1">
                <HardDrive className="w-3.5 h-3.5 text-[var(--copper)] shrink-0" />
                <span>
                  Client-side evaluation. Zero telemetry leakage outside local enclave.
                </span>
              </div>

              {/* PRIMARY ACTION BUTTON */}
              <div className="pt-2 animate-mech-rise-sm delay-mech-10">
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className={`w-full py-3 px-4 rounded-xl text-[var(--paper-raised)] font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:translate-y-[1px] ${
                    isAuthenticating
                      ? 'btn-loading-trace text-[var(--paper-raised)] cursor-wait'
                      : 'bg-[var(--copper)] hover:bg-[var(--copper-deep)]'
                  }`}
                >
                  {isAuthenticating ? (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--paper-raised)] animate-ping" />
                      <span>AUTHENTICATING...</span>
                    </div>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>AUTHENTICATE &amp; OPEN SESSION</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* DEMO OPERATORS SELECTOR (Truthfully Labeled) */}
            <div className="pt-4 border-t border-[var(--line)] space-y-2 animate-mech-rise-sm delay-mech-11">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-faint)] block text-center font-bold">
                DEMO OPERATORS (PRE-CONFIGURED)
              </span>
              <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                {DEMO_OPERATORS.map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => handleQuickDemo(op)}
                    className="p-2 rounded-lg bg-[var(--paper)] hover:border-[var(--copper)] border border-[var(--border)] text-left cursor-pointer transition-colors"
                  >
                    <div className="font-bold text-[var(--copper)] truncate">{op.name}</div>
                    <div className="text-[9px] text-[var(--ink-faint)] truncate">{op.role}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* SECONDARY NAVIGATION */}
            <div className="pt-3 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
              <span className="text-[var(--ink-faint)] text-[11px]">
                New station operator?
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActivePage('signup')}
                  className="text-[var(--copper)] hover:text-[var(--copper-deep)] font-bold hover:underline cursor-pointer"
                >
                  CREATE ACCOUNT
                </button>
                <span className="text-[var(--border)]">|</span>
                <button
                  type="button"
                  onClick={() => setActivePage('auth')}
                  className="text-[var(--ink-soft)] hover:text-[var(--ink)] cursor-pointer"
                >
                  Access Gate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
