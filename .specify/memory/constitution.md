<!--
Sync Impact Report
Version change: 0.0.0 -> 1.0.0
Modified principles:
- Template placeholder -> I. Dependency Discipline
- Template placeholder -> II. Code Quality as a Deliverable
- Template placeholder -> III. Complete Test Coverage for Changed Behavior
- Template placeholder -> IV. Mandatory Code Review
Added sections:
- Project Constraints
- Development Workflow & Quality Gates
Removed sections:
- Template placeholder section names and example comments
Templates requiring updates:
- UPDATED .specify/templates/plan-template.md
- UPDATED .specify/templates/spec-template.md
- UPDATED .specify/templates/tasks-template.md
- UPDATED .agents/skills/speckit-tasks/SKILL.md
- UPDATED .agents/skills/speckit-implement/SKILL.md
- REVIEWED .specify/templates/commands/*.md not present in this project
- REVIEWED AGENTS.md no principle references to update
Follow-up TODOs:
- None
-->

# GitHub Ranking Constitution

## Core Principles

### I. Dependency Discipline

New runtime, build, test, or tooling dependencies MUST be justified before use.
The plan MUST record the dependency name, purpose, alternatives considered,
versioning or security considerations, and expected maintenance cost. Existing
project utilities, platform APIs, and standard libraries MUST be preferred when
they satisfy the requirement clearly. Dependencies MUST NOT be introduced only
for convenience when a small local implementation is simpler to maintain.

Rationale: every dependency expands the security, build, upgrade, and review
surface of the project.

### II. Code Quality as a Deliverable

Code quality is part of the feature, not follow-up polish. Production code MUST
be cohesive, readable, and consistent with existing project structure, naming,
typing, validation, and error-handling patterns. Broad refactors, new
architectural layers, or generated code MUST have explicit scope and rationale
in the plan. Hidden side effects, vague names, dead code, and unbounded
complexity MUST be corrected before a change is considered complete.

Rationale: durable code keeps future feature work fast, reviewable, and safe.

### III. Complete Test Coverage for Changed Behavior

Every feature, fix, refactor, and dependency change MUST include automated tests
for the changed behavior. Tests MUST cover the primary path, important edge
cases, failure modes, and integration boundaries described by the specification
and plan. Relevant unit, integration, contract, UI, or end-to-end tests MUST be
included based on the affected surface. If a test cannot be automated, the plan
and tasks MUST record the reason, manual verification steps, and owner.

Rationale: tests are the executable proof that the specification still works as
the code evolves.

### IV. Mandatory Code Review

Every mergeable change MUST receive code review before merge. Review MUST verify
dependency discipline, code quality, test completeness, specification alignment,
and operational risk. Solo work MUST include an explicit self-review record with
the same checklist. Review comments about correctness, security, maintainability,
or missing tests MUST be resolved or explicitly accepted before merge.

Rationale: review catches design drift and quality gaps that local validation
cannot reliably expose.

## Project Constraints

The existing project structure and toolchain are the default. New frameworks,
services, package managers, build systems, or architectural layers MUST be
approved through the plan's Constitution Check before implementation. Public
contracts, data shapes, and migration behavior MUST remain backward-compatible
unless the specification identifies a breaking change and the plan documents the
migration path. Secrets, credentials, and environment-specific values MUST NOT
be hard-coded in source, specs, or tests.

## Development Workflow & Quality Gates

Specifications MUST define independently testable user stories, explicit edge
cases, and measurable outcomes. Plans MUST pass the Constitution Check before
research starts and again after design artifacts are produced. Task lists MUST
include dependency-audit tasks, test tasks for every changed behavior,
implementation tasks, validation tasks, and code-review preparation tasks.
Implementation MUST run the relevant lint, type, build, and test commands before
completion. Code review MUST happen after validation evidence is available.

## Governance

This constitution supersedes conflicting project practices, templates, plans,
tasks, and generated guidance. Amendments MUST include a rationale, the proposed
text, impacted templates or workflows, and a semantic version bump. Changes MUST
be reviewed before they govern new work.

Versioning follows semantic versioning:

- MAJOR: removes or redefines principles, weakens mandatory gates, or introduces
  backward-incompatible governance.
- MINOR: adds principles, sections, gates, or materially expands obligations.
- PATCH: clarifies wording without changing obligations.

Compliance review is mandatory during planning and code review. Violations MUST
be fixed before work proceeds, or documented as an exception with owner,
expiration, mitigation, and reviewer approval.

**Version**: 1.0.0 | **Ratified**: 2026-05-16 | **Last Amended**: 2026-05-16
