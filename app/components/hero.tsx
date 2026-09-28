"use client";

import { useEffect, useState } from "react";
import { contact, getCommand } from "../lib/data";

const words = ["web apps.", "e-commerce.", "mobile apps.", "APIs.", "dashboards."];

export default function Hero() {
  const [index, setIndex] = useState(0);
  const section = getCommand("index");

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id={section.section}
      className="relative flex min-h-[85vh] flex-col justify-center px-6 py-24 md:px-10"
    >
      <div className="w-full">
        <p className="mb-6 font-mono text-sm text-muted">
          <span className="text-accent">$</span> whoami
          <span className="text-muted">
            {" "}
            — Full-stack developer, Philippines
          </span>
        </p>

        <h1 className="max-w-5xl text-[clamp(2.75rem,7vw,6rem)] leading-[0.95] font-extrabold tracking-tighter text-fg">
          You need it built.
          <br />
          I ship{" "}
          <span className="text-accent transition-all duration-500">
            {words[index]}
          </span>
        </h1>

        <div className="mt-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-lg leading-relaxed text-muted">
            I help clients turn ideas into working products — from web apps
            and online stores to mobile platforms and the APIs that power them.
          </p>

          <a
            href={`mailto:${contact.email}`}
            className="inline-flex w-fit items-center gap-3 rounded bg-accent px-8 py-4 text-base font-medium text-accent-fg transition-opacity hover:opacity-85"
          >
            Start a project
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 flex items-center gap-3 md:left-10">
        <div className="flex h-8 w-5 items-start justify-center rounded-full border border-fg/30 p-1">
          <div className="h-2 w-1 animate-scroll-dot rounded-full bg-fg" />
        </div>
        <span className="font-mono text-xs text-muted">scroll</span>
      </div>
    </section>
  );
}
