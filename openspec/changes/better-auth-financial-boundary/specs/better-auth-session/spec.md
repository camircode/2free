# Better Auth Session Specification

## Purpose

Provide one authenticated identity/session boundary for Next.js and the Node API.

## Requirements

### Requirement: Shared Better Auth session foundation

The system MUST configure Better Auth 1.6.23 with Prisma, MUST require an explicit non-default secret, and MUST fail startup when that secret is absent or default. Next.js and the API MUST validate the same session identity.

#### Scenario: Safe startup
- GIVEN the auth secret is absent or default
- WHEN the service starts
- THEN startup MUST fail closed with a configuration error

#### Scenario: Cross-runtime session
- GIVEN a valid Better Auth session
- WHEN Next.js and the Node API validate it using request headers
- THEN both MUST resolve the same user identity

#### Scenario: Missing, invalid, expired, or forged session
- GIVEN a request has no session, an invalid or expired session, or a forged session identity
- WHEN Next.js or the Node API handles it
- THEN it MUST fail closed, expose no financial data, and perform no financial mutation

### Requirement: Next.js authentication integration

The system MUST expose the Better Auth catch-all through `toNextJsHandler`, read sessions with `auth.api.getSession({ headers })`, and finalize Server Action cookie access with `nextCookies()`. Authentication screens MUST remain Spanish, including “Iniciar sesión” and “Crear cuenta”.

#### Scenario: Authenticated Server Action
- GIVEN a valid session cookie is forwarded to a Server Action
- WHEN the action reads the session
- THEN it MUST resolve the user and preserve response cookies

#### Scenario: Unauthenticated Spanish UI
- GIVEN a visitor opens sign-in or sign-up
- WHEN the form is rendered
- THEN it MUST show Spanish labels and MUST NOT create a financial session

### Requirement: Browser transport hardening

The system MUST enforce trusted origins, CSRF protection, secure cookie policy, credentialed CORS, and proxy-aware HTTP/HTTPS behavior without weakening session validation. Session cookies MUST use secure, HttpOnly, SameSite, and scoped Path/Domain attributes appropriate to deployment. Credentialed requests MUST be allowed only from an explicit trusted-origin allowlist.

#### Scenario: Untrusted origin
- GIVEN a state-changing request comes from an untrusted origin
- WHEN it reaches an auth or finance endpoint
- THEN it MUST be rejected without mutation

#### Scenario: Proxied secure request
- GIVEN HTTPS terminates at a trusted proxy
- WHEN the browser sends a credentialed request
- THEN cookie and origin decisions MUST use the trusted external scheme and host

#### Scenario: Cookie and credentialed-origin policy
- GIVEN a browser uses a session cookie and sends a credentialed request
- WHEN the response and CORS policy are evaluated
- THEN the cookie MUST have the required secure attributes and the origin MUST be allowed only if it is on the trusted allowlist
