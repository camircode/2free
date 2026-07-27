# UI Motion Enhancement Specification

## Purpose

Enhance shell and state transitions without making motion necessary for correctness, SSR, or accessibility.

## Requirements

### Requirement: Scoped GSAP lifecycle

GSAP enhancement MUST use `@gsap/react` `useGSAP` with a component root scope, MUST keep selector work within that scope, and MUST revert animations on unmount and declared dependency changes.

#### Scenario: Instance isolation

- GIVEN two motion-enabled component instances render
- WHEN one instance updates or unmounts
- THEN only its scoped animation effects are reverted and the other instance remains unaffected

#### Scenario: Cleanup

- GIVEN a motion component unmounts or its declared state changes
- WHEN cleanup runs
- THEN inline effects and animation resources are reverted without leaked callbacks or selectors

### Requirement: Progressive transitions and motion fallback

View Transition use MUST be feature-detected and safely bypassed when unsupported. GSAP and View Transitions MUST be bypassed when reduced motion is requested, and the synchronous no-animation path MUST produce the same DOM and state result.

#### Scenario: Unsupported or reduced motion

- GIVEN View Transitions are unavailable or `prefers-reduced-motion` is active
- WHEN a state transition occurs
- THEN the state changes synchronously without animation and no unsupported API call is made

#### Scenario: Supported enhancement failure

- GIVEN a supported View Transition or animation API rejects or throws
- WHEN enhancement is attempted
- THEN the state transition still completes through the synchronous fallback

### Requirement: SSR and hydration safety

Motion code MUST NOT read `window`, `document`, or media queries during SSR render and MUST initialize browser capabilities only after a safe client boundary.

#### Scenario: SSR render

- GIVEN motion components render without browser globals
- WHEN markup is produced and hydrated
- THEN rendering succeeds, initial markup remains stable, and enhancement does not cause hydration mismatch
