# 0001 - Record architecture decisions using MADR

- Status: accepted
- Date: 2026-10-17

## Context and Problem Statement

As the project grows, the reasoning behind design choices tends to get lost. We
want a lightweight, durable way to capture *why* decisions were made, kept next
to the code and reviewable in pull requests.

## Decision Drivers

- Low friction to write and read.
- Renders on GitHub and in editors without extra tooling.
- Immutable history of decisions, not just the current state.

## Considered Options

- MADR (Markdown Any Decision Records) files in `docs/adr/`.
- Nygard's lighter ADR format (Context / Decision / Consequences).
- A single growing `ARCHITECTURE.md` document only.
- A wiki or external doc tool.

## Decision Outcome

Chosen option: "MADR files in `docs/adr/`", because it is Markdown (renders
everywhere), has a clear and complete template, and keeps each decision as its
own immutable file. `ARCHITECTURE.md` remains as a high-level overview that links
to the ADRs.

### Consequences

- Good, because the "why" lives with the code and is reviewed like code.
- Good, because each decision is self-contained and easy to supersede.
- Bad, because it adds a small process step when making notable decisions.
- Neutral, because very small decisions still don't need an ADR.

## More Information

- MADR: https://adr.github.io/madr/
- Template: [`adr-template.md`](adr-template.md)
