# Financial Chart Presentation Specification

## Purpose

Present synthetic investment, yield/return, and stock fixtures responsively with equivalent accessible text.

## Requirements

### Requirement: Declarative responsive finance charts

Charts MUST use D3 array calculations, scales, and shapes with declarative React SVG output, responsive `viewBox` behavior, and no financial calculation or data-fetching responsibility.

#### Scenario: Chart rendering

- GIVEN synthetic investment, yield, or stock series
- WHEN a chart renders
- THEN its SVG communicates the supplied series through declarative marks and a responsive viewBox

#### Scenario: Narrow viewport

- GIVEN the chart is rendered at the smallest supported width
- WHEN labels and marks are laid out
- THEN essential information remains readable without horizontal overflow

### Requirement: Semantic chart equivalent

Every chart MUST expose a programmatically associated Spanish text summary containing its title, series meaning, and supplied values or status.

#### Scenario: Non-visual interpretation

- GIVEN a user cannot perceive SVG graphics
- WHEN the chart is inspected
- THEN the equivalent text communicates the same essential investment, yield/return, or stock information

#### Scenario: Unavailable series

- GIVEN a series is unavailable or empty
- WHEN the chart renders
- THEN it exposes a Spanish unavailable/empty explanation and no invented values
