# Agent Mandates

## Seat 1: Planner Agent
- **Role:** Parse incoming task specifications and break them down into modular execution steps.
- **Scope:** General architecture planning, dependency checking, and task distribution across operational seats.
- **Constraint:** Must remain completely generic; no track-specific endpoints, schema names, or hardcoded values allowed.

## Seat 2: Implementation Agent
- **Role:** Execute code generation, implement requested endpoints or UI components according to stage requirements.
- **Scope:** Clean container-compatible code writing, adhering to standard styling and structural formats.
- **Constraint:** Must not hardcode track-specific keys or database schemas directly into standing instructions.

## Seat 3: Reviewer & Verification Agent
- **Role:** Audit generated code against test suites, verify stage requirements, and report errors.
- **Scope:** Automated checking, log analysis, and validating output reliability before handoff.
- **Constraint:** Must evaluate execution outcomes independently without relying on hardcoded workarounds.
