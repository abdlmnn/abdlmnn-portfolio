"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  identity,
  type SectionId,
} from "../lib/data";
import { applyTheme } from "../lib/theme";
import {
  runShellCommand,
  SHELL_TONE_CLASS,
  type ShellLine,
} from "../lib/shell";

interface Line extends ShellLine {
  id: number;
}

/** One command: the echoed input (absent at boot) plus what it printed. */
interface Turn {
  id: number;
  echo?: Line;
  out: Line[];
}

/** Scrollback is capped in turns — a command plus everything it printed. */
const MAX_TURNS = 60;

let lineId = 1;

function stamp(newLines: ShellLine[]): Line[] {
  return newLines.map((line) => ({ ...line, id: lineId++ }));
}

/** Big ASCII banner shown at boot. */
const ascii = [
  "",
  "███████████ ████████   ███████▌█   ███▓▌    █████▄▄██████▌ ██████  ████ ██████  ████",
  "▓▓██   ▓▓██ ▓▓██  ▓▓█  ▓▓██   ▓▌█  ▓▓██     ▓▓██ ▓▓█▓ ▓▓██ ▓▓█▓▓█▌ ▓▓██ ▓▓█▓▓█▌ ▓▓██",
  "▒▒█▌   ▒▒█▌ ▒▒█▌  ▒▒█▌ ▒▒██   ▒▒█▌ ▒▒██     ▒▒██ ▒▒▓▌ ▒▒█▌ ▒▒█▒▒██ ▒▒█▌ ▒▒█▒▒██ ▒▒█▌",
  "░░▌▓▓▓▌░░█▌ ░░█▌  ░░█▌ ░░█▌   ░░██ ░░█▌     ░░█▌ ░░▓  ░░█▌ ░░█░░██ ░░█▌ ░░█░░██ ░░█▌",
  "▀▀▀    ▀▀▀  ▀▀▀ ▀▀▀    ▀▀▀    ▀▀▀▀ ▀▀▀      ▀▀▀  ▀▀   ▀▀▀▀ ▀▀▀▀▀▀▀ ▀▀█▌ ▀▀▀▀▀▀▀ ▀▀█▌",
  "███    ███  ███ ███    ███    ███▌ ███      ███▌      ███  ███████▌███▌ ███████▌███▌",
  "▓▓█    ▓▓█  ▓▓█   ▓▓█  ▓▓█    ▓▓█  ▓▓█      ▓▓█       ▓▓█  ▓▓██ ▓▓█▓▓█  ▓▓██ ▓▓█▓▓█ ",
  " ▒▌    ▒▒▌  ▒▒▌   ▒▒▌  ▒▒▌    ▒▒▌  ▒▒▌      ▒▒▌       ▒▒▌  ▒▒█▌ ▒▒█▒█   ▒▒█▌ ▒▒█▒█  ",
  "       ░░   ░░░░░░░░   ░░░░░░░░    ░░░░░░░░ ░░        ░░   ░░█  ░█▌     ░░█  ░█▌ ",
] as const;

