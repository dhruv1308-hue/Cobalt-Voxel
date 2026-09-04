import { ArrowLeft, ArrowUpRight, Check, FileText, Mail, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import BrandMark from "../components/BrandMark";
import ThemeToggle from "../components/ThemeToggle";

type LegalPageProps = { terms?: boolean };

export default function Legal({ terms = false }: LegalPageProps) {
  const { user, loading } = useAuth(terms ? undefined : { redirectOnUnauthenticated: true, redirectPath: "/sign-in" });
  const [, navigate] = useLocation();

  if ((!terms && (loading || !user)) || (terms && loading)) return <div className="legal-loading" aria-live="polite">Loading workspace…</div>;

  return (
    <main className="legal-page">
      <aside className="legal-sidebar" aria-label="Workspace navigation">
        <Link href="/workspace" className="legal-sidebar__brand"><BrandMark /></Link>
        <div className="legal-sidebar__nav">
          <Link href="/workspace" className="legal-sidebar__link"><ArrowLeft size={16} strokeWidth={1.5} /><span>Workspace</span></Link>
          <div className="legal-sidebar__link legal-sidebar__link--active" aria-current="page"><FileText size={16} strokeWidth={1.5} /><span>Privacy & terms</span></div>
        </div>
        <div className="legal-sidebar__footer"><span>private workspace</span><ThemeToggle /></div>
      </aside>

      <section className="legal-content">
        <header className="legal-content__topbar"><p className="eyebrow"><span className="eyebrow-dot" /> Workspace information / {terms ? "02" : "01"}</p><button className="quiet-icon-button" type="button" aria-label="Return to workspace" onClick={() => navigate("/workspace")}><ArrowLeft size={17} strokeWidth={1.5} /></button></header>
        {terms ? (
          <article className="legal-article">
            <p className="eyebrow">Terms & conditions</p>
            <h1>Use the tool<br /><em>with intent.</em></h1>
            <p className="legal-lede">These terms keep the workspace clear, useful, and safe for everyone who uses it.</p>
            <div className="legal-sections">
              <section><span className="legal-index">01</span><div><h2>Your account</h2><p>Keep your sign-in details private and make sure the information you provide is accurate. You are responsible for activity carried out through your workspace.</p></div></section>
              <section><span className="legal-index">02</span><div><h2>Your content</h2><p>You keep ownership of the files and calendar material you bring into Cobalt Voxel. Only upload material you have the right to process.</p></div></section>
              <section><span className="legal-index">03</span><div><h2>Your API key</h2><p>If you bring an API key, you are responsible for its permissions and provider charges. Cobalt Voxel stores the key locally in this browser and does not send it to our backend.</p></div></section>
              <section><span className="legal-index">04</span><div><h2>Use responsibly</h2><p>AI output can be incomplete or incorrect. Review extracted events before relying on them, especially for travel, health, or time-sensitive plans.</p></div></section>
            </div>
            <Link href="/workspace/legal" className="text-link legal-back-link"><ArrowLeft size={15} strokeWidth={1.5} /> Back to privacy note</Link>
          </article>
        ) : (
          <article className="legal-article">
            <p className="eyebrow">Privacy / the short version</p>
            <h1>We save your<br /><em>email address.</em></h1>
            <p className="legal-lede">We use your email to identify your Cobalt Voxel workspace, keep your sign-in connected, and help you return to your work. We do not sell it.</p>
            <div className="legal-notice"><div className="legal-notice__icon"><Mail size={18} strokeWidth={1.5} /></div><div><strong>Your email belongs to your workspace.</strong><p>It is stored with your account so we can authenticate you and show the right workspace when you come back. Your API key is separate and stays on your device.</p></div><Check size={17} strokeWidth={1.5} /></div>
            <div className="legal-sections">
              <section><span className="legal-index">01</span><div><h2>What we keep</h2><p>Your account email, name, and sign-in metadata are saved so the workspace can function. Files and extracted calendar details remain part of your workspace experience.</p></div></section>
              <section><span className="legal-index">02</span><div><h2>What we do not do</h2><p>We do not sell your email or use your private workspace content for advertising. Your personally supplied provider key is kept in local browser storage.</p></div></section>
            </div>
            <Link href="/workspace/legal/terms" className="legal-terms-card"><div className="legal-terms-card__icon"><ShieldCheck size={18} strokeWidth={1.5} /></div><div><span className="eyebrow">Read the full terms</span><strong>Terms & conditions</strong><p>How accounts, content, and bring-your-own API keys are handled.</p></div><ArrowUpRight size={17} strokeWidth={1.5} /></Link>
          </article>
        )}
      </section>
    </main>
  );
}
