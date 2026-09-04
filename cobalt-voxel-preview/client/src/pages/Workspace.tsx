/**
 * Mineral Signal reminder: this workspace is a tactile calendar instrument, not a generic dashboard.
 * Keep the deep navy rail, cream work surfaces, cobalt signal states, blueprint rules, and calm
 * editorial labels. Upload is the primary action; provenance and confidence must stay visible.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type FormEvent } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileImage,
  FileText,
  Inbox,
  KeyRound,
  LayoutGrid,
  MessageSquareText,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  Send,
  Settings2,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import BrandMark from "../components/BrandMark";
import ThemeToggle from "../components/ThemeToggle";
import { getWorkspaceShortcutSection, isEditableShortcutTarget } from "../lib/workspaceShortcuts";

interface WorkspaceFile {
  id: number;
  name: string;
  kind: string;
  size: string;
  status: "confirmed" | "extracting" | "needs_review" | "queued";
  events: number;
}

interface CalendarEvent {
  id: number;
  title: string;
  date: number;
  day: number;
  time: string;
  end: string;
  location: string;
  source: string;
  status: "confirmed" | "pending_review";
  top: string;
  height: string;
  tone: "cobalt" | "navy" | "sand";
}

const DEVICE_GROQ_KEY = "cobalt-voxel-groq-key";

const initialFiles: WorkspaceFile[] = [
  { id: 1, name: "Oslo_itinerary.pdf", kind: "PDF", size: "2.4 MB", status: "needs_review", events: 4 },
  { id: 2, name: "dentist_confirmation.png", kind: "IMG", size: "842 KB", status: "confirmed", events: 1 },
  { id: 3, name: "design_review.eml", kind: "EML", size: "38 KB", status: "extracting", events: 1 },
];

const initialEvents: CalendarEvent[] = [
  { id: 1, title: "Dentist / cleaning", date: 10, day: 1, time: "10:30", end: "11:30", location: "North Clinic", source: "dentist_confirmation.png", status: "confirmed", top: "144px", height: "58px", tone: "cobalt" },
  { id: 2, title: "Design review", date: 11, day: 2, time: "14:00", end: "15:00", location: "Studio 04", source: "design_review.eml", status: "confirmed", top: "228px", height: "64px", tone: "navy" },
  { id: 3, title: "Flight to Oslo", date: 12, day: 3, time: "09:15", end: "12:40", location: "Copenhagen → Oslo", source: "Oslo_itinerary.pdf", status: "confirmed", top: "105px", height: "112px", tone: "sand" },
  { id: 4, title: "Hotel check-in?", date: 12, day: 3, time: "15:00", end: "16:00", location: "Needs confirmation", source: "Oslo_itinerary.pdf", status: "pending_review", top: "272px", height: "61px", tone: "cobalt" },
  { id: 5, title: "Deep work", date: 13, day: 4, time: "13:00", end: "16:00", location: "Workspace", source: "manual", status: "confirmed", top: "208px", height: "106px", tone: "navy" },
];

const weekDays = [
  { label: "MON", date: 9 },
  { label: "TUE", date: 10 },
  { label: "WED", date: 11 },
  { label: "THU", date: 12 },
  { label: "FRI", date: 13 },
  { label: "SAT", date: 14 },
  { label: "SUN", date: 15 },
];
const hours = ["08", "09", "10", "11", "12", "13", "14", "15", "16", "17"];
const monthDays = Array.from({ length: 30 }, (_, index) => index + 1);

function fileIcon(kind: string) {
  return kind === "IMG" ? <FileImage size={15} strokeWidth={1.5} /> : <FileText size={15} strokeWidth={1.5} />;
}

function statusLabel(status: WorkspaceFile["status"]) {
  if (status === "needs_review") return "Needs review";
  if (status === "extracting") return "Extracting";
  if (status === "queued") return "Queued";
  return "Confirmed";
}

export default function Workspace() {
  const { user, loading: authLoading, logout } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/sign-in" });
  const [files, setFiles] = useState(initialFiles);
  const [events, setEvents] = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(initialEvents[2]);
  const [calendarView, setCalendarView] = useState<"week" | "month">("week");
  const [dragActive, setDragActive] = useState(false);
  const [activeRail, setActiveRail] = useState("calendar");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", text: "Your calendar is in view. Ask me about free time, upcoming plans, or a date range to protect.", meta: "grounded / 12 confirmed events" },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Cobalt Voxel — Workspace";
    const savedKey = window.localStorage.getItem(DEVICE_GROQ_KEY) ?? "";
    setApiKey(savedKey);
    setApiReady(Boolean(savedKey));
    return () => { document.title = "Cobalt Voxel — Shape the signal"; };
  }, []);

  const pendingCount = useMemo(() => files.filter((file) => file.status === "needs_review").length, [files]);

  const processFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const additions = Array.from(fileList).map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      kind: file.type.includes("image") ? "IMG" : file.name.toLowerCase().endsWith(".pdf") ? "PDF" : "TXT",
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      status: "queued" as const,
      events: 0,
    }));
    setFiles((current) => [...additions, ...current]);
    additions.forEach((addition) => {
      window.setTimeout(() => setFiles((current) => current.map((file) => file.id === addition.id ? { ...file, status: "extracting" } : file)), 600);
      window.setTimeout(() => setFiles((current) => current.map((file) => file.id === addition.id ? { ...file, status: "needs_review", events: 1 } : file)), 1700);
    });
  };

  const submitChat = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = chatInput.trim();
    if (!question) return;
    setChatInput("");
    if (apiKey.trim()) {
      setChatMessages((messages) => [...messages, { role: "user", text: question, meta: "" }, { role: "assistant", text: "Thinking with your provider key…", meta: "bring your own API / live request" }]);
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey.trim()}` },
          body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: [{ role: "system", content: "You are Cobalt Voxel's concise calendar assistant. Use the provided calendar context and say when you are unsure. Calendar context: 5 sample events are currently visible in the workspace." }, { role: "user", content: question }] }),
        });
        if (!response.ok) throw new Error("The provider rejected this API key.");
        const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
        const answer = payload.choices?.[0]?.message?.content?.trim() || "The provider returned no answer.";
        setChatMessages((messages) => [...messages.slice(0, -1), { role: "assistant", text: answer, meta: "groq / live response" }]);
      } catch (error) {
        setChatMessages((messages) => [...messages.slice(0, -1), { role: "assistant", text: error instanceof Error ? error.message : "The API request could not be completed.", meta: "bring your own API / request failed" }]);
      }
      return;
    }
    const lower = question.toLowerCase();
    let answer = "I found 3 confirmed events in that range. I’m keeping the pending hotel check-in out of the free/busy calculation until you confirm it.";
    if (lower.includes("trip") || lower.includes("september") || lower.includes("october")) {
      answer = "The clearest open window is Sep 18–21. It has three full days free; Sep 25–28 is also open, but starts the morning after a confirmed flight.";
    } else if (lower.includes("free") || lower.includes("available")) {
      answer = "Thursday afternoon is open from 13:00–17:00. Friday has a confirmed deep-work block from 13:00–16:00.";
    } else if (lower.includes("clash") || lower.includes("conflict")) {
      answer = "The new item does not overlap a confirmed event yet. There is one pending extraction on Thursday at 15:00 that needs your review.";
    }
    setChatMessages((messages) => [...messages, { role: "user", text: question, meta: "" }, { role: "assistant", text: answer, meta: "grounded / calendar query" }]);
  };

  const goToSection = (id: string) => {
    setActiveRail(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (isEditableShortcutTarget(event.target)) return;
      if (event.key === "Escape") {
        setShortcutsOpen(false);
        return;
      }
      if (event.key === "?" || (event.key === "/" && event.shiftKey)) {
        event.preventDefault();
        setShortcutsOpen(true);
        return;
      }
      if (!event.metaKey && !event.ctrlKey && !event.altKey) {
        const section = getWorkspaceShortcutSection(event.key);
        if (section) {
          event.preventDefault();
          goToSection(section);
          return;
        }
      }
      if (!event.key.startsWith("Arrow")) return;
      const cells = Array.from(document.querySelectorAll<HTMLElement>("[data-grid-cell]"));
      if (!cells.length) return;
      const activeIndex = cells.indexOf(document.activeElement as HTMLElement);
      const currentIndex = activeIndex >= 0 ? activeIndex : 0;
      const columns = calendarView === "month" ? 7 : 1;
      const offset = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" ? -columns : columns;
      const nextIndex = Math.max(0, Math.min(cells.length - 1, currentIndex + offset));
      event.preventDefault();
      cells[nextIndex]?.focus();
      const eventId = cells[nextIndex]?.dataset.eventId;
      if (eventId) {
        const nextEvent = events.find((calendarEvent) => calendarEvent.id === Number(eventId));
        if (nextEvent) setSelectedEvent(nextEvent);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [calendarView, events]);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    processFiles(event.dataTransfer.files);
  };

  const confirmEvent = (id: number) => {
    setEvents((current) => current.map((calendarEvent) => calendarEvent.id === id ? { ...calendarEvent, status: "confirmed" } : calendarEvent));
    setSelectedEvent((current) => current?.id === id ? { ...current, status: "confirmed" } : current);
  };

  const deleteEvent = (id: number) => {
    setEvents((current) => current.filter((calendarEvent) => calendarEvent.id !== id));
    setSelectedEvent(null);
  };

  return (
    <main className="workspace-page">
      <header className="workspace-topbar">
        <Link href="/" className="workspace-brand"><BrandMark /></Link>
        <div className="workspace-topbar__actions">
          <button className="workspace-icon-button workspace-shortcuts-button" type="button" aria-label="Show keyboard shortcuts" onClick={() => setShortcutsOpen(true)}><CircleHelp size={17} strokeWidth={1.5} /></button>
          <ThemeToggle />
          <button className="workspace-icon-button" type="button" aria-label="Search"><Search size={17} strokeWidth={1.5} /></button>
        </div>
      </header>

      <div className="workspace-frame">
        <aside className="workspace-rail" aria-label="Workspace navigation">
          <div className="workspace-rail__top" role="navigation" aria-label="Workspace sections">
            <button className={`workspace-rail__button ${activeRail === "calendar" ? "workspace-rail__button--active" : ""}`} type="button" aria-label="Go to calendar" aria-current={activeRail === "calendar" ? "page" : undefined} onClick={() => goToSection("calendar")}><CalendarDays size={19} strokeWidth={1.5} /><span>Calendar</span></button>
            <button className={`workspace-rail__button ${activeRail === "inbox" ? "workspace-rail__button--active" : ""}`} type="button" aria-label="Go to inbox" aria-current={activeRail === "inbox" ? "page" : undefined} onClick={() => goToSection("inbox")}><Inbox size={19} strokeWidth={1.5} /><span>Inbox</span>{pendingCount > 0 && <b aria-label={`${pendingCount} pending items`}>{pendingCount}</b>}</button>
            <button className={`workspace-rail__button ${activeRail === "chat" ? "workspace-rail__button--active" : ""}`} type="button" aria-label="Go to chat" aria-current={activeRail === "chat" ? "page" : undefined} onClick={() => goToSection("chat")}><MessageSquareText size={19} strokeWidth={1.5} /><span>Chat</span></button>
            <button className={`workspace-rail__button ${activeRail === "overview" ? "workspace-rail__button--active" : ""}`} type="button" aria-label="Go to overview" aria-current={activeRail === "overview" ? "page" : undefined} onClick={() => goToSection("overview")}><LayoutGrid size={19} strokeWidth={1.5} /><span>Overview</span></button>
          </div>
          <div className="workspace-rail__bottom">
            <button className={`workspace-rail__button ${settingsOpen ? "workspace-rail__button--active" : ""}`} type="button" aria-label="Open settings" aria-expanded={settingsOpen} onClick={() => setSettingsOpen(true)}><Settings2 size={19} strokeWidth={1.5} /><span>Settings</span></button>
            <Link href="/workspace/legal" className="workspace-rail__button" aria-label="Open privacy and terms"><FileText size={19} strokeWidth={1.5} /><span>Privacy & terms</span></Link>
            <Link href="/" className="workspace-rail__exit" aria-label="Return to landing page"><ChevronLeft size={17} strokeWidth={1.5} /></Link>
          </div>
        </aside>

        <section className="workspace-body" id="overview" aria-labelledby="workspace-heading">
          <div className="workspace-heading-row">
            <div>
              <p className="eyebrow"><span className="eyebrow-dot" /> Monday, August 10, 2026</p>
              <h1 id="workspace-heading">{authLoading ? "Good morning," : <>Good morning,<br /><em>{user?.name?.split(" ")[0] ?? "there"}.</em></>}</h1>
            </div>
            <div className="workspace-heading-actions">
              <span className="workspace-sync"><span className="workspace-sync__dot" /> Sync idle</span>
              <button type="button" className="button button--cobalt" onClick={() => inputRef.current?.click()}><UploadCloud size={16} strokeWidth={1.5} /> Upload files</button>
            </div>
          </div>

          <div className={`workspace-key-banner ${apiReady ? "workspace-key-banner--ready" : ""}`}>
            <div className="workspace-key-banner__icon"><KeyRound size={16} strokeWidth={1.5} /></div>
            <div><strong>{apiReady ? "API key saved on this device" : "Bring your own API"}</strong><span>{apiReady ? "Your browser is ready for AI extraction and grounded chat on this device." : "Add a provider key to turn on extraction and calendar-aware answers."}</span></div>
            <button type="button" onClick={() => setSettingsOpen(true)}>{apiReady ? "Manage key" : "Add API key"}<ChevronRight size={14} strokeWidth={1.5} /></button>
          </div>

          <div className="workspace-layout">
            <section className="workspace-column workspace-column--ingest" id="inbox" aria-labelledby="inbox-heading">
              <div className="workspace-section-intro"><div><p className="eyebrow">01 / Ingest</p><h2>Drop it here.</h2></div><button className="quiet-icon-button" type="button" aria-label="More upload options"><MoreHorizontal size={17} strokeWidth={1.5} /></button></div>
              <div className={`upload-panel ${dragActive ? "upload-panel--active" : ""}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={handleDrop}>
                <div className="upload-panel__mark"><Plus size={22} strokeWidth={1.2} /></div>
                <strong>Upload anything schedulable</strong>
                <span>Drop screenshots, tickets, PDFs, or text here.</span>
                <button type="button" className="upload-panel__link" onClick={(event) => { event.stopPropagation(); inputRef.current?.click(); }}>Choose files <ChevronRight size={14} strokeWidth={1.5} /></button>
                <input ref={inputRef} type="file" multiple hidden accept="image/*,.pdf,.txt,.eml" onChange={(event) => processFiles(event.target.files)} />
                <small>PNG / JPG / PDF / TXT / EML · multi-file ready</small>
              </div>

              <div className="workspace-section-intro workspace-section-intro--queue"><div><p className="eyebrow">02 / Review queue</p><h2 id="inbox-heading">Keep the trace.</h2></div><span className="queue-count">{files.length.toString().padStart(2, "0")}</span></div>
              <div className="file-queue">
                {files.map((file) => (
                  <div className="file-row" key={file.id}>
                    <div className="file-row__icon">{fileIcon(file.kind)}</div>
                    <div className="file-row__main"><strong>{file.name}</strong><span>{file.kind} · {file.size} {file.events > 0 && `· ${file.events} event${file.events > 1 ? "s" : ""}`}</span></div>
                    <span className={`file-status file-status--${file.status}`}>{file.status === "confirmed" && <Check size={11} strokeWidth={2} />}{statusLabel(file.status)}</span>
                  </div>
                ))}
              </div>
              <button className="workspace-text-button" type="button"><Inbox size={14} strokeWidth={1.5} /> View all source files <ChevronRight size={13} strokeWidth={1.5} /></button>
            </section>

            <section className="workspace-column workspace-column--calendar" id="calendar" aria-labelledby="calendar-heading">
              <div className="workspace-section-intro"><div><p className="eyebrow">03 / Calendar</p><h2 id="calendar-heading">What’s held.</h2></div><div className="calendar-view-toggle"><button className={calendarView === "week" ? "is-active" : ""} type="button" onClick={() => setCalendarView("week")}>Week</button><button className={calendarView === "month" ? "is-active" : ""} type="button" onClick={() => setCalendarView("month")}>Month</button></div></div>
              <div className="calendar-panel workspace-panel">
                <div className="calendar-panel__topline"><button className="calendar-arrow" type="button" aria-label="Previous period"><ChevronLeft size={16} strokeWidth={1.5} /></button><strong>{calendarView === "week" ? "10 — 16 August 2026" : "August 2026"}</strong><button className="calendar-arrow" type="button" aria-label="Next period"><ChevronRight size={16} strokeWidth={1.5} /></button><button className="calendar-today" type="button">Today</button></div>
                {calendarView === "week" ? (
                  <div className="week-calendar">
                    <div className="week-calendar__axis"><span className="week-calendar__axis-spacer" />{hours.map((hour) => <span key={hour}>{hour}</span>)}</div>
                    <div className="week-calendar__days">
                      {weekDays.map((day, dayIndex) => (
                        <div className={`week-day ${dayIndex === 1 ? "week-day--today" : ""}`} key={day.label}>
                          <div className="week-day__header"><span>{day.label}</span><strong>{day.date}</strong></div>
                          <div className="week-day__body">{hours.map((hour) => <i key={hour} />)}{events.filter((calendarEvent) => calendarEvent.day === dayIndex).map((calendarEvent) => <button key={calendarEvent.id} type="button" data-grid-cell data-event-id={calendarEvent.id} className={`calendar-event calendar-event--${calendarEvent.tone} ${calendarEvent.status === "pending_review" ? "calendar-event--pending" : ""}`} style={{ top: calendarEvent.top, height: calendarEvent.height }} onClick={() => setSelectedEvent(calendarEvent)}><strong>{calendarEvent.title}</strong><span>{calendarEvent.time}</span></button>)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="month-calendar">{["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((label) => <span className="month-calendar__label" key={label}>{label}</span>)}{monthDays.map((day) => { const dayEvents = events.filter((calendarEvent) => calendarEvent.date === day); return <button key={day} type="button" data-grid-cell data-date={day} aria-label={`August ${day}, 2026${dayEvents.length ? `, ${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}` : ""}`} className={`month-day ${day === 10 ? "month-day--today" : ""}`} onClick={() => dayEvents[0] && setSelectedEvent(dayEvents[0])}><span>{day}</span>{dayEvents.map((calendarEvent) => <i className={`month-dot month-dot--${calendarEvent.status === "pending_review" ? "pending" : calendarEvent.tone}`} key={calendarEvent.id} />)}</button>; })}</div>
                )}
                {selectedEvent && <div className="event-inspector"><div className="event-inspector__heading"><span className={`event-inspector__signal event-inspector__signal--${selectedEvent.status === "pending_review" ? "pending" : selectedEvent.tone}`} /><div><p className="eyebrow">Selected event</p><h3>{selectedEvent.title}</h3></div><button className="quiet-icon-button" type="button" aria-label="Close event details" onClick={() => setSelectedEvent(null)}><X size={15} strokeWidth={1.5} /></button></div><div className="event-inspector__details"><span><Clock3 size={14} strokeWidth={1.5} /> {selectedEvent.time} — {selectedEvent.end}</span><span><CalendarDays size={14} strokeWidth={1.5} /> Aug {selectedEvent.date}, 2026</span><span><Paperclip size={14} strokeWidth={1.5} /> {selectedEvent.source}</span></div>{selectedEvent.status === "pending_review" && <div className="event-inspector__notice"><CircleHelp size={14} strokeWidth={1.5} /><span>Low-confidence extraction. Confirm before it counts as free/busy.</span><button type="button" onClick={() => confirmEvent(selectedEvent.id)}>Confirm</button></div>}<div className="event-inspector__actions"><button type="button">Edit event</button><button type="button" onClick={() => deleteEvent(selectedEvent.id)}>Delete</button></div></div>}
              </div>
            </section>

            <aside className="workspace-column workspace-column--chat" id="chat" aria-labelledby="chat-heading">
              <div className="workspace-section-intro"><div><p className="eyebrow">04 / Ask the calendar</p><h2 id="chat-heading">Make a plan.</h2></div><Sparkles size={17} strokeWidth={1.5} color="var(--cobalt)" /></div>
              <div className="chat-panel workspace-panel">
                <div className="chat-panel__header"><span className="chat-panel__live"><i /> grounded answers</span><button className="quiet-icon-button" type="button" aria-label="Chat options"><MoreHorizontal size={17} strokeWidth={1.5} /></button></div>
                <div className="chat-messages">{chatMessages.map((message, index) => <div className={`chat-message chat-message--${message.role}`} key={`${message.role}-${index}`}><span className="chat-message__avatar">{message.role === "assistant" ? <Sparkles size={13} strokeWidth={1.5} /> : "D"}</span><div><p>{message.text}</p>{message.meta && <small>{message.meta}</small>}</div></div>)}</div>
                <div className="chat-suggestions"><button type="button" onClick={() => setChatInput("What day am I free this week?")}>Free this week <ChevronRight size={12} strokeWidth={1.5} /></button><button type="button" onClick={() => setChatInput("Help me plan a 3-day trip in September")}>3-day trip <ChevronRight size={12} strokeWidth={1.5} /></button></div>
                <form className="chat-input" onSubmit={submitChat}><input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Ask about your calendar…" aria-label="Ask about your calendar" /><button type="submit" aria-label="Send question"><Send size={15} strokeWidth={1.5} /></button></form>
              </div>
              <div className="chat-grounding-note"><span><KeyRound size={13} strokeWidth={1.5} /> {apiReady ? "Groq connected" : "Demo grounding"}</span><button type="button" onClick={() => setSettingsOpen(true)}>Settings <ChevronRight size={12} strokeWidth={1.5} /></button></div>
            </aside>
          </div>
        </section>
      </div>

      {shortcutsOpen && <div className="workspace-shortcuts-backdrop" onClick={() => setShortcutsOpen(false)}><aside className="workspace-shortcuts" role="dialog" aria-modal="true" aria-labelledby="shortcuts-heading" onClick={(event) => event.stopPropagation()}><div className="workspace-shortcuts__top"><div><p className="eyebrow">Shortcuts / 01</p><h2 id="shortcuts-heading">Move faster.</h2></div><button className="quiet-icon-button" type="button" aria-label="Close keyboard shortcuts" onClick={() => setShortcutsOpen(false)}><X size={17} strokeWidth={1.5} /></button></div><div className="shortcut-list"><div><kbd>1</kbd><span>Focus calendar</span></div><div><kbd>2</kbd><span>Focus inbox</span></div><div><kbd>3</kbd><span>Focus chat</span></div><div><kbd>4</kbd><span>Focus overview</span></div><div><kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd><span>Navigate calendar grid</span></div><div><kbd>?</kbd><span>Show shortcuts</span></div><div><kbd>Esc</kbd><span>Close overlays</span></div></div></aside></div>}

      {settingsOpen && <div className="workspace-settings-backdrop" onClick={() => setSettingsOpen(false)}><aside className="workspace-settings" role="dialog" aria-modal="true" aria-labelledby="settings-heading" onClick={(event) => event.stopPropagation()}><div className="workspace-settings__top"><div><p className="eyebrow">Settings / 01</p><h2 id="settings-heading">Make it yours.</h2></div><button className="quiet-icon-button" type="button" aria-label="Close settings" onClick={() => setSettingsOpen(false)}><X size={17} strokeWidth={1.5} /></button></div><div className="settings-section"><label htmlFor="groq-key">Bring your own API</label><div className="settings-input"><KeyRound size={15} strokeWidth={1.5} /><input id="groq-key" type="password" autoComplete="off" placeholder="gsk_••••••••••••" value={apiKey} onChange={(event) => setApiKey(event.target.value)} /></div><p>Stored only in this browser on this device. When supported by the provider, this key powers AI extraction and grounded chat directly from your workspace. You will need to add it again on another phone or computer.</p></div><div className="settings-section"><label htmlFor="default-timezone">Default timezone</label><select id="default-timezone" defaultValue="Asia/Kolkata"><option value="Asia/Kolkata">Asia / Kolkata (IST)</option><option value="Europe/Oslo">Europe / Oslo (CET)</option><option value="America/New_York">America / New York (ET)</option></select></div><div className="settings-section"><label htmlFor="preferred-model">Chat model</label><select id="preferred-model" defaultValue="auto"><option value="auto">Auto-select from Groq model list</option><option value="fast">Fast general model</option><option value="reasoning">Reasoning model</option></select></div><button className="button button--cobalt settings-save" type="button" onClick={() => { if (apiKey.trim()) window.localStorage.setItem(DEVICE_GROQ_KEY, apiKey.trim()); else window.localStorage.removeItem(DEVICE_GROQ_KEY); setApiKey(apiKey.trim()); setApiReady(Boolean(apiKey.trim())); setSettingsOpen(false); }}>Save workspace settings <Check size={15} strokeWidth={1.5} /></button><p className="settings-footnote">Device-only key storage · backend connection to Groq can be added later</p></aside></div>}
    </main>
  );
}