/** A traditional terminal — prompt at top, output below, scrolls like a real shell. */
export default function PaneTerminal({
  n,
  focused,
  onClose,
  onCommand,
  scrollTo,
}: {
  n: number;
  focused: boolean;
  onClose: () => void;
  onCommand?: (name?: string) => void;
  scrollTo: (id: SectionId) => void;
}) {
  // Never server-rendered (shell tabs only exist after a click), so the
  // first client render can measure the viewport directly — no flip-flop.
  const [turns, setTurns] = useState<Turn[]>(() => [freshTurn()]);
  const [value, setValue] = useState("");
  const [cursor, setCursor] = useState(-1);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const history = useRef<string[]>([]);
  const outRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Follow the newest line: output on the right, echoes on the left, and —
  // narrow — the prompt that lives at the end of the stream.
  useEffect(() => {
    if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
  }, [turns]);

  // Show floating scroll-to-bottom button when user scrolls up
  useEffect(() => {
    const el = outRef.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 20;
      setShowScrollBtn(!atBottom);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Measure the container and pick a font size for the banner that fits
  // horizontally on every width — no wrapping, exact glyphs.
  const [artSize, setArtSize] = useState(12);
  const artRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = artRef.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;
    const fit = () => {
      const usable = parent.clientWidth - 32; // px-4 x2
      const longest = ascii.at(-1)?.length ?? 1;
      // Mono advance ≈ 0.6em; keep a safety margin.
      const size = Math.min(12, Math.max(5, (usable * 0.9) / (longest * 0.6)));
      setArtSize(size);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Focusing a tab focuses its prompt — pointer-only.
  const wasFocused = useRef(false);
  useEffect(() => {
    if (!focused) {
      wasFocused.current = false;
      return;
    }
    if (!wasFocused.current) {
      wasFocused.current = true;
      if (window.matchMedia("(pointer: fine)").matches) {
        inputRef.current?.focus();
      }
    }
  }, [focused]);

  function focusInput() {
    inputRef.current?.focus();
  }

  /** The boot card — starting state, and what `clear` / ^L restore. */
  function freshTurn(): Turn {
    return { id: lineId++, out: stamp(welcome()) };
  }

  function run(raw: string) {
    const input = raw.trim();
    if (!input) return;
    const [name] = input.split(/\s+/);

    history.current = [input, ...history.current.filter((h) => h !== input)];
    setCursor(-1);

    const { lines: produced, action } = runShellCommand(input, {
      scrollTo,
      openLink: (url) => window.open(url, "_blank", "noopener,noreferrer"),
      getTheme: () => document.documentElement.getAttribute("data-theme"),
      setTheme: applyTheme,
    });

    if (action === "clear") {
      setTurns([freshTurn()]);
      onCommand?.(undefined); // boot again, default label back
      return;
    }

    if (action === "close") {
      onClose();
      return;
    }

    // Echo joins stdin; everything it printed joins stdout.
    const [echo, ...rest] = produced;
    onCommand?.(name);
    setTurns((prev) =>
      [
        ...prev,
        { id: lineId++, echo: { ...echo, id: lineId++ }, out: stamp(rest) },
      ].slice(-MAX_TURNS),
    );
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.current.length) return;
      const next = Math.min(cursor + 1, history.current.length - 1);
      setCursor(next);
      setValue(history.current[next]);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = cursor - 1;
      setCursor(next);
      setValue(next < 0 ? "" : history.current[next]);
    } else if (event.key === "Escape") {
      event.stopPropagation();
      setValue("");
    } else if (event.ctrlKey && (event.key === "l" || event.key === "L")) {
      event.preventDefault();
      setTurns([freshTurn()]);
      onCommand?.(undefined);
    } else if (event.ctrlKey && (event.key === "c" || event.key === "C")) {
      event.preventDefault();
      setValue("");
    }
  }

  const lineEl = (line: Line) => (
    <p
      key={line.id}
      className={`break-words px-4 ${SHELL_TONE_CLASS[line.tone]}`}
    >
      {line.text || " "}
    </p>
  );

  // Floating scroll-to-bottom button (appears when scrolled up)
  const scrollToBottomBtn = showScrollBtn && (
    <button
      type="button"
      onClick={() => {
        outRef.current?.scrollTo({ top: outRef.current.scrollHeight, behavior: "smooth" });
      }}
      aria-label="Scroll to bottom"
      className="fixed bottom-16 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-panel/90 backdrop-blur font-mono text-cyan transition-all hover:bg-raised hover:border-accent hover:scale-105"
      style={{ pointerEvents: "auto" }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
        <path d="M18 15l-6 6-6-6" />
      </svg>
    </button>
  );

  const promptForm = (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        run(value);
        setValue("");
      }}
      className="flex shrink-0 cursor-text items-center gap-2 px-4 py-3"
    >
      <span
        aria-hidden="true"
        className="flex items-center gap-1.5 font-mono text-xs md:text-[13px]"
      >
        <span className="text-ok">{identity.cwd}</span>
        <span className="text-cyan">❯</span>
      </span>
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="help"
        aria-label={`Terminal input, tab ${n}`}
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        className="w-full min-w-0 bg-transparent font-mono text-xs text-fg outline-none placeholder:text-muted md:text-[13px]"
      />
    </form>
  );

  return (
    <div
      className="group relative flex min-h-0 flex-1 flex-col bg-base"
      onClick={focusInput}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div
          ref={outRef}
          aria-live="polite"
          className="scroll-pane min-h-0 flex-1 space-y-0.5 overflow-y-auto pt-4 font-mono text-xs leading-relaxed md:text-[13px]"
        >
          {/* ASCII banner — sized so the word never wraps */}
          <div
            ref={artRef}
            style={{ fontSize: `${artSize}px`, lineHeight: 1.15 }}
            className="flex flex-col items-center whitespace-pre text-center font-mono select-none"
          >
            {ascii.map((_line, i) => (
              <p key={i} className={SHELL_TONE_CLASS["prompt"]}>
                {_line || " "}
              </p>
            ))}
          </div>

          {turns.map((turn) => {
            const hasCols = turn.out.some((l) => l.col);
            if (hasCols) {
              const left = turn.out.filter((l) => l.col === "left");
              const right = turn.out.filter((l) => l.col === "right");
              return (
                <Fragment key={turn.id}>
                  {turn.echo && lineEl(turn.echo)}
                  <div className="grid grid-cols-2 gap-1">
                    <div>{left.map(lineEl)}</div>
                    <div>{right.map(lineEl)}</div>
                  </div>
                </Fragment>
              );
            }
            return (
              <Fragment key={turn.id}>
                {turn.echo && lineEl(turn.echo)}
                {turn.out.map(lineEl)}
                <p className="h-2" aria-hidden="true" />
              </Fragment>
            );
          })}
          {promptForm}
        </div>
      </div>
      {scrollToBottomBtn}
    </div>
  );
}

/** The boot card — starting state, and what `clear` / ^L restore. */
function welcome(): ShellLine[] {
  return [];
}