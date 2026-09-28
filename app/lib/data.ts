export const identity = {
  handle: "abdlmnn",
  cwd: "~/abdlmnn",
} as const;

/**
 * The site's own command vocabulary. These double as the sidebar nav entries
 * and as the commands you can type into the terminal at the bottom.
 */
export const commands = [
  {
    index: "00",
    name: "whoami",
    section: "index",
    summary: "who you are talking to",
  },
  {
    index: "01",
    name: "shipped",
    section: "work",
    summary: "products delivered for clients",
  },
  {
    index: "02",
    name: "stack",
    section: "capabilities",
    summary: "what I build with",
  },
  {
    index: "03",
    name: "playbook",
    section: "process",
    summary: "how we work together",
  },
  {
    index: "04",
    name: "ping",
    section: "contact",
    summary: "start something",
  },
] as const;

export type SectionId = (typeof commands)[number]["section"];

export function getCommand(section: SectionId) {
  const command = commands.find((entry) => entry.section === section);
  if (!command) throw new Error(`Unknown section: ${section}`);
  return command;
}

/** Terminal-only commands, surfaced by `help`. */
export const shellCommands = [
  { name: "ls", args: "", summary: "list every shipped project" },
  { name: "github", args: "", summary: "open the GitHub profile" },
  { name: "linkedin", args: "", summary: "open the LinkedIn profile" },
  { name: "theme", args: "[light|dark]", summary: "switch the color scheme" },
  { name: "home", args: "", summary: "scroll back to the top" },
  { name: "cls", args: "", summary: "clear this log" },
  {
    name: "close",
    args: "",
    summary: "close this tab (exit works)",
  },
  { name: "help", args: "", summary: "print this list" },
] as const;

export const status = {
  state: "available for work",
  meta: "Full-Stack · Philippines · UTC+8",
  role: "Full-Stack Developer",
  based: "Philippines · UTC+8",
  stack: "TypeScript · Next.js · Node",
} as const;

export const projects = [
  {
    id: "sarig",
    index: "01",
    name: "Sarig",
    tagline: "Local logistics Super App for Marawi",
    description:
      "A trusted delivery and transport platform built for the unique logistics landscape of Marawi City — connecting senders, riders, and recipients in one seamless experience.",
    tags: ["Web", "Mobile", "Logistics"],
    role: "Full-Stack Developer",
  },
  {
    id: "pharmago",
    index: "02",
    name: "PharmaGo",
    tagline: "Centralized medicine ordering & delivery",
    description:
      "A unified medicine ordering and delivery system serving customers, pharmacies, riders, and admins across Iligan City — four distinct user flows, one platform.",
    tags: ["Web", "Mobile", "Healthcare"],
    role: "Full-Stack Developer",
  },
  {
    id: "puregold",
    index: "03",
    name: "PureGold Grocery",
    tagline: "Grocery management in one dashboard",
    description:
      "A complete grocery management system organizing products, stocks, orders, payments, reports, and administration — replacing manual processes with a single web dashboard.",
    tags: ["Web", "E-commerce", "Management"],
    role: "Full-Stack Developer",
  },
  {
    id: "stuart",
    index: "04",
    name: "Stuart Boutique",
    tagline: "Clothing ordering & inventory system",
    description:
      "A dedicated e-commerce website where customers browse clothing items and place orders — with inventory management built to keep stock accurate as orders flow in.",
    tags: ["Web", "E-commerce", "Inventory"],
    role: "Full-Stack Developer",
  },
] as const;

export const capabilities = [
  {
    index: "01",
    title: "Web Apps",
    description:
      "Full-stack web applications — from customer dashboards to multi-role platforms. Built to handle real users and real data.",
  },
  {
    index: "02",
    title: "E-commerce",
    description:
      "Online stores with browsing, ordering, payments, and inventory. Systems that turn visitors into buyers.",
  },
  {
    index: "03",
    title: "APIs & Backends",
    description:
      "Server-side systems that power web and mobile apps — databases, authentication, payment integrations, and business logic.",
  },
  {
    index: "04",
    title: "Frontend / UI Engineering",
    description:
      "Interfaces that feel as good as they look — responsive, accessible, and fast. The face of your product.",
  },
] as const;

export const process = [
  {
    step: "01",
    title: "Discover",
    description:
      "I start by understanding your problem, your users, and your goals. No assumptions — just clarity.",
  },
  {
    step: "02",
    title: "Design",
    description:
      "We map the solution together. Architecture, user flows, and interfaces — planned before a single line of code.",
  },
  {
    step: "03",
    title: "Build",
    description:
      "I ship. Clean, tested code — delivered in iterations so you see progress, not promises.",
  },
  {
    step: "04",
    title: "Support",
    description:
      "Launch is the beginning. I stay available for fixes, improvements, and new features as you grow.",
  },
] as const;

export const contact = {
  email: "hello@abdlmnn.dev",
  github: "https://github.com/abdlmnn",
  linkedin: "https://linkedin.com/in/abdlmnn",
} as const;

/** Outbound links — the sidebar's NET group. */
export const netLinks = [
  { name: "github", href: contact.github },
  { name: "linkedin", href: contact.linkedin },
] as const;

/** The resume file in /public — sidebar FILES row and the resume tab. */
export const resume = {
  name: "resume.pdf",
  file: "/Resume/Resume%20Mohammad%20D.%20Abdulmanan.pdf",
} as const;
