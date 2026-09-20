# NEXUSPOS UI/UX Design System & Style Specification

**Brand Identity:** NEXUSPOS Enterprise Management  
**Design Foundations:** Patina Deep Teal, Light Neutral Surface, High Contrast Typography, Spatial Compactness for Touch & Desktop POS.

---

## 1. Color Palette Tokens

```css
:root {
  /* Brand Primary - Patina Teal */
  --patina: #004953;            /* Primary brand buttons, active nav, main headers */
  --patina-dark: #00333A;       /* Button hover state, deep headers */
  --patina-secondary: #266E78;  /* Secondary accents, sub-icons */
  --patina-accent: #5FAAB5;     /* Badges, border highlights */
  --patina-light: #E8F3F5;      /* Active menu background, table hover */

  /* Neutral Surfaces */
  --bg: #F2F6F7;                /* Page background canvas */
  --card-bg: #FFFFFF;           /* Card, panel, and modal background */
  --border: #D1E1E4;            /* Dividers, input outlines, table borders */
  --text-dark: #111E25;         /* Primary headings and body text */
  --text-gray: #5B6B73;         /* Subtitles, labels, timestamps */

  /* Semantic Status Tokens */
  --green: #22C55E;             /* Success, Completed, In-Stock */
  --green-light: #DCFCE7;       /* Success badge background */
  --amber: #F59E0B;             /* Warning, Low-Stock, Pending Approval */
  --amber-light: #FEF3C7;       /* Warning badge background */
  --red: #EF4444;               /* Danger, Out of Stock, Voided, Deleted */
  --red-light: #FEE2E2;         /* Danger badge background */
  --blue: #3B82F6;              /* Informational, In-Transit */
  --blue-light: #E0F2FE;        /* Info badge background */
  --purple: #8B5CF6;            /* VIP Customer, Special Tier */
  --purple-light: #F3E8FF;      /* VIP badge background */
}
```

---

## 2. Typography & Hierarchy

- **Font Family:** `'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif`
- **Scale:**
  - `Display / Page Title`: `1.25rem (20px)` | Font-weight: `900` | Line-height: `1.2`
  - `Section / Panel Title`: `1.05rem (17px)` | Font-weight: `800` | Line-height: `1.3`
  - `Card Header / Table Header`: `0.85rem (13.5px)` | Font-weight: `700` | Tracking: `0.02em`
  - `Body / Cell Text`: `0.85rem (13.5px)` | Font-weight: `500` | Line-height: `1.5`
  - `Caption / Micro Label`: `0.75rem (12px)` | Font-weight: `600` | Text-transform: `uppercase`

---

## 3. Standard Reusable Component Patterns

### 3.1 Buttons (`components/ui/Button.tsx`)
- `variant="default"`: Patina background (`#004953`), white text, subtle shadow, rounded-lg (`8px`).
- `variant="orange"`: Warm accent orange/patina secondary for primary conversion actions ("Run Payroll", "Settle Order").
- `variant="outline"`: Transparent background, 1px border (`#D1E1E4`), dark text.
- `variant="danger"`: Red-500 background, white text for destructive operations.

### 3.2 Status Badges (`components/ui/Badge.tsx`)
- `variant="success"`: Green text with light green background.
- `variant="warning"`: Amber text with light amber background.
- `variant="danger"`: Red text with light red background.
- `variant="info"`: Blue text with light blue background.

### 3.3 Tables & Data Displays
- Sticky header row with light patina/gray background (`#F8FAFA`).
- Alternating subtle row border (`border-b border-border`).
- Row hover highlight: `hover:bg-patina-light/40 transition-colors`.
- Numeric currency columns aligned to the right with monospace tabular figures (`font-mono`).

---

## 4. Universal UI States (Mandatory on Every View)

1. **Loading State:** Shimmer skeleton placeholders matching the exact card/table geometry (`LoadingSkeleton`).
2. **Empty State:** Illustrated empty icon, descriptive title, explanation subtitle, and direct primary action button ("No products found - Add your first product").
3. **Error State:** Alert banner with actionable retry button and developer diagnostic error code.
4. **Permission Denied:** Clean lock screen indicating required role/permission and a button to return to dashboard.
