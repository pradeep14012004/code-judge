# Contributing to CodeJudge

Thank you for considering a contribution.

## Before you start

- Check existing issues and pull requests to avoid duplicate work.
- For significant changes, open an issue first to discuss the approach.
- For security vulnerabilities, do not open a public issue; follow [SECURITY.md](SECURITY.md).

## Development setup

1. Install Git, Node.js 20 or later, and Docker with the Compose plugin.
2. Clone the repository and copy `.env.example` to `.env`.
3. Set a unique local `JWT_SECRET` and database password.
4. Start the source-built stack with:

   ```bash
   docker compose -f docker-compose.prod.yml up --build
   ```

## Pull request expectations

- Keep changes focused and explain the problem they solve.
- Update documentation and environment examples when behavior or configuration changes.
- Never commit secrets, personal data, generated build output, or local environment files.
- Add tests for behavior changes where practical.
- Run the frontend production build and JavaScript syntax checks before submitting.
- Explain security implications, especially for code execution, authentication, authorization, file uploads, and database access.
- Do not describe the current submission runner as a secure sandbox.

## Commit and review

Use clear commit messages (for example, `fix: validate submission payload` or `docs: clarify local deployment`). A maintainer will review correctness, maintainability, documentation, and security impact. Passing CI is necessary but does not guarantee a change is safe.
