# Delta for UI Motion Enhancement

## MODIFIED Requirements

### Requirement: Scoped GSAP and View Transition enhancement

Motion enhancement MUST use GSAP with `@gsap/react` `useGSAP` scoped to a component root, revert effects on unmount/dependency changes, and use View Transitions only after feature detection. Neither capability may be required for correctness.
(Previously: Scoped GSAP and feature-detected View Transitions were required.)

#### Scenario: Instance isolation and cleanup
- GIVEN two motion-enabled instances render
- WHEN one updates or unmounts
- THEN only its effects revert and no callbacks, selectors, or animation resources leak

#### Scenario: Unsupported browser
- GIVEN View Transitions or GSAP enhancement is unavailable
- WHEN a state changes
- THEN the final DOM/state appears synchronously without an unsupported API call

### Requirement: Reduced-motion and failure fallback

When reduced motion is requested, or an enhancement throws or rejects, the system MUST bypass animation and complete the same state transition synchronously.
(Previously: Reduced motion and supported-enhancement failures used a synchronous fallback.)

#### Scenario: Reduced motion
- GIVEN `prefers-reduced-motion` is active
- WHEN navigation or dashboard state changes
- THEN no animation runs and the usable final state matches the animated path

#### Scenario: Runtime failure
- GIVEN a supported transition enhancement fails
- WHEN it is attempted
- THEN the failure is contained and the synchronous state transition completes

### Requirement: SSR and hydration safety

Motion code MUST NOT read browser globals or media queries during SSR render and MUST initialize capabilities only after a safe client boundary.
(Previously: Browser capabilities were deferred to protect SSR/hydration.)

#### Scenario: SSR render
- GIVEN motion components render without browser globals
- WHEN markup is produced and hydrated
- THEN rendering succeeds with stable markup and no hydration mismatch
