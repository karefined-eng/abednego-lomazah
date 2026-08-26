# Security Policy

## Supported versions

Security fixes are prioritized for the latest `main` branch and the current published website deployment. Older deployments or archived commits may not receive fixes.

| Version or channel | Security support |
|---|---|
| Current production deployment | Supported |
| `main` | Supported for active development |
| Older deployments | Best effort only |

## Reporting a vulnerability

Please do **not** report security vulnerabilities in a public GitHub issue, discussion, pull request, or website contact form.

Use GitHub's private vulnerability reporting flow from the repository's **Security** tab. If that option is unavailable, contact the repository maintainers privately through GitHub and include the affected URL or file, commit or deployment identifier, browser details, reproduction steps, impact, and any proof-of-concept needed to verify the issue.

Please redact passwords, API keys, authentication tokens, cookies, personal data, and other secrets from reports. Use safe placeholder values when demonstrating an issue.

## Scope

This policy covers the static website HTML, JavaScript and CSS assets, contact or request workflows, privacy and administrative pages, generated sitemap and robots files, dependency/build configuration, and the GitHub Actions SEO workflow.

Reports about third-party hosting providers or external services should also be submitted through the relevant provider's security channel when the issue is outside this repository.

## Response expectations

The maintainers will acknowledge a report when practical, investigate the issue, and coordinate a fix or mitigation. Please allow reasonable time for triage, deployment, and cache propagation before making details public.

When a fix is released, the project may publish a security note describing affected deployments, impact, and the recommended upgrade or mitigation. Reporter credit will be given only with permission.
