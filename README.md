# Report Writer

AI-powered research report writing application built with a modern monorepo architecture.

## Architecture

This project uses a monorepo structure with the following components:

- **apps/web** - React SPA with Vite
- **apps/sandbox** - Python FastAPI service for code execution
- **convex/** - Convex backend for real-time data and business logic
- **packages/shared-types** - Shared TypeScript types across services

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Python >= 3.11

### Installation

```bash
pnpm install
```

### Development

```bash
# Run all linters
pnpm run lint

# Run all tests
pnpm run test

# Run integration tests
pnpm run test:integ

# Run E2E tests
pnpm run test:e2e

# Run full CI suite
pnpm run test:ci
```

## Documentation

See the [docs/](./docs/) directory for detailed documentation.

## License

MIT - See [LICENSE](./LICENSE) file for details.
