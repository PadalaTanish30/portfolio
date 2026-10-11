import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { Download, ExternalLink } from "lucide-react";
import { profile } from "@/data/profile";
import { resume } from "@/data/resume";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/card";
import { Badge } from "@/components/badge";
import { PrintButton } from "@/components/print-button";

export const metadata: Metadata = {
  title: "Résumé",
  description: `The résumé of ${profile.name} — experience, skills, projects and education.`,
};

function hasResumePdf(): boolean {
  try {
    return existsSync(join(process.cwd(), "public", "resume.pdf"));
  } catch {
    return false;
  }
}

export default function ResumePage() {
  const pdfAvailable = hasResumePdf();

  return (
    <Container size="narrow">
      <PageHeader
        eyebrow="Résumé"
        title={profile.name}
        description={resume.summary}
        actions={
          <div className="no-print flex flex-wrap gap-2">
            {pdfAvailable ? (
              <a
                href="/resume.pdf"
                download
                className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download PDF
              </a>
            ) : null}
            <PrintButton />
          </div>
        }
      />

      <div className="space-y-10">
        <section>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">
            Experience
          </h2>
          <ol className="space-y-4 border-l border-border pl-5">
            {resume.experience.map((job) => (
              <li
                key={`${job.company}-${job.role}-${job.start}`}
                className="relative"
              >
                <span
                  className="absolute -left-[1.65rem] top-1.5 h-2.5 w-2.5 rounded-full bg-primary"
                  aria-hidden="true"
                />
                <Card>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-semibold">
                      {job.role} ·{" "}
                      <span className="text-primary">{job.company}</span>
                    </h3>
                    <p className="text-sm text-muted">
                      {job.start} – {job.end}
                      {job.location ? ` · ${job.location}` : ""}
                    </p>
                  </div>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted">
                    {job.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                  {job.tech.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {job.tech.map((tech) => (
                        <Badge key={tech}>{tech}</Badge>
                      ))}
                    </div>
                  ) : null}
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">
            Education
          </h2>
          <div className="space-y-4">
            {resume.education.map((item) => (
              <Card key={`${item.school}-${item.degree}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold">{item.degree}</h3>
                  <p className="text-sm text-muted">
                    {item.start} – {item.end}
                    {item.location ? ` · ${item.location}` : ""}
                  </p>
                </div>
                <p className="text-sm text-primary">{item.school}</p>
                {item.highlights.length > 0 ? (
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted">
                    {item.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                ) : null}
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Skills</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {resume.skills.map((group) => (
              <Card key={group.category}>
                <h3 className="text-sm font-semibold">{group.category}</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <Badge key={item} variant="neutral">
                      {item}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">
            Projects
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {resume.projects.map((project) => (
              <Card key={project.name}>
                <h3 className="font-semibold">
                  {project.link ? (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      {project.name}
                      <ExternalLink
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    </a>
                  ) : (
                    project.name
                  )}
                </h3>
                <p className="mt-1 text-sm text-muted">{project.description}</p>
                {project.tech.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.tech.map((tech) => (
                      <Badge key={tech} variant="primary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        </section>

        {resume.certifications.length > 0 ? (
          <section>
            <h2 className="mb-4 text-xl font-semibold tracking-tight">
              Certifications
            </h2>
            <div className="space-y-2">
              {resume.certifications.map((cert) => (
                <Card
                  key={cert.name}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <p className="font-medium">{cert.name}</p>
                  <p className="text-sm text-muted">
                    {cert.issuer}
                    {cert.year ? ` · ${cert.year}` : ""}
                  </p>
                </Card>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {!pdfAvailable ? (
        <p className="no-print mt-8 text-xs text-muted">
          Tip: add a PDF at <code className="font-mono">public/resume.pdf</code>{" "}
          to enable the download button.
        </p>
      ) : null}
    </Container>
  );
}
