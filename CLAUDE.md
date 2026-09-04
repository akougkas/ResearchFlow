# Repository guidance

Gnosis Tasks is a local-first research work manager and part of the Gnosis Research Center toolkit.

## Commands

```bash
npm ci
npm run check
python3 -m http.server 8000
BASE_URL='http://127.0.0.1:8000/?demo=1' npm run test:e2e
```

## Engineering rules

- Preserve atomic workspace import and dependency-cycle validation.
- Never overwrite a non-empty workspace when seeding demo data.
- Do not add simulated AI features. Integrations with GnosisAI must be evidence-grounded and clearly
  marked as suggestions.
- Keep the runtime build-free until a concrete requirement justifies additional infrastructure.
- Treat browser storage as user data and maintain JSON export/import compatibility.
- Run `npm run check` and the browser journey before committing user-facing changes.

## Product language

Use “research work” or “research item” in user-facing copy. The product name is “Gnosis Tasks.”
Research areas currently map to literature, experiments, analysis, writing, funding, and
communication.
