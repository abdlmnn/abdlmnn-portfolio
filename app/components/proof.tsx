import { getCommand, projects } from "../lib/data";
import Reveal from "./reveal";

export default function Proof() {
  const section = getCommand("work");

  return (
    <section id={section.section} className="px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24 lg:px-10 lg:py-28 xl:px-12 xl:py-32 2xl:px-16 2xl:py-36">
      <div className="mx-auto max-w-4xl sm:max-w-5xl md:max-w-6xl lg:max-w-7xl">
        <Reveal>
          <div className="mb-10 sm:mb-12 md:mb-14 lg:mb-16">
            <span className="font-mono text-xs sm:text-sm md:text-base lg:text-lg text-accent">
              {section.index}
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-fg">
              Selected Work
            </h2>
          </div>
        </Reveal>

        <div className="border-t border-line">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={i * 80}>
              <article className="group border-b border-line py-8 sm:py-10 md:py-12 lg:py-14">
                <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 lg:gap-8 md:flex-row md:items-start">
                  <span className="shrink-0 font-mono text-xs sm:text-sm text-muted">
                    {project.index}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="mb-2 sm:mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-fg transition-colors group-hover:text-accent">
                        {project.name}
                      </h3>
                      <span className="text-sm sm:text-base md:text-lg text-muted">
                        {project.tagline}
                      </span>
                    </div>

                    <p className="max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-muted">
                      {project.description}
                    </p>

                    <div className="mt-4 sm:mt-5 md:mt-6 flex flex-wrap gap-1.5 sm:gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded border border-line px-2 sm:px-3 py-0.5 sm:py-1 font-mono text-[10px] sm:text-xs md:text-sm text-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <span className="shrink-0 font-mono text-[10px] sm:text-xs md:text-sm text-muted">
                    {project.role}
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
