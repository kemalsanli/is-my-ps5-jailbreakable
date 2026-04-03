# Getting Started Guide

This guide will help you set up and run the PS5 Jailbreak Checker locally.

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/kemalsanli/is-my-ps5-jailbreakable.git
cd is-my-ps5-jailbreakable
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js, React, TypeScript
- Tailwind CSS for styling
- Vitest for testing
- All development dependencies

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Commands

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run build        # Build for production (static export)
npm start            # Not used (we use static export)

# Testing
npm test             # Run all tests
npm run test:unit    # Run unit tests with coverage
npm run test:watch   # Run tests in watch mode

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
npm run format       # Format code with Prettier

# Utilities
npm run clean        # Remove build artifacts
```

## Project Structure Overview

```
is-my-ps5-jailbreakable/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── SerialForm.tsx  # Main form
│   │   ├── ResultDisplay   # Result display
│   │   └── ...
│   ├── lib/
│   │   ├── serial-validator/  # Core validation logic
│   │   └── i18n/           # Internationalization
│   └── types/              # TypeScript types
├── public/                 # Static assets
│   ├── images/            # Images
│   └── locales/           # Translation JSON files
├── tests/                 # Test files
└── docs/                  # Documentation
```

## Development Workflow

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make your changes**
   - Edit files in `src/`
   - The dev server auto-reloads

3. **Test your changes**
   ```bash
   npm test
   npm run build  # Ensure it builds
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature
   ```

### Hot Reload

The development server supports hot module replacement (HMR):
- Changes to `.tsx` files reload instantly
- Changes to `.css` files update without refresh
- Changes to `public/` require manual refresh

### Adding a New Component

1. Create file in `src/components/YourComponent.tsx`
2. Export the component
3. Import and use it in your pages

Example:

```tsx
// src/components/MyComponent.tsx
'use client';

export function MyComponent() {
  return <div>Hello!</div>;
}

// src/app/page.tsx
import { MyComponent } from '@/components/MyComponent';

export default function Page() {
  return <MyComponent />;
}
```

### Adding a New Translation

1. Add key to `public/locales/en.json`
2. Add translations to other language files
3. Use in components:

```tsx
const { t } = useTranslation();
return <p>{t.yourKey.nestedKey}</p>;
```

### Updating Serial Number Logic

1. Edit `src/lib/serial-validator/firmware-detector.ts`
2. Add/modify firmware rules
3. Write tests in `tests/unit/firmware-detector.test.ts`
4. Run tests to verify

## Debugging

### Browser DevTools

- **React DevTools**: Install browser extension
- **Console**: Check for errors
- **Network**: Monitor requests (shouldn't be any!)
- **Lighthouse**: Run performance audits

### VS Code Debugging

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    }
  ]
}
```

### Common Issues

**Port 3000 already in use:**
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill
# Or use a different port
PORT=3001 npm run dev
```

**Module not found:**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

**Type errors:**
```bash
# Run type checker
npm run type-check
```

## Building for Production

```bash
# Build static site
npm run build

# Output is in ./out directory
# Serve locally to test
npx serve out
```

The production build:
- Optimizes JavaScript bundles
- Purges unused CSS
- Generates static HTML for all pages
- Creates a sitemap

## Environment

This project uses:
- **Node.js**: 20+
- **npm**: 10+
- **TypeScript**: 5+
- **Next.js**: 14+

Check your versions:
```bash
node --version
npm --version
```

## Next Steps

- Read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions
- Review [CREDITS.md](CREDITS.md) for attributions

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/kemalsanli/is-my-ps5-jailbreakable/issues)
- **Discussions**: [GitHub Discussions](https://github.com/kemalsanli/is-my-ps5-jailbreakable/discussions)

Happy coding! 🎮
