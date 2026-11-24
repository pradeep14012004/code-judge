# Security Policy

## Supported versions

Security fixes are currently applied to the default branch (`main`). No stable release series or support window has been declared.

## Important deployment warning

CodeJudge currently compiles and runs submitted C programs as child processes inside the submission-service container. Process timeouts and output-buffer limits do not constitute a secure sandbox. The current implementation must not be exposed to untrusted users or treated as safe for multi-tenant/public execution.

Before any public deployment, the execution service needs a separately enforced isolation boundary, least-privilege execution, disabled network access by default, strict resource limits, filesystem restrictions, and security testing. Submission and history endpoints also require a complete authentication/authorization review.

## Reporting a vulnerability

Please do not disclose vulnerabilities in public GitHub issues.

Use GitHub's **Report a vulnerability** feature on this repository (Security tab) to send a private report. Include:
- A concise description and affected component/file
- Steps to reproduce, proof of concept, and impact
- Any suggested mitigation
- Whether the issue is known to affect a deployed instance

Please allow maintainers reasonable time to investigate and prepare a fix before public disclosure. Do not include real credentials, personal data, or data belonging to other users in a report.
