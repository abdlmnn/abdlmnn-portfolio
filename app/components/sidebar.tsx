"use client";

import {
  commands,
  netLinks,
  projects,
  resume,
  status,
  type SectionId,
} from "../lib/data";
import ThemeToggle from "./theme-toggle";

// Deduplicate and sort tags across all projects (excluding "Web")
const projectTags = [...new Set(projects.flatMap((p) => p.tags))]
  .filter((t) => t !== "Web")
  .sort();

function Row({
  name,
  active,
  href,
  onClick,
  dot,
  connector,
}: {
  name: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  dot?: boolean;
  connector?: string;
}) {
  const className = `group block w-full rounded px-2.5 py-1.5 text-left transition-colors ${
    active ? "bg-raised" : "hover:bg-raised/50"
  }`;

  // Anything that isn't an in-page anchor opens in a new tab: links, files.
  const external = !!href && !href.startsWith("#");
  const trailing = external ? "↗" : undefined;

  // Tree rows draw their own `├─` cell; dot rows indent under a bullet.
  const body = connector ? (
    <span className="flex items-center gap-1.5 font-mono text-[13px]">
      <span
        aria-hidden="true"
        className={`w-[17px] shrink-0 ${active ? "text-accent" : "text-muted/60"}`}
      >
        {connector}
      </span>
      <span className={`truncate ${active ? "text-fg" : "text-fg/90"}`}>
        {name}
      </span>
    </span>
  ) : (
    <span className="flex items-center gap-2">
      {dot && (
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-accent" : "bg-ok"}`}
        />
      )}
      <span
        className={`truncate font-mono text-[13px] ${active ? "text-fg" : "text-fg/90"}`}
      >
        {name}
      </span>
      {trailing && (
        <span
          aria-hidden="true"
          className="ml-auto pl-2 font-mono text-[10px] text-muted transition-colors group-hover:text-accent"
        >
          {trailing}
        </span>
      )}
    </span>
  );

  return href ? (
    <a
      href={href}
      onClick={onClick}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={className}
      aria-current={active ? "true" : undefined}
    >
      {body}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {body}
    </button>
  );
}

function Group({
  label,
  meta,
  children,
}: {
  label: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2 px-2.5 pb-1.5">
        <span className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
          {label}
        </span>
        {meta && (
          <span className="ml-auto font-mono text-[10px] text-muted opacity-70">
            {meta}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export default function Sidebar({
  active,
  open,
  onNavigate,
  onOpenResume,
  onOpenShell,
  scrollTo,
}: {
  active: SectionId;
  open: boolean;
  onNavigate: () => void;
  onOpenResume: () => void;
  onOpenShell: () => void;
  scrollTo: (id: SectionId) => void;
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-line bg-rail transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="scroll-pane flex-1 space-y-5 overflow-y-auto px-2 py-3">
        <Group label="dirs">
          {commands.map((command, index) => {
            const isLastCommand = index === commands.length - 1;
            const hasProjects = projects.length > 0;
            return (
              <Row
                key={command.section}
                name={`${command.name}/`}
                active={command.section === active}
                href={`#${command.section}`}
                onClick={() => {
                  scrollTo(command.section);
                  onNavigate();
                }}
                connector={isLastCommand && !hasProjects ? "└─" : "├─"}
              />
            );
          })}
          {projects.map((project, index) => (
            <Row
              key={project.id}
              name={project.name}
              dot
              active={active === "work"}
              onClick={() => {
                scrollTo("work");
                onNavigate();
              }}
              connector={
                index === projects.length - 1 ? "└─" : "├─"
              }
            />
          ))}
        </Group>

        <div className="border-t border-line" />

        <Group label="net">
          {netLinks.map((link) => (
            <Row
              key={link.name}
              name={link.name}
              href={link.href}
              onClick={onNavigate}
            />
          ))}
        </Group>

        <div className="border-t border-line" />

        <Group label="files">
          <Row
            name={resume.name}
            onClick={() => {
              onOpenResume();
              onNavigate();
            }}
          />
        </Group>
      </div>

      <div className="space-y-1.5 border-t border-line px-1.5 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              onOpenShell();
              onNavigate();
            }}
            title="Open a terminal (`)"
            className="flex flex-1 items-center gap-2 rounded px-1 py-1.5 font-mono text-[13px] text-fg/90 transition-colors hover:bg-raised/50 hover:text-fg"
          >
            <span aria-hidden="true" className="text-muted">
              ❯
            </span>
            terminal
          </button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
