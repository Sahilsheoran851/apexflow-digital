# ApexFlow Digital — Design System Specification (DESIGN.md)

> Executive Cyber-Luxury & High-Performance Growth Engineering System for the UAE Market.  
> Compliant with **UI UX Pro Max** & **Google Stitch DESIGN.md** standards.

---

## 1. Design Philosophy & Foundations

ApexFlow Digital combines **Apple-grade fluid physical motion**, **Linear-style high-density craft**, and **Executive UAE Cyber-Luxury**.
- **No Emojis as UI Icons**: All UI iconography uses crisp, scalable vector SVG glyphs with consistent 2px stroke weight.
- **Instant Response (0ms input latency)**: Interactive elements give instant physical feedback on `:active` and `pointerdown`.
- **Specular Glass & Multi-Layer Depth**: Translucent obsidian surfaces with hairline specular edge highlights (`inset 0 1px 1px rgba(255, 255, 255, 0.16)`).
- **Accessibility & Contrast**: Minimum 4.5:1 text contrast on all background layers; visible keyboard focus states (`:focus-visible`).

---

## 2. Color Tokens

### Background Layers
- **Canvas Void (`--bg-void`)**: `#02040a`
- **Surface Primary (`--bg-primary`)**: `#050b1a`
- **Surface Secondary (`--bg-secondary`)**: `#0a1226`
- **Surface Card Glass (`--bg-card`)**: `rgba(8, 15, 34, 0.72)`
- **Surface Card Hover (`--bg-card-hover`)**: `rgba(14, 25, 52, 0.88)`

### Brand Accents
- **Neon Cyan (Search & Web)**: `#00f2fe`
- **Neon Emerald (WhatsApp & Growth)**: `#05ffa1`
- **Neon Violet (AI & Automation)**: `#a855f7`
- **Electric Blue (Infrastructure)**: `#3b82f6`

### Text & Neutral Hierarchy
- **Text High Contrast (`--text-primary`)**: `#f8fafc` (100% white-silver)
- **Text Secondary (`--text-secondary`)**: `#94a3b8` (Slate 400)
- **Text Muted (`--text-muted`)**: `#64748b` (Slate 500)
- **Border Specular (`--border-subtle`)**: `rgba(255, 255, 255, 0.08)`
- **Border Active Glow (`--border-glow`)**: `rgba(0, 242, 254, 0.4)`

---

## 3. Typography Scale & Optical Hierarchy

- **Font Family**: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif`
- **Monospace Family**: `"JetBrains Mono", ui-monospace, monospace`

| Role | Font Size | Line Height | Tracking (Letter-Spacing) | Weight |
|---|---|---|---|---|
| **Display Hero** | `clamp(2.5rem, 5vw, 4.2rem)` | `1.08` | `-0.04em` | 800 |
| **Section Title (H2)** | `clamp(2rem, 3.5vw, 2.8rem)` | `1.15` | `-0.03em` | 800 |
| **Card Title (H3)** | `1.35rem` | `1.3` | `-0.02em` | 700 |
| **Body (Lead)** | `1.15rem` | `1.65` | `-0.012em` | 400 / 500 |
| **Body (Default)** | `0.95rem` | `1.6` | `-0.01em` | 400 |
| **Code / Micro Tags** | `0.8rem` | `1.4` | `0.04em` | 600 / 700 |

---

## 4. Elevation, Glassmorphism & Materials

```css
/* Multi-Layer Specular Glass Material */
--card-material: linear-gradient(180deg, rgba(255, 255, 255, 0.035) 0%, rgba(255, 255, 255, 0.008) 100%), rgba(6, 12, 28, 0.72);
--card-border: 1px solid rgba(255, 255, 255, 0.08);
--card-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.16), 0 20px 40px -15px rgba(0, 0, 0, 0.85);
--card-blur: blur(24px) saturate(180%);
```

---

## 5. Animation Timing Curves (WWDC Physics)

- **Apple Standard Fluid Ease**: `cubic-bezier(0.32, 0.72, 0, 1)`
- **Critically Damped Spring**: `cubic-bezier(0.16, 1, 0.3, 1)`
- **Tactile Active Press**: `scale(0.965)` in `0.08s`
- **Card Hover Elevation**: `translateY(-4px)` with luminous border transition in `0.35s`

---

## 6. Anti-Patterns to Avoid
1. ❌ **Do not use emojis as UI icons** (use standard SVG icons).
2. ❌ **Do not use harsh, unpadded grid cards** (maintain 24px internal padding and 20px squircle radius).
3. ❌ **Do not rely on layout shifts** (preserve responsive dimensions and aspect ratios).
4. ❌ **Do not use low-contrast body text** (< 4.5:1 contrast against dark background).
