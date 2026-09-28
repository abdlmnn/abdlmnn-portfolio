import {
  commands,
  contact,
  projects,
  shellCommands,
  type SectionId,
} from "./data";
import { isTheme, type Theme } from "./theme";

export type ShellTone = "prompt" | "ok" | "error" | "muted" | "text";

export interface ShellLine {
  text: string;
  tone: ShellTone;
  col?: "left" | "right";
}

export type ShellAction = "clear" | "close";

export interface ShellContext {
  scrollTo: (id: SectionId) => void;
  openLink: (url: string) => void;
  getTheme: () => string | null;
  setTheme: (theme: Theme) => void;
}

export const SHELL_TONE_CLASS: Record<ShellTone, string> = {
  prompt: "text-cyan",
  ok: "text-ok",
  error: "text-danger",
  muted: "text-muted",
  text: "text-fg",
};

/** Every word Tab can complete: navigation commands plus shell commands. */
export const SHELL_FIRST_WORDS: string[] = [
  ...commands.map((command) => command.name),
  "dirs",
  ...shellCommands.map((command) => command.name),
];

/**
 * A conversational guide — the `help` response.
 * Reads like a developer walking you through the site.
 */
export function shellHelp(): ShellLine[] {
  const out: ShellLine[] = [{ text: "dirs", tone: "prompt" }];
  out.push({ text: "  show the full directory tree", tone: "muted" });
  for (const command of commands) {
    out.push({ text: `  ${command.name}`, tone: "prompt" });
    out.push({ text: `    ${command.summary}`, tone: "muted" });
  }
  for (const command of shellCommands) {
    const signature = `${command.name} ${command.args}`.trim();
    out.push({ text: `  ${signature}`, tone: "prompt" });
    out.push({ text: `    ${command.summary}`, tone: "muted" });
  }
  return out;
}

/**
 * The single command engine behind every shell tab.
 * Callers own history, line ids, and what `clear` / `close` mean for them.
 */
export function runShellCommand(
  raw: string,
  ctx: ShellContext,
): { lines: ShellLine[]; action?: ShellAction } {
  const input = raw.trim();
  if (!input) return { lines: [] };

  const [name, ...args] = input.split(/\s+/);
  const echo: ShellLine = { text: `❯ ${input}`, tone: "prompt" };
  const out: ShellLine[] = [];

  const navigate = commands.find((command) => command.name === name);
  if (navigate) {
    ctx.scrollTo(navigate.section);
    out.push({ text: `→ ${navigate.name} — ${navigate.summary}`, tone: "ok" });
    if (navigate.name === "ping") {
      out.push({ text: contact.email, tone: "ok" });
    }
    return { lines: [echo, ...out] };
  }

  switch (name) {
    case "dirs": {
      const out: ShellLine[] = [
        { text: "dirs", tone: "prompt", col: "left" },
        ...commands.map<ShellLine>((command, index) => ({
          text: `  ${index === commands.length - 1 ? "└─" : "├─"} ${command.name}/   ${command.summary}`,
          tone: "muted",
          col: "left" as const,
        })),
        { text: "projects", tone: "prompt", col: "right" },
        ...projects.map<ShellLine>((project, index) => ({
          text: `  ${index === projects.length - 1 ? "└─" : "├─"} ${project.name}`,
          tone: "muted",
          col: "right" as const,
        })),
      ];
      return { lines: [echo, ...out] };
    }

    case "ls":
      const allTags = projects.flatMap((p) => p.tags);
      const uniqueTags = [...new Set(allTags)].sort();
      for (const tag of uniqueTags) {
        out.push({ text: tag, tone: "muted" });
      }
      return { lines: [echo, ...out] };

    case "github":
    case "linkedin": {
      const url = contact[name];
      ctx.openLink(url);
      return { lines: [echo, { text: `→ ${url}`, tone: "ok" }] };
    }

    case "theme": {
      const arg = args[0];
      if (arg === undefined) {
        const next = ctx.getTheme() === "dark" ? "light" : "dark";
        ctx.setTheme(next);
        return { lines: [echo, { text: `→ theme: ${next}`, tone: "ok" }] };
      }
      if (isTheme(arg)) {
        ctx.setTheme(arg);
        return { lines: [echo, { text: `→ theme: ${arg}`, tone: "ok" }] };
      }
      return {
        lines: [
          echo,
          { text: `theme: expected light or dark, got "${arg}"`, tone: "error" },
        ],
      };
    }

    case "home":
      ctx.scrollTo(commands[0].section);
      return { lines: [echo, { text: "→ home", tone: "ok" }] };

    case "clear":
    case "cls":
      return { lines: [], action: "clear" };

    case "close":
    case "exit":
      return { lines: [echo], action: "close" };

    case "help":
      return { lines: [echo, ...shellHelp()] };

    default:
      return {
        lines: [
          echo,
          { text: `command not found: ${name} — try help`, tone: "error" },
        ],
      };
  }
}
