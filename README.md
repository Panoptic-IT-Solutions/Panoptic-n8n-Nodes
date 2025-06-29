# Gemini n8n Nodes Monorepo

This monorepo contains n8n community nodes for various integrations.

## Packages

- **[n8n-nodes-autotask](./packages/n8n-nodes-autotask/)** - Autotask PSA integration
- **[n8n-nodes-datto-rmm](./packages/n8n-nodes-datto-rmm/)** - Datto RMM integration

## Development

This project uses pnpm workspaces for monorepo management.

### Prerequisites

- Node.js >= 18.10
- pnpm >= 9.1

### Installation

```bash
pnpm install
```

### Building

Build all packages:
```bash
pnpm build
```

Build a specific package:
```bash
pnpm --filter n8n-nodes-autotask build
pnpm --filter n8n-nodes-datto-rmm build
```

### Development

Run development mode for all packages:
```bash
pnpm dev
```

Run development mode for a specific package:
```bash
pnpm --filter n8n-nodes-autotask dev
pnpm --filter n8n-nodes-datto-rmm dev
```

### Linting and Formatting

```bash
# Lint all packages
pnpm lint

# Fix linting issues
pnpm lintfix

# Format code
pnpm format
```

## Package Structure

Each package follows the standard n8n node structure:

```
packages/n8n-nodes-{service}/
├── credentials/           # Authentication credentials
├── nodes/                # Node implementations
│   └── {Service}/
│       ├── {Service}.node.ts
│       ├── {Service}Trigger.node.ts
│       ├── resources/    # API resource definitions
│       ├── operations/   # Operation implementations
│       ├── helpers/      # Utility functions
│       └── types/        # TypeScript definitions
├── package.json
└── tsconfig.json
```

## Contributing

1. Make changes in the appropriate package directory
2. Run tests and linting
3. Build the package to ensure it compiles
4. Submit a pull request

## License

MIT 