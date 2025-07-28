# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Development**: `pnpm dev` - Starts development server on port 3000
- **Build**: `pnpm build` - Creates production build using Vite
- **Start**: `pnpm start` - Runs the built application
- **Preview**: `pnpm serve` - Preview production build locally
- **Test**: `pnpm test` - Run test suite with Vitest
- **Lint**: `pnpm lint` - Lint code with Biome
- **Format**: `pnpm format` - Format code with Biome
- **Check**: `pnpm check` - Run both linting and formatting checks with Biome

Use `pnpm` as the package manager (configured via packageManager field).

## Architecture

This is a React application built with **TanStack Start** (full-stack React framework) featuring:

### Core Stack
- **TanStack Start**: Full-stack React framework with file-based routing
- **TanStack Router**: Type-safe routing with automatic route tree generation
- **React Three Fiber + Drei**: 3D graphics and animations using Three.js
- **Tailwind CSS**: Utility-first styling (v4)
- **TypeScript**: Strict type checking enabled
- **Vite**: Build tool and development server

### Project Structure
- `src/routes/`: File-based routing (generates `routeTree.gen.ts`)
- `src/components/`: Reusable React components
- `src/shaders/`: GLSL shader files (.frag, .vert) for WebGL effects
- `src/app/`: Application middleware and configuration

### Key Features
- **3D Graphics**: Sun component with custom shaders for fire effects
- **Sentry Integration**: Error tracking and performance monitoring configured
- **Server Functions**: TanStack Start server-side functionality
- **Path Aliases**: `@/*` maps to `src/*` (configured in tsconfig.json)

### Code Style
- **Biome**: Used for linting and formatting (replaces ESLint/Prettier)
- **Tab indentation** and **double quotes** (configured in biome.json)
- **Strict TypeScript**: All strict options enabled including noUnusedLocals

### Sentry Guidelines
When working with server functions (`createServerFn`), instrument them with Sentry:

```tsx
import * as Sentry from '@sentry/tanstackstart-react'

Sentry.startSpan({ name: 'Operation name' }, async () => {
  // Server function implementation
})
```

### WebGL/Shaders
- GLSL shaders in `src/shaders/` are imported as raw strings via `?raw` suffix
- Shader materials use Three.js uniforms for time, resolution, and aspectRatio
- Custom shader components should follow the pattern in `Sun.tsx`

## Development Notes

- Route tree is auto-generated; don't manually edit `routeTree.gen.ts`
- TanStack Router DevTools are enabled in development
- Vite plugins include: React, TypeScript paths, Tailwind, GLSL, TanStack Start
- The app uses React 19 and modern JavaScript features (ES2022 target)