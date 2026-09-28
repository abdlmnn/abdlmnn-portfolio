import { contact, getCommand } from "../lib/data";
import Reveal from "./reveal";

export default function Contact() {
  const section = getCommand("contact");

  return (
    <section id={section.section} className="px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="mb-6 font-mono text-sm text-accent">{section.index}</p>

          <h2 className="max-w-5xl text-[clamp(2.75rem,7vw,6rem)] leading-[0.95] font-extrabold tracking-tighter text-fg">
            Let&apos;s build
            <br />
            something{" "}
            <span className="text-accent">that ships.</span>
          </h2>
        </Reveal>

        <Reveal delay={150}>
          <div className="mt-16 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex w-fit items-center gap-3 rounded bg-accent px-8 py-4 text-base font-medium text-accent-fg transition-opacity hover:opacity-85"
            >
              {contact.email}
              <span aria-hidden="true">→</span>
            </a>

            <div className="flex gap-6">
              <a
                href={contact.github}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-muted underline decoration-line underline-offset-4 transition-colors hover:text-fg hover:decoration-fg"
              >
                GitHub
              </a>
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-muted underline decoration-line underline-offset-4 transition-colors hover:text-fg hover:decoration-fg"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="mx-auto mt-24 flex max-w-6xl items-center justify-between border-t border-line pt-8 font-mono text-xs text-muted">
        <span>© {new Date().getFullYear()} abdlmnn</span>
        <span>Built to ship.</span>
      </div>
    </section>
  );
}
