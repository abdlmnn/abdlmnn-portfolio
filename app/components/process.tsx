import { getCommand, process } from "../lib/data";
import Reveal from "./reveal";

export default function Process() {
  const section = getCommand("process");

  return (
    <section id={section.section} className="px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-16 flex items-baseline gap-4 md:mb-20">
            <span className="font-mono text-sm text-accent">{section.index}</span>
            <h2 className="text-4xl font-bold tracking-tight text-fg md:text-6xl">
              How We&apos;ll Work
            </h2>
          </div>
        </Reveal>

        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {process.map((step, i) => (
            <Reveal key={step.step} delay={i * 100}>
              <div className="flex flex-col gap-4 border-t-2 border-fg pt-6">
                <span className="font-mono text-sm text-accent">
                  {step.step}
                </span>
                <h3 className="text-xl font-bold tracking-tight text-fg">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
