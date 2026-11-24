# Security Policy

## Supported versions

Security fixes are currently applied to the default branch (`main`). No stable release series or support window has been declared.

## Important deployment warning

The submission API now places bounded jobs in a shared queue volume. A separate execution-worker container processes jobs with networking disabled, a read-only root filesystem, no-new-privileges, a minimal capability set, PID/CPU/memory/file-size limits, a bounded temporary filesystem, and a fresh unprivileged UID per job. Job processes do not receive database credentials or access to the API network.

This is defense in depth, not a complete security boundary. Containers share the host kernel, and the worker has not been independently audited. Do not expose the service to untrusted users or use it for public/multi-tenant execution until a stronger sandbox (for example gVisor or microVM isolation), authentication/authorization review, and independent security testing are completed.

## Reporting a vulnerability

Please do not disclose vulnerabilities in public GitHub issues.

Use GitHub's **Report a vulnerability** feature on this repository (Security tab) to send a private report. Include:
- A concise description and affected component/file
- Steps to reproduce, proof of concept, and impact
- Any suggested mitigation
- Whether the issue is known to affect a deployed instance

Please allow maintainers reasonable time to investigate and prepare a fix before public disclosure. Do not include real credentials, personal data, or data belonging to other users in a report.
