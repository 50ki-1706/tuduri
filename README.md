# next-starter

This is a starter template for monorepo projects using Next.js. It includes a set of tools and configurations to help you get started quickly with building full-stack applications.

## Features
- [pnpm](https://pnpm.io/) A package manager that is fast and efficient.
- [Next.js 16](https://nextjs.org/) A React framework for building full-stack applications.
- [Biome](https://biomejs.dev/) A fast and extensible code formatter and linter.
- [BetterAuth](https://better-auth.com) A simple and secure authentication library for Next.js.
- [Tailwind CSS](https://tailwindcss.com/) A utility-first CSS framework for rapid UI development.
- [orpc](https://orpc.dev) A type-safe, OpenAPI-compatible RPC framework for Next.js.
- [Drizzle ORM](https://orm.drizzle.team/) A TypeScript ORM for SQL databases.
- [SQLite](https://www.sqlite.org/index.html) A lightweight, file-based SQL database.
- [Storybook](https://storybook.js.org/) A tool for developing UI components in isolation.
- Experimental support for tsgo for type checking.


## Getting Started

### Prerequisites

- **Node.js** 22+ (node24 by default)
- **pnpm** 11+ 
- **cocogitto** (via mise: `mise install`, or via cargo: `cargo install cocogitto`, or via brew: `brew install cocogitto`)
Use `corepack enable pnpm` and `pnpm install`
If you use node25+, install corepack globally with `npm install -g corepack` first.

### 1. Clone and Install

    git clone <repository-url>
    cd <cloned-directory>
    pnpm install

### 2. Commit Convention Setup

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.
Commit messages are validated locally via [cocogitto](https://docs.cocogitto.io/).

Run the setup script to install the commit-msg hook:

    bash scripts/setup.sh

This needs to be done once after cloning. The hook validates commit messages against `cog.toml` at commit time, so no re-run is needed when `cog.toml` is updated. Re-run only if you need to reinstall the hook (e.g., after deleting it).

### 3. Environment Variables

    cp .env.local.example .env.local

Edit `.env.local` and set the following variables:

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `BETTER_AUTH_SECRET` | Yes | A random 32-byte hex string. Generate with: `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | No | Base URL of the app. Default: `http://localhost:3000` |
| `DATABASE_URL` | No | Database connection string. Default: `file:local.db` (SQLite) |

### 4. Database Setup

    pnpm db:push

This creates `local.db` with all required tables.

For version-controlled migrations, use:

    pnpm db:generate
    pnpm db:migrate

### 5. Start Development

    pnpm dev

Open [http://localhost:3000](http://localhost:3000) in your browser.

Storybook for UI component development:

    pnpm storybook

Open [http://localhost:6006](http://localhost:6006).
