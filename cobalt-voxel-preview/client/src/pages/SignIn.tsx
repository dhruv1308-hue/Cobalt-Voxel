/**
 * Mineral Signal reminder: the auth screen is a calm instrument panel—not a generic card.
 * Keep the cream form surface precise, the navy field spacious, and cobalt reserved for action.
 */
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { startLogin } from "../const";
import { useAuth } from "@/_core/hooks/useAuth";
import BrandMark from "../components/BrandMark";
import ThemeToggle from "../components/ThemeToggle";
import VoxelSphere from "../../../components/originkit/ui/voxel-sphere";

type AuthMode = "sign-in" | "register";
type FormStatus = "idle" | "success" | "error";

export default function SignIn() {
  const [, navigate] = useLocation();
  const { user: currentUser } = useAuth();
  const utils = trpc.useUtils();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  const signInMutation = trpc.auth.signIn.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      setStatus("success");
      setMessage("You’re in. Reconnecting you to your workspace…");
      window.setTimeout(() => navigate("/workspace"), 650);
    },
    onError: (error) => {
      setStatus("error");
      setMessage(error.message || "Email or password is incorrect.");
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      setStatus("success");
      setMessage("Your workspace is ready. Opening it now…");
      window.setTimeout(() => navigate("/workspace"), 650);
    },
    onError: (error) => {
      setStatus("error");
      setMessage(error.message || "We couldn’t create that account.");
    },
  });

  const isPending = signInMutation.isPending || registerMutation.isPending;

  useEffect(() => {
    if (currentUser && status === "idle") {
      setMessage(`You’re already signed in as ${currentUser.name ?? currentUser.email ?? "this account"}.`);
    }
  }, [currentUser, status]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setStatus("idle");
    setMessage("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setMessage("");
    if (mode === "register") {
      if (!termsAccepted) {
        setStatus("error");
        setMessage("Please accept the terms & conditions to create your workspace.");
        return;
      }
      if (password !== confirmPassword) {
        setStatus("error");
        setMessage("Passwords do not match.");
        return;
      }
      registerMutation.mutate({ name, email, password, remember });
      return;
    }
    signInMutation.mutate({ email, password, remember });
  };

  return (
    <main className="auth-shell">
      <section className="auth-visual" aria-label="Cobalt Voxel atmosphere">
        <div className="auth-visual__scene" aria-hidden="true"><VoxelSphere color="#2457D6" tip="#B8D9EA" sheen="#F7F4EC" count={15} cube={10} breath={8} wave={17} gap={5} gloss={13} speed={1.5} sizePercent={70} /></div>
        <div className="auth-visual__wash" />
        <div className="auth-visual__topline">
          <Link href="/" className="auth-back"><ArrowLeft size={15} strokeWidth={1.5} /> Return to index</Link>
          <div className="auth-visual__topline-actions"><span>access / 006</span><ThemeToggle /></div>
        </div>
        <div className="auth-visual__content">
          <BrandMark light />
          <div className="auth-visual__statement">
            <p className="eyebrow eyebrow--light"><span className="eyebrow-dot" /> Private workspace</p>
            <h1>Your ideas,<br /><em>in orbit.</em></h1>
            <p>{mode === "register" ? "Create a name for the space your ideas will return to." : "Sign in to pick up where the signal last held."}</p>
          </div>
        </div>
        <div className="auth-visual__footer"><span>cobalt / mineral core</span><span>01. 48° 12′ N</span></div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel__inner">
          <div className="auth-panel__header">
            <div className="auth-panel__mobile-brand"><BrandMark /></div>
            <p className="eyebrow">Workspace access</p>
            <h2>{mode === "register" ? <>Name<br /><em>the signal.</em></> : <>Pick up<br /><em>the thread.</em></>}</h2>
            <p className="auth-panel__lede">{mode === "register" ? "Your name stays with your workspace, wherever you return." : "A single place for the work that is still becoming."}</p>
          </div>

          {currentUser && <div className="auth-session-notice" role="status"><strong>Session already active</strong><span>{currentUser.loginMethod === "google" ? "This account is connected with Google." : "Your workspace session is still active."}</span><Link href="/workspace" className="text-link">Continue to workspace <ArrowUpRight size={14} strokeWidth={1.5} /></Link></div>}

          {currentUser?.loginMethod === "google" && <button className="button button--navy auth-sso-button" type="button" onClick={() => startLogin()}>Continue with Google <ArrowUpRight size={16} strokeWidth={1.5} /></button>}

          <form className="auth-form" id="auth-form" method="post" autoComplete="on" onSubmit={handleSubmit}>
            {mode === "register" && <><label className="field-label" htmlFor="name">Your name</label><div className="input-wrap"><UserRound size={16} strokeWidth={1.5} aria-hidden="true" /><input id="name" name="name" type="text" autoComplete="name" placeholder="How should we call you?" value={name} onChange={(event) => { setName(event.target.value); setStatus("idle"); }} required minLength={2} maxLength={80} /></div></>}

            <label className="field-label" htmlFor="email">Email address</label>
            <div className="input-wrap">
              <Mail size={16} strokeWidth={1.5} aria-hidden="true" />
              <input id="email" name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" placeholder="you@studio.com" value={email} onChange={(event) => { setEmail(event.target.value); setStatus("idle"); }} required />
            </div>

            <label className="field-label" htmlFor="password">Password</label>
            <div className="input-wrap">
              <LockKeyhole size={16} strokeWidth={1.5} aria-hidden="true" />
              <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "register" ? "new-password" : "current-password"} placeholder={mode === "register" ? "At least 8 characters" : "Enter your password"} value={password} onChange={(event) => { setPassword(event.target.value); setStatus("idle"); }} required minLength={8} maxLength={128} />
              <button className="input-action" type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((show) => !show)}>{showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}</button>
            </div>

            {mode === "register" && <><label className="field-label" htmlFor="confirm-password">Confirm password</label><div className="input-wrap"><LockKeyhole size={16} strokeWidth={1.5} aria-hidden="true" /><input id="confirm-password" name="confirm-password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Repeat your password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setStatus("idle"); }} required minLength={8} maxLength={128} /></div></>}

            {mode === "register" && <label className="terms-control" htmlFor="terms"><input id="terms" name="terms" type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} /><span className="checkbox-mark" /><span>I agree to the <Link href="/workspace/legal/terms" target="_blank" rel="noreferrer">terms & conditions</Link>. We save your email to identify your workspace.</span></label>}
            <div className="form-meta">
              <label className="remember-control" htmlFor="remember"><input id="remember" name="remember" type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span className="checkbox-mark" />Keep me signed in</label>
              {mode === "sign-in" && <button type="button" className="quiet-button" onClick={() => { setStatus("error"); setMessage("Password recovery will be available once email delivery is connected."); }}>Forgot password?</button>}
            </div>

            <button className={`button button--cobalt button--submit ${status === "success" ? "button--success" : ""}`} type="submit" disabled={isPending}>
              {status === "success" ? <><ShieldCheck size={16} strokeWidth={1.5} /> Signal received</> : <>{isPending ? "Connecting…" : mode === "register" ? "Create workspace" : "Enter the workspace"} <ArrowUpRight size={16} strokeWidth={1.5} /></>}
            </button>
            <p className={`form-status form-status--${status}`} aria-live="polite">{message || (mode === "register" ? "Google Password Manager can save this new login." : "Use your workspace credentials to continue.")}</p>
            {mode === "sign-in" && <button className="auth-provider-link" type="button" onClick={() => startLogin()}>Use Google / workspace SSO instead</button>}
          </form>

          <div className="auth-panel__footer">
            {mode === "register" ? <><span>Already have a workspace?</span><button type="button" className="text-link" onClick={() => switchMode("sign-in")}>Sign in <ArrowUpRight size={15} strokeWidth={1.5} /></button></> : <><span>New to Cobalt Voxel?</span><button type="button" className="text-link" onClick={() => switchMode("register")}>Create an account <ArrowUpRight size={15} strokeWidth={1.5} /></button></>}
          </div>
        </div>
      </section>
    </main>
  );
}
