import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, RotateCcw, Sparkles } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

type Point = { x: number; y: number };
type Props = { onUnlock: () => void };

export function isDrawCvBypassKey(key: string) {
  return key === "Enter" || key === " ";
}

function drawStroke(context: CanvasRenderingContext2D, points: Point[]) {
  if (points.length < 2) return;
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
  context.stroke();
}

function GalaxyHand({ x, y, active }: { x: number; y: number; active: boolean }) {
  return (
    <div className={`draw-cv__hand ${active ? "draw-cv__hand--active" : ""}`} style={{ left: `${x}%`, top: `${y}%` }} aria-hidden="true">
      <svg viewBox="0 0 260 310" role="presentation">
        <defs>
          <linearGradient id="galaxy-hand-gradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#B8D9EA" />
            <stop offset=".48" stopColor="#2457D6" />
            <stop offset="1" stopColor="#F7F4EC" />
          </linearGradient>
          <filter id="galaxy-hand-glow"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <path d="M111 277c-25-12-48-38-56-70l-18-71c-3-12 4-22 14-24 10-2 18 5 21 16l14 49-20-94c-2-12 5-22 15-24 11-1 18 6 21 17l20 91-10-120c-1-12 6-21 17-22 11 0 17 8 18 19l10 116 8-90c1-11 9-19 19-18 11 2 16 11 15 23l-4 81 25-50c5-10 15-14 24-9 9 5 11 15 6 25l-31 67c-5 11-6 25-2 37 7 26-3 51-28 65-23 14-52 18-79 12Z" fill="rgba(7,22,46,.66)" stroke="url(#galaxy-hand-gradient)" strokeWidth="3" filter="url(#galaxy-hand-glow)" />
        <path d="M83 208c27 9 58 5 82-13M91 232c23 9 47 7 67-5M112 257c18 6 34 4 48-3" fill="none" stroke="#B8D9EA" strokeWidth="2" opacity=".62" />
        <circle cx="54" cy="105" r="3" fill="#F7F4EC" /><circle cx="152" cy="54" r="3" fill="#B8D9EA" /><circle cx="202" cy="178" r="4" fill="#2457D6" /><circle cx="131" cy="284" r="3" fill="#F7F4EC" />
      </svg>
    </div>
  );
}

