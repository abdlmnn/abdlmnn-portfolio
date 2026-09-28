import { capabilities, getCommand } from "../lib/data";
import Reveal from "./reveal";

export default function Capabilities() {
  const section = getCommand("capabilities");

  return (
    <section
      id={section.section}
      className="border-y border-line bg-invert-bg px-6 py-24 text-invert-fg md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-16 flex items-baseline gap-4 md:mb-20">
            <span className="font-mono text-sm text-accent">{section.index}</span>
            <h2 className="text-4xl font-bold tracking-tight md:text-6xl">
              What I Do
            </h2>
          </div>
        </Reveal>

        <div className="grid gap-px bg-invert-fg/10 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((cap, i) => (
            <Reveal key={cap.index} delay={i * 80} className="h-full">
              <div className="group flex h-full flex-col gap-6 bg-invert-bg p-8 transition-colors hover:bg-accent">
                <span className="font-mono text-xs text-invert-fg/40 transition-colors group-hover:text-accent-fg/60">
                  {cap.index}
                </span>

                <h3 className="text-xl font-bold tracking-tight">
                  {cap.title}
                </h3>

                <p className="text-sm leading-relaxed text-invert-fg/60 transition-colors group-hover:text-accent-fg/80">
                  {cap.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
