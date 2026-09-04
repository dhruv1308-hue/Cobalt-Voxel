/**
 * Mineral Signal reminder: the app shell is a quiet navy frame with cobalt signal moments,
 * offset editorial structure, and motion that feels weighted. Keep the boot sequence short,
 * skippable, and respectful of reduced-motion preferences.
 */
import { useEffect, useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { ArrowUpRight, FileText } from "lucide-react";
import ErrorBoundary from "./components/ErrorBoundary";
import BrandMark from "./components/BrandMark";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import Workspace from "./pages/Workspace";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";
import VoxelSphere from "../../components/originkit/ui/voxel-sphere";

function BootSequence({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true);
  const [location] = useLocation();

  useEffect(() => {
    const timer = window.setTimeout(() => { setVisible(false); onDone(); }, 1900);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  useEffect(() => {
    if (location !== "/") { setVisible(false); onDone(); }
  }, [location, onDone]);

  if (!visible) return null;

  const finish = () => { setVisible(false); onDone(); };

  return (
    <div className="boot-sequence" role="status" aria-live="polite">
      <div className="boot-sequence__topline">
        <BrandMark light />
        <span>boot / 001</span>
      </div>
      <div className="boot-sequence__core">
        <div className="boot-sequence__sphere">
          <VoxelSphere color="#2457D6" tip="#B8D9EA" sheen="#F7F4EC" count={15} cube={11} breath={8} wave={18} gap={5} gloss={13} speed={4} sizePercent={71} />
        </div>
        <div className="boot-sequence__label">
          <span className="eyebrow">Cobalt Voxel / 001</span>
          <span>Assembling the signal</span>
        </div>
      </div>
      <div className="boot-sequence__bottomline">
        <span>Material interface</span>
        <button type="button" onClick={finish}>Skip intro <ArrowUpRight size={14} strokeWidth={1.5} /></button>
      </div>
    </div>
  );
}

function TermsPreEntry({ visible }: { visible: boolean }) {
  const [, navigate] = useLocation();
  const [accepted, setAccepted] = useState(() => window.localStorage.getItem("cobalt-voxel-terms-accepted") === "1");
  if (!visible || accepted) return null;

  const continueToDraw = () => {
    window.localStorage.setItem("cobalt-voxel-terms-accepted", "1");
    setAccepted(true);
  };

  return (
    <section className="terms-pre-entry" aria-labelledby="terms-pre-entry-heading">
      <div className="terms-pre-entry__chrome"><span>COBALT VOXEL / 001</span><span>PRE-ENTRY / TERMS</span></div>
      <div className="terms-pre-entry__panel">
        <FileText size={22} strokeWidth={1.4} aria-hidden="true" />
        <p className="eyebrow eyebrow--light">Before the signal</p>
        <h1 id="terms-pre-entry-heading">Use the tool<br /><em>with intent.</em></h1>
        <p className="terms-pre-entry__lede">Please review the Terms & Conditions before entering the Draw CV experience.</p>
        <div className="terms-pre-entry__summary"><span>01</span><p>Your account and content stay yours. Review AI output, protect your keys, and only upload material you have the right to process.</p></div>
        <div className="terms-pre-entry__actions">
          <button className="button button--cobalt" type="button" onClick={continueToDraw}>I understand — continue <ArrowUpRight size={16} strokeWidth={1.5} /></button>
          <button className="text-link text-link--light" type="button" onClick={() => navigate("/terms")}>Read full Terms & Conditions <ArrowUpRight size={15} strokeWidth={1.5} /></button>
        </div>
      </div>
    </section>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/workspace" component={Workspace} />
      <Route path="/workspace/legal" component={() => <Legal />} />
      <Route path="/workspace/legal/terms" component={() => <Legal terms />} />
      <Route path="/terms" component={() => <Legal terms />} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const [bootDone, setBootDone] = useState(false);
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <BootSequence onDone={() => setBootDone(true)} />
        <TermsPreEntry visible={bootDone} />
        <Router />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
