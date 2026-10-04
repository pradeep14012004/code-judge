# CodeJudge

A microservices-based platform for automated programming evaluation, designed for academic labs, university assessments and coding practice.

## What it does

CodeJudge accepts programming submissions, executes them in isolated containers, evaluates the output against test cases and returns the result to the user.

### Core capabilities

- JWT-based authentication and role-based access
- Problem and test-case management
- Sandboxed code execution
- Submission history and evaluation results
- Resource limits for execution
- Docker-based deployment
- Web-based coding interface

## Architecture

```text
Web Client
    |
    v
API / Backend
    |
    +--------> Authentication
    |
    +--------> Problem Management
    |
    +--------> Submission Service
                  |
                  v
            Docker Sandbox
                  |
                  v
          Compile / Execute
                  |
                  v
            Test Evaluation
                  |
                  v
             Result API
```

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Execution | Docker |
| Authentication | JWT + bcrypt |
| Development | JavaScript, Git, Docker Compose |

> The README intentionally lists only technologies present in the current implementation. Kubernetes, Go, Vue, MongoDB, RabbitMQ and gRPC are not presented as implemented features unless they are actually present in the repository.

## Security considerations

Code execution is an untrusted-input problem. The project uses container isolation and execution/resource restrictions, but a production judge should additionally use hardened container profiles, read-only filesystems, seccomp/AppArmor, strict CPU/memory/time limits, network isolation and independent security review.

**Never expose this service directly to untrusted traffic without appropriate sandbox hardening.**

## Getting Started

Clone the repository:

```bash
git clone https://github.com/pradeep14012004/code-judge.git
cd code-judge
```

Install dependencies according to the frontend/backend package files, configure the PostgreSQL connection and environment variables, then start the services using the repository's Docker Compose configuration.

Do not commit `.env` files, database passwords, JWT secrets or other credentials.

## Workflow

1. User authenticates.
2. User selects a problem and submits code.
3. Backend validates the submission.
4. Execution service starts an isolated container.
5. Code is compiled/executed with configured limits.
6. Output is compared with test cases.
7. Evaluation status is returned and stored.

## Future Improvements

- Additional programming languages
- Stronger sandbox isolation
- Plagiarism detection
- University SSO
- Automated test coverage
- Observability and execution metrics
- Optional Kubernetes deployment

## License

See the repository license for the applicable terms.
