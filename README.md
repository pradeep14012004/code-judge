# CodeJudge

CodeJudge is a self-hostable programming evaluation platform for academic labs, university coursework, and coding practice. It combines a React frontend with Node.js services and PostgreSQL.

> **Security status:** CodeJudge is a development/research project, not a hardened public online judge. The current submission runner compiles and executes submitted C programs as child processes inside the submission-service container. A process timeout and output-buffer limit are not an operating-system security sandbox. **Do not expose submission endpoints to untrusted users or deploy this project as a public judge until the runner has been moved into a separately isolated execution environment and independently reviewed.**

## Current capabilities

- JWT-based authentication and role-based access
- Problem and test-case management
- C source compilation and evaluation against test cases
- Submission history and verdict reporting
- PostgreSQL persistence
- Docker Compose deployment configuration
- React + Vite web interface
- Health endpoints for backend services

Capabilities and security controls are described as currently implemented; planned work is listed separately below.

## Architecture

```text
React + Vite frontend
        |
        +---- Auth service (Node.js / Express)
        |
        +---- Problem service (Node.js / Express)
        |
        +---- Submission service (Node.js / Express)
                         |
                         +---- C compiler / runner
                         |
                         +---- PostgreSQL
```

The backend services are defined under `services/`. The production-oriented Compose file builds the services from the local source tree.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Backend | Node.js, Express |
| Database | PostgreSQL 15 |
| Authentication | JWT, bcrypt |
| Container orchestration | Docker Compose |
| Current execution language | C / GCC |

## Repository layout

```text
.
├── frontend/                  # React application
├── services/
│   ├── auth-service/          # Authentication API
│   ├── problem-service/       # Problem and test-case APIs
│   └── submission-service/    # Submission and C evaluation APIs
├── init/                      # Database initialization
├── seed/                      # Seed data and test cases
├── docker-compose.yml         # Legacy image-based compose configuration
├── docker-compose.prod.yml    # Local source-build compose configuration
├── .env.example               # Environment variable template
└── README.md
```

## Run locally

### Prerequisites

- Docker Engine with the Docker Compose plugin
- Git

### Start the source-built stack

1. Clone the repository:

   ```bash
   git clone https://github.com/pradeep14012004/code-judge.git
   cd code-judge
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

3. Edit `.env`. Set a long, unique `JWT_SECRET` and a strong `DB_PASSWORD`. Do not use the example values for a shared or deployed environment.

4. Build and start the services:

   ```bash
   docker compose -f docker-compose.prod.yml up --build
   ```

5. Open the frontend at [http://localhost:5173](http://localhost:5173).

Stop the stack with:

```bash
docker compose -f docker-compose.prod.yml down
```

To remove the local database volume as well (this permanently deletes local database data):

```bash
docker compose -f docker-compose.prod.yml down -v
```

### Environment variables

See [.env.example](.env.example). Keep the real `.env` file out of version control. Rotate any credential that may have been exposed.

## Development checks

Install frontend dependencies and create a production build:

```bash
cd frontend
npm ci
npm run build
```

Install backend dependencies from each service directory using `npm ci` where a lockfile is present. The submission service currently has no committed lockfile; use `npm install` there until one is added.

Check JavaScript syntax:

```bash
find services -type f -name '*.js' -print0 | xargs -0 -n1 node --check
```

The repository's service package manifests currently contain placeholder test scripts or no test script. Automated test coverage is a work in progress; do not interpret a successful build or syntax check as proof of functional or security correctness.

## Security

Running arbitrary source code is a high-risk operation. The current runner uses child processes and resource limits but does **not** provide a complete security boundary. Before public or multi-tenant deployment, the execution worker must be isolated from the API and database, run with least privilege, have no network access by default, use strict CPU/memory/process/disk/time limits, and be protected by OS/container sandboxing. Review [SECURITY.md](SECURITY.md) before testing or deploying.

Please report suspected vulnerabilities privately using the process in [SECURITY.md](SECURITY.md). Do not publish exploit details in public issues.

## Contributing

Bug reports, documentation improvements, tests, and security hardening proposals are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Roadmap

- Isolated execution workers with defense-in-depth sandboxing
- Authentication and authorization checks on all submission and history endpoints
- Automated unit, integration, and end-to-end tests
- Reproducible local development and deployment configuration
- Additional language runtimes after the execution boundary is hardened
- Operational metrics, structured logs, and rate limiting

## License

A license has not yet been added to this repository. Until the maintainers choose and add a license, the source is publicly viewable but reuse, modification, and redistribution are not granted by default. See GitHub's documentation on [licensing a repository](https://docs.github.com/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository).