export default function DrawCvGate({ onUnlock }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef<Point[]>([]);
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [pointer, setPointer] = useState({ x: 50, y: 55 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [hint, setHint] = useState("Trace a C, then a V. Let it be imperfect.");

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(ratio, ratio);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 3;
    context.strokeStyle = "rgba(247,244,236,.9)";
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isNativeControl = target?.tagName === "BUTTON" || target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT";
      if (isNativeControl || unlocked) return;
      if (isDrawCvBypassKey(event.key)) {
        event.preventDefault();
        onUnlock();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onUnlock, unlocked]);

  const resemblesC = (stroke: Point[]) => {
    if (stroke.length < 8) return false;
    const xs = stroke.map((point) => point.x);
    const ys = stroke.map((point) => point.y);
    const width = Math.max(...xs) - Math.min(...xs);
    const height = Math.max(...ys) - Math.min(...ys);
    const start = stroke[0];
    const end = stroke[stroke.length - 1];
    return height > 26 && width > 18 && height > width * 0.55 && Math.abs(start.x - end.x) > width * 0.18;
  };

  const resemblesV = (stroke: Point[]) => {
    if (stroke.length < 8) return false;
    const xs = stroke.map((point) => point.x);
    const ys = stroke.map((point) => point.y);
    const width = Math.max(...xs) - Math.min(...xs);
    const height = Math.max(...ys) - Math.min(...ys);
    const lowest = stroke.reduce((current, point) => point.y > current.y ? point : current, stroke[0]);
    return width > 24 && height > 18 && lowest.y > Math.min(...ys) + height * 0.42;
  };

  useEffect(() => {
    const totalPoints = strokes.reduce((sum, stroke) => sum + stroke.length, 0);
    const isRecognized = strokes.length >= 2 && totalPoints > 18 && resemblesC(strokes[0]) && resemblesV(strokes[1]);
    if (isRecognized && !unlocked) {
      setUnlocked(true);
      setHint("Signal recognized. The surface is giving way.");
      window.setTimeout(onUnlock, 820);
    } else if (strokes.length === 1) {
      setHint(resemblesC(strokes[0]) ? "Good. Now cut the second stroke into a V." : "Curve the first mark like a C, then continue with a V.");
    } else if (strokes.length >= 2 && !unlocked) {
      setHint("The signal is close. Try a taller C followed by a sharper V.");
    }
  }, [strokes, unlocked, onUnlock]);

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (unlocked) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    drawingRef.current = [point];
    setIsDrawing(true);
    setPointer({ x: (event.clientX / window.innerWidth) * 100, y: (event.clientY / window.innerHeight) * 100 });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    setPointer({ x: (event.clientX / window.innerWidth) * 100, y: (event.clientY / window.innerHeight) * 100 });
    if (!isDrawing || unlocked) return;
    const point = pointFromEvent(event);
    drawingRef.current.push(point);
    const context = canvasRef.current?.getContext("2d");
    if (context) drawStroke(context, drawingRef.current.slice(-2));
  };

  const finishStroke = () => {
    if (!isDrawing) return;
    const next = drawingRef.current;
    if (next.length > 2) setStrokes((current) => [...current, next]);
    drawingRef.current = [];
    setIsDrawing(false);
  };

  const reset = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (context && canvas) context.clearRect(0, 0, canvas.width, canvas.height);
    setStrokes([]);
    setUnlocked(false);
    setHint("Trace a C, then a V. Let it be imperfect.");
  };

  return (
    <section className={`draw-cv ${unlocked ? "draw-cv--unlocked" : ""}`} aria-label="Draw CV entry screen" aria-describedby="draw-cv-instructions">
      <div className="draw-cv__fog" aria-hidden="true" />
      <div className="draw-cv__grain" aria-hidden="true" />
      {unlocked && (
        <div className="draw-cv__shatter" aria-hidden="true"><span /><span /><span /><span /></div>
      )}
      <GalaxyHand x={pointer.x} y={pointer.y} active={isDrawing} />
      <div className="draw-cv__chrome"><span>DIRECT / 000</span><span>THE SURFACE IS WATCHING</span><ThemeToggle /></div>
      <div className="draw-cv__copy">
        <p className="eyebrow eyebrow--light"><Sparkles size={12} strokeWidth={1.5} /> Pre-entry gesture</p>
        <h2>Draw <em>CV.</em></h2>
        <p id="draw-cv-instructions">Use your finger or hand. The mark does not need to be perfect. Distortion is part of the signal.</p>
        <div className="draw-cv__status" aria-live="polite"><span className={`draw-cv__status-dot ${unlocked ? "is-live" : ""}`} />{hint}</div>
      </div>
      <div className="draw-cv__surface">
        <canvas ref={canvasRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={finishStroke} onPointerCancel={finishStroke} onPointerLeave={finishStroke} aria-label="Draw a C and V with your finger, hand, mouse, or trackpad" />
        <div className="draw-cv__surface-label"><span>01 / draw field</span><span>{strokes.length} / 02 gestures</span></div>
        {unlocked && <div className="draw-cv__unlock">CV / ACCEPTED <ArrowDownRight size={16} strokeWidth={1.5} /></div>}
      </div>
      <div className="draw-cv__footer"><span>Touch / mouse / trackpad</span><button type="button" onClick={reset}><RotateCcw size={13} strokeWidth={1.5} /> Reset mark</button><span>Enter to bypass</span></div>
      <button className="draw-cv__bypass" type="button" onClick={onUnlock}>Enter without drawing <ArrowDownRight size={16} strokeWidth={1.5} /></button>
    </section>
  );
}

export { DrawCvGate };

// The callback prop intentionally stays small so Home owns the landing-page unlock state.
// The gesture is permissive: two meaningful strokes unlock, allowing imperfect/distorted marks.
// Keyboard users can use the explicit bypass action instead of a pointer surface.
// The hand is decorative but follows pointer/touch movement behind the drawing layer.
// The fog/grain treatment is CSS-only so the first frame remains fast on mobile.
// The component does not persist the drawing or any biometric information.
// This is a visual gate, not identity verification.
// Future recognition can replace the permissive two-stroke heuristic without changing the UI contract.
// All colors remain inside the Cobalt Voxel palette.
// Motion is disabled under prefers-reduced-motion in the global stylesheet.
// The drawing canvas is intentionally not submitted anywhere.
// The bypass keeps the route accessible if drawing is unavailable.
// The user can reset and redraw at any point before acceptance.
// Touch actions are handled by Pointer Events for pen, touch, and mouse parity.
// End of component.
