import type { Resume } from "@/lib/types";
import { ResumeSchema } from "@/lib/types";

// ---------------------------------------------------------------------------
// RÉSUMÉ
// This drives /resume (web view) and, optionally, a generated PDF.
// Drop a ready PDF at `public/resume.pdf` and it becomes downloadable.
// ---------------------------------------------------------------------------

export const resume: Resume = ResumeSchema.parse({
  summary:
    "Software engineer focused on building fast, accessible web experiences. Comfortable across the stack, happiest when shipping and iterating quickly.",
  experience: [
    {
      role: "Software Engineer",
      company: "Company Name",
      location: "Remote",
      start: "2023",
      end: "Present",
      highlights: [
        "Shipped features used by thousands of users, owning them end-to-end.",
        "Improved page performance and accessibility across the product.",
        "Mentored newer engineers and led code review standards.",
      ],
      tech: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL"],
    },
    {
      role: "Software Engineer",
      company: "Previous Company",
      location: "Your City",
      start: "2021",
      end: "2023",
      highlights: [
        "Built and maintained internal tooling that cut manual work significantly.",
        "Collaborated with design to deliver a consistent component library.",
      ],
      tech: ["JavaScript", "React", "Python", "Docker"],
    },
  ],
  education: [
    {
      degree: "BSc Computer Science",
      school: "Your University",
      location: "Your City",
      start: "2017",
      end: "2021",
      highlights: ["Relevant coursework, honours, or achievements."],
    },
  ],
  skills: [
    {
      category: "Languages",
      items: ["TypeScript", "JavaScript", "Python", "Go", "SQL"],
    },
    {
      category: "Frontend",
      items: ["React", "Next.js", "Tailwind CSS", "HTML/CSS", "Accessibility"],
    },
    {
      category: "Backend & Data",
      items: ["Node.js", "REST", "PostgreSQL", "Redis"],
    },
    {
      category: "Tooling",
      items: ["Git", "Docker", "CI/CD", "Vercel", "Playwright"],
    },
  ],
  projects: [
    {
      name: "This Portfolio",
      description:
        "Data-driven personal site with auto-synced anime/manga lists and an aggregated articles feed.",
      link: "https://github.com/PadalaTanish30/portfolio",
      tech: ["Next.js", "TypeScript", "Tailwind CSS"],
    },
    {
      name: "Project Two",
      description: "A short description of a project you're proud of.",
      link: "https://example.com",
      tech: ["React", "Node.js"],
    },
  ],
  certifications: [
    {
      name: "Example Certification",
      issuer: "Issuing Body",
      year: "2024",
      link: "https://example.com",
    },
  ],
});
