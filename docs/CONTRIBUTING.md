# Contributing to PS5 Jailbreak Checker

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all skill levels and backgrounds.

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Use the bug report template when creating a new issue
3. Include your browser, OS, and any relevant serial number format (redacted)
4. Provide steps to reproduce the issue

### Suggesting Features

1. Open an issue with the "feature request" label
2. Describe the feature and its use case
3. Be open to discussion and feedback

### Submitting Code

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Write or update tests
5. Ensure all tests pass: `npm test`
6. Ensure the build works: `npm run build`
7. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 20+
- npm 10+

### Getting Started

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/is-my-ps5-jailbreakable.git
cd is-my-ps5-jailbreakable

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build
```

### Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   └── ui/          # Reusable UI components
├── lib/
│   ├── serial-validator/  # Serial number validation logic
│   └── i18n/        # Internationalization
├── types/           # TypeScript type definitions
└── styles/          # Additional styles

tests/
├── unit/            # Unit tests
└── setup.ts         # Test setup

public/
├── locales/         # Translation files
└── images/          # Static images
```

## Code Standards

### TypeScript

- Use TypeScript for all new code
- Use proper types (avoid `any`)
- Export types from dedicated type files

### Styling

- Use Tailwind CSS utility classes
- Follow the PS5 design system defined in `globals.css`
- Use CSS custom properties for theme values

### Testing

- Write tests for all new logic
- Maintain test coverage above 80%
- Use descriptive test names

### Commits

- Use conventional commit messages:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `test:` for test changes
  - `refactor:` for code refactoring
  - `style:` for formatting changes

## Adding Translations

1. Copy `public/locales/en.json` to a new file with the language code (e.g., `public/locales/pt.json`)
2. Translate all strings
3. Add the language to `src/lib/i18n/config.ts`
4. Test the translation by switching languages

## Updating Serial Number Data

If you have new serial number data:

1. Reference the source (PSDevWiki, community reports, etc.)
2. Update rules in `src/lib/serial-validator/firmware-detector.ts`
3. Add corresponding tests
4. Document the data source in your PR

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
