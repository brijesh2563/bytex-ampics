import { useState } from 'react';
import { useSyncStore } from '../store/useSyncStore';
import { registerOperator } from '../core/authAdapter';
import { ScrambleText } from '../components/ui/ScrambleText';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Compass,
  ArrowRight,
  HardDrive
} from 'lucide-react';

export function SignupPage() {
  const { signup, setActivePage } = useSyncStore();

  const [operatorName, setOperatorName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isInitializing, setIsInitializing] = useState(false);
  const [hasError, setHasError] = useState(null);
  const [shake, setShake] = useState(false);

  // Success sequence state: null | 'INITIALIZED' | 'READY'
  const [successStep, setSuccessStep] = useState(null);
  const [createdSession, setCreatedSession] = useState(null);

  // Field validation flags
  const isNameValid = operatorName.trim().length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isConfirmValid = confirmPassword.length >= 6 && confirmPassword === password;

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmValid) {
      setHasError('Please ensure all specifications are valid and passkeys match.');
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    setHasError(null);
    setIsInitializing(true);

    try {
      const res = await registerOperator({
        name: operatorName,
        email,
        password,
      });

      if (res.success) {
        setIsInitializing(false);
        setCreatedSession(res.operator);
        setSuccessStep('INITIALIZED');

        // Sequence: INITIALIZED -> SESSION READY -> Curtain Transition
        setTimeout(() => {
          setSuccessStep('READY');
          // Commit to store
          signup(res.operator);

          // Transition to observatory
          setTimeout(() => {
            setActivePage('observatory');
          }, 1400);
        }, 1100);
      }
    } catch {
      setIsInitializing(false);
      setHasError('Cryptographic initialization error. Try again.');
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] py-6 sm:py-10 w-full animate-mech-fade">
      <div className={`max-w-xl w-full space-y-6 ${shake ? 'animate-mech-shake' : ''}`}>
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
            <span>REGISTRATION MATRIX</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--copper)]" />
            <ScrambleText text="DERIVE REPLICA VECTOR" />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl text-[var(--ink)] tracking-tight animate-mech-rise delay-mech-5">
            Create Operator Account
          </h1>

          <p className="font-newsreader text-sm sm:text-base text-[var(--ink-soft)] max-w-md mx-auto leading-relaxed animate-mech-rise delay-mech-6">
            Derive a local causal replica vector in IndexedDB. No centralized coordinator required.
          </p>

          <div className="w-24 h-0.5 bg-[var(--copper)] mx-auto animate-mech-line delay-mech-4" />
        </div>

        {/* 2. SUCCESS SEQUENCE CONTAINER (If Registered) */}
        {successStep ? (
          <div className="bg-[var(--paper-raised)] border-2 border-[var(--copper)] rounded-2xl p-6 sm:p-8 shadow-md space-y-6 animate-mech-plate">
            <div className="text-center space-y-3 font-mono">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--verdigris)]/15 border border-[var(--verdigris)]/40 text-[var(--verdigris)]">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-[var(--copper)] font-bold block">
                  {successStep === 'INITIALIZED' ? 'STAGE 01 // LOCAL VECTOR DERIVED' : 'STAGE 02 // REPLICA ATTACHED'}
                </span>
                <h2 className="font-display text-2xl text-[var(--ink)]">
                  {successStep === 'INITIALIZED' ? 'Operator Initialized' : 'Session Ready'}
                </h2>
              </div>

              {createdSession && (
                <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--border)] text-left text-xs space-y-2">
                  <div className="flex justify-between items-center border-b border-[var(--line)] pb-2">
                    <span className="text-[var(--ink-faint)]">OPERATOR:</span>
                    <span className="font-bold text-[var(--ink)]">{createdSession.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[var(--line)] pb-2">
                    <span className="text-[var(--ink-faint)]">ASSIGNED REPLICA:</span>
                    <span className="font-mono text-[var(--copper)] font-bold">{createdSession.replicaId}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[var(--line)] pb-2">
                    <span className="text-[var(--ink-faint)]">AUTH MODE:</span>
                    <span className="text-[var(--verdigris)] font-bold">{createdSession.authMode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--ink-faint)]">SESSION TYPE:</span>
                    <span className="font-bold text-[var(--ink)]">{createdSession.sessionType}</span>
                  </div>
                </div>
              )}

              <p className="font-newsreader text-sm text-[var(--ink-soft)] italic pt-2">
                "Replica created: {createdSession?.replicaId}. Nothing is lost yet, so start working."
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActivePage('observatory')}
                  className="w-full py-2.5 rounded-lg bg-[var(--copper)] text-[var(--paper-raised)] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[var(--copper-deep)] transition cursor-pointer"
                >
                  Enter Observatory Now
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 3. SIGNUP INSTRUMENT CARD (1300-2450ms) */
          <div className="bg-[var(--paper-raised)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 relative animate-mech-rise delay-mech-7">
            {/* Corner Registration Crosses */}
            <div className="absolute top-2.5 left-2.5 text-[var(--border)] font-mono text-xs select-none">+</div>
            <div className="absolute top-2.5 right-2.5 text-[var(--border)] font-mono text-xs select-none">+</div>
            <div className="absolute bottom-2.5 left-2.5 text-[var(--border)] font-mono text-xs select-none">+</div>
            <div className="absolute bottom-2.5 right-2.5 text-[var(--border)] font-mono text-xs select-none">+</div>

            {/* Truthful Telemetry Badge Strip (Replaces fake hardware key) */}
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

            {hasError && (
              <div className="p-3 rounded-lg bg-[var(--rust)]/10 border border-[var(--rust)]/30 text-[var(--rust)] font-mono text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{hasError}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4 font-mono text-xs">
              {/* Field 1: OPERATOR NAME */}
              <div className="space-y-1 animate-mech-rise-sm delay-mech-8">
                <div className="flex justify-between items-baseline">
                  <label className="text-[10px] uppercase text-[var(--ink-faint)] tracking-wider font-bold">
                    Operator Name
                  </label>
                  {operatorName && (
                    <span className={`text-[9px] ${isNameValid ? 'text-[var(--verdigris)]' : 'text-[var(--rust)]'}`}>
                      {isNameValid ? '✓ VALID FORMAT' : '⚠ MIN 2 CHARACTERS'}
                    </span>
                  )}
                </div>
                <div className="engineered-input-wrapper relative flex items-center">
                  <User className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className="engineered-input w-full pl-9 pr-3 py-2.5 rounded-lg bg-[var(--paper)] border border-[var(--border)] text-[var(--ink)] focus:outline-hidden transition-colors"
                    placeholder="e.g. Elena Rostova"
                  />
                  <div className="engineered-input-baseline" />
                </div>
              </div>

              {/* Field 2: EMAIL */}
              <div className="space-y-1 animate-mech-rise-sm delay-mech-9">
                <div className="flex justify-between items-baseline">
                  <label className="text-[10px] uppercase text-[var(--ink-faint)] tracking-wider font-bold">
                    Email / Station Call-Sign
                  </label>
                  {email && (
                    <span className={`text-[9px] ${isEmailValid ? 'text-[var(--verdigris)]' : 'text-[var(--rust)]'}`}>
                      {isEmailValid ? '✓ VALID ADDRESS' : '⚠ INVALID EMAIL'}
                    </span>
                  )}
                </div>
                <div className="engineered-input-wrapper relative flex items-center">
                  <Mail className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="engineered-input w-full pl-9 pr-3 py-2.5 rounded-lg bg-[var(--paper)] border border-[var(--border)] text-[var(--ink)] focus:outline-hidden transition-colors"
                    placeholder="elena@nexussync.org"
                  />
                  <div className="engineered-input-baseline" />
                </div>
              </div>

              {/* Field 3: PASSWORD */}
              <div className="space-y-1 animate-mech-rise-sm delay-mech-10">
                <div className="flex justify-between items-baseline">
                  <label className="text-[10px] uppercase text-[var(--ink-faint)] tracking-wider font-bold">
                    Master Password / Passphrase
                  </label>
                  {password && (
                    <span className={`text-[9px] ${isPasswordValid ? 'text-[var(--verdigris)]' : 'text-[var(--rust)]'}`}>
                      {isPasswordValid ? '✓ MINIMUM MET' : '⚠ MIN 6 CHARACTERS'}
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
                    placeholder="Create master secret"
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

              {/* Field 4: CONFIRM PASSWORD */}
              <div className="space-y-1 animate-mech-rise-sm delay-mech-11">
                <div className="flex justify-between items-baseline">
                  <label className="text-[10px] uppercase text-[var(--ink-faint)] tracking-wider font-bold">
                    Confirm Password
                  </label>
                  {confirmPassword && (
                    <span className={`text-[9px] ${isConfirmValid ? 'text-[var(--verdigris)]' : 'text-[var(--rust)]'}`}>
                      {isConfirmValid ? '✓ PASSWORDS MATCH' : '⚠ PASSWORDS DO NOT MATCH'}
                    </span>
                  )}
                </div>
                <div className="engineered-input-wrapper relative flex items-center">
                  <Lock className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="engineered-input w-full pl-9 pr-10 py-2.5 rounded-lg bg-[var(--paper)] border border-[var(--border)] text-[var(--ink)] focus:outline-hidden transition-colors"
                    placeholder="Re-enter master secret"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 p-1 text-[var(--ink-faint)] hover:text-[var(--copper)] transition cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <div className="engineered-input-baseline" />
                </div>
              </div>

              {/* Privacy / Security Truthfulness Notice */}
              <div className="flex items-center gap-2 text-[10px] text-[var(--ink-faint)] pt-1">
                <HardDrive className="w-3.5 h-3.5 text-[var(--copper)] shrink-0" />
                <span>
                  Keys derived in local memory. Passwords never saved in plaintext or local storage.
                </span>
              </div>

              {/* PRIMARY ACTION BUTTON */}
              <div className="pt-2 animate-mech-rise-sm delay-mech-12">
                <button
                  type="submit"
                  disabled={isInitializing}
                  className={`w-full py-3 px-4 rounded-xl text-[var(--paper-raised)] font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:translate-y-[1px] ${
                    isInitializing
                      ? 'btn-loading-trace text-[var(--paper-raised)] cursor-wait'
                      : 'bg-[var(--copper)] hover:bg-[var(--copper-deep)]'
                  }`}
                >
                  {isInitializing ? (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--paper-raised)] animate-ping" />
                      <span>INITIALIZING OPERATOR...</span>
                    </div>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>CREATE OPERATOR ACCOUNT</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* SECONDARY NAVIGATION */}
            <div className="pt-4 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
              <span className="text-[var(--ink-faint)] text-[11px]">
                Already have an operator account?
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActivePage('login')}
                  className="text-[var(--copper)] hover:text-[var(--copper-deep)] font-bold hover:underline cursor-pointer"
                >
                  SIGN IN
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
