# Contributing to Event Scraper

Thank you for your interest in contributing to the Event Scraper project!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/event-scraper.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`

## Development

### Project Structure

```
event-scraper/
├── src/
│   ├── index.js        # Main entry point
│   ├── scraper.js      # Puppeteer-based scraper
│   ├── simpleScraper.js # Fallback scraper (axios + cheerio)
│   ├── cloudflare.js   # Cloudflare KV integration
│   └── strapi.js       # Strapi CMS integration
├── test/
│   └── test.js         # Tests
├── .github/
│   └── workflows/      # CI/CD workflows
└── package.json
```

### Making Changes

1. Make your changes in a feature branch
2. Add tests if applicable
3. Run tests: `npm test`
4. Check for security issues: `npm audit`
5. Commit your changes with clear commit messages

### Testing

Run the test suite:
```bash
npm test
```

Test the scraper locally:
```bash
npm start
```

### Code Style

- Use 2 spaces for indentation
- Use semicolons
- Add JSDoc comments for functions
- Keep functions small and focused
- Handle errors appropriately

### Commit Messages

Use clear and descriptive commit messages:
- `feat: add new feature`
- `fix: resolve bug in scraper`
- `docs: update README`
- `test: add tests for cloudflare integration`
- `chore: update dependencies`

## Submitting Changes

1. Push your changes to your fork
2. Create a Pull Request
3. Describe your changes clearly
4. Link any related issues

## Reporting Bugs

When reporting bugs, please include:
- Node.js version
- Steps to reproduce
- Expected vs actual behavior
- Error messages or logs
- Environment details (OS, Docker, etc.)

## Feature Requests

We welcome feature requests! Please:
- Check if the feature already exists
- Describe the use case clearly
- Explain why it would be valuable

## Questions?

Feel free to open an issue for questions or discussions.

Thank you for contributing! 🎉
