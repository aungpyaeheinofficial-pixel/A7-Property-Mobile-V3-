# Myanmar Home Discovery — UI Design System

## Brand personality

**Trustworthy, premium, modern Myanmar lifestyle, simple, warm.** The visual system combines the calm confidence of deep jade with warm limestone surfaces and restrained copper accents. Premium means clarity and material quality—not visual excess.

## 1. Brand color system

### Primary — Jade

| Token | Hex | Use |
|---|---:|---|
| Jade 900 | `#123C33` | Hero panels, footer, high-trust moments |
| Jade 800 | `#194E42` | Primary buttons, selected controls |
| Jade 700 | `#236457` | Hover/active accents |
| Jade 100 | `#DDECE7` | Soft status and selected surfaces |
| Jade 50 | `#EFF7F4` | Trust backgrounds |

### Secondary — Warm sand

| Token | Hex | Use |
|---|---:|---|
| Sand 500 | `#C9A875` | Warm brand detail |
| Sand 200 | `#E9D9BF` | Dividers, subtle highlights |
| Sand 100 | `#F3EBDD` | Feature surfaces |

### Accent — Copper

| Token | Hex | Use |
|---|---:|---|
| Copper 600 | `#B7653D` | Small highlights, important counts |
| Copper 100 | `#F5DED2` | Warm accent backgrounds |

Copper is never the primary CTA color and should cover less than 10% of a screen.

### Background and neutral colors

| Token | Hex | Use |
|---|---:|---|
| Canvas | `#F8F7F3` | Default warm page background |
| Surface | `#FFFFFF` | Cards and controls |
| Stone 100 | `#ECEAE4` | Borders/dividers |
| Stone 300 | `#C9C6BE` | Disabled icons |
| Ink 900 | `#17211E` | Primary text |
| Ink 600 | `#58615D` | Secondary text |
| Ink 400 | `#7B837F` | Metadata |
| Success | `#24825F` | Verified/success state |
| Warning | `#B77722` | Attention/freshness |
| Danger | `#B64949` | Reports/errors |

Text and interactive-state combinations must meet WCAG AA contrast. Never communicate verification by color alone; pair it with an icon and label.

## 2. Typography

### English

- **Family:** Inter
- **Display:** 56/60, weight 600, letter spacing −2%; mobile 38/43
- **H1:** 44/50, 600; mobile 32/38
- **H2:** 34/41, 600; mobile 27/33
- **H3:** 24/31, 600
- **Body large:** 18/29, 400
- **Body:** 16/25, 400
- **Small:** 14/21, 450
- **Caption:** 12/18, 500

### Myanmar

- **Family:** Noto Sans Myanmar
- Add roughly 10–15% more line height than the corresponding English style.
- Avoid tight letter spacing and all-caps transformations.
- Mixed-language strings inherit Noto Sans Myanmar first, then Inter.
- Buttons may grow vertically rather than clipping or reducing type size.

## 3. Design rules

### Spacing

Base unit: **4px**. Core scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 112`.

- Mobile page gutter: 20px
- Tablet gutter: 32px
- Desktop content max-width: 1240px; gutter 40px
- Section rhythm: 72px mobile, 112px desktop
- Card internal spacing: 16–24px

### Border radius

- Small controls/chips: 10px or pill
- Inputs/buttons: 14px
- Cards: 20px
- Hero/feature panels: 28–32px
- Images inherit the container radius; avoid mixing more than two radii in one component.

### Shadows

- Default card: `0 8px 30px rgba(18, 60, 51, 0.07)`
- Floating control: `0 12px 36px rgba(18, 33, 30, 0.12)`
- Focused overlay: `0 18px 60px rgba(18, 33, 30, 0.16)`
- Shadows are soft and green-tinted; borders remain visible. No heavy black drop shadows.

### Buttons

- Minimum height: 48px; mobile touch target never below 44px.
- Primary: Jade 800 fill, white label, 14px radius.
- Secondary: white or transparent surface, Ink 900 label, Stone border.
- Tertiary: text only with clear hover/focus background.
- Icon-only buttons require an accessible label and at least 44×44px.
- Loading keeps button width stable and uses a calm spinner; disabled state is visibly distinct.

### Cards

- Image-led with 4:3 property photography.
- Title wraps to two lines maximum; location and key facts remain readable.
- Price is visually dominant after the image.
- Verification and recency live near the facts, not hidden at the bottom.
- Hover raises 3–4px and slightly enlarges the image; information never moves dramatically.

### Inputs

- 52–56px height, 14px radius, warm white background.
- Persistent labels or descriptive button-like selectors; placeholders never carry essential meaning.
- Focus ring: 3px translucent jade plus 1px Jade 700 border.
- Error message is plain language, placed directly below, and never color-only.

### Navigation

- Desktop: 72px calm top bar with logo, primary discovery links, and profile control.
- Mobile: compact 64px header plus fixed bottom navigation for Home, Search, Saved, and Profile.
- Active states use both weight and a shape/color cue.
- Search remains reachable from every discovery screen.

## 4. Animation rules

### Page transition

- 180–240ms opacity and 8–12px vertical movement.
- Use ease-out: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Preserve scroll position for return-to-results flows.

### Hover and press

- Cards: 220ms lift and image scale up to 1.025.
- Buttons: 140ms color change; pressed scale no lower than 0.98.
- Favorite: 180ms scale/opacity confirmation without celebratory clutter.
- Do not animate large page regions on every scroll.

### Loading

- Use content-shaped skeletons with a subtle warm shimmer, never a full-page spinner.
- Images fade in over 180ms after decode.
- AI recommendations show a calm three-dot “thinking” pulse plus a plain-language status.
- Under poor networks, show text and key facts first, then photography.

### Reduced motion

Honor `prefers-reduced-motion`: remove transforms, parallax, and repeated pulses; retain instant state changes and focus visibility.

## Photography direction

Real architectural photography with natural daylight, plausible Myanmar/Southeast Asian materials, subtle lived-in warmth, and honest proportions. Avoid extreme wide-angle distortion, glossy CGI, impossible skylines, people, text, and logos.

