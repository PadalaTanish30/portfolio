import { Container } from "@/components/container";
import { ButtonLink } from "@/components/button-link";

export default function NotFound() {
  return (
    <Container
      size="narrow"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center"
    >
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">
        404
      </p>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="max-w-md text-muted">
        That page doesn&apos;t exist (or moved). Try one of these instead.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <ButtonLink href="/">Go home</ButtonLink>
        <ButtonLink href="/articles" variant="secondary">
          Articles
        </ButtonLink>
        <ButtonLink href="/connect" variant="ghost">
          Connect
        </ButtonLink>
      </div>
    </Container>
  );
}
