# Design System Document: The Curated Manuscript

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Curated Manuscript."** 

This system rejects the "template" aesthetic of generic digital archives. Instead, it draws inspiration from high-end museum galleries and rare book rooms, where history is presented with clinical precision and editorial elegance. We achieve this through a "Digital-First Heritage" approach: using intentional asymmetry, generous white space (treated as a luxury material), and a high-contrast typographic scale that mimics a masterfully typeset journal. The goal is to make the user feel like a scholar in a private vault, not a user in a database.

---

## 2. Colors: The Parchment & Ink Palette
The palette is grounded in the organic warmth of physical archives, punctuated by authoritative accents.

### Surface Hierarchy & The "No-Line" Rule
**Explicit Instruction:** Prohibit the use of 1px solid borders for sectioning content. Boundaries must be defined solely through background color shifts or tonal transitions.
*   **Base:** Use `surface` (`#fcf9f2`) as the primary canvas.
*   **Sectioning:** Use `surface_container_low` (`#f6f3ec`) or `surface_container` (`#f1eee7`) to define distinct content areas.
*   **The Layering Principle:** Treat the UI as stacked sheets of fine paper. A search bar might sit on `surface_container_lowest` (`#ffffff`) to pop against a `surface` background, creating "nested" depth without structural lines.

### Accent & Brand Tones
*   **Primary (Burgundy):** `primary` (`#4d0408`) is reserved for high-level editorial moments and primary CTAs. Use a subtle gradient transition to `primary_container` (`#6b1b1b`) for buttons to provide a "signature" depth.
*   **Secondary (Navy):** `secondary` (`#4e6073`) provides a cool, institutional contrast to the warm parchment tones, ideal for utility actions or metadata tags.

### The Glass & Gradient Rule
To move beyond a flat "web" feel, use Glassmorphism for floating navigation bars or artifact overlays. Apply a semi-transparent `surface` color with a `backdrop-filter: blur(20px)`. This allows the "parchment" textures of the background to bleed through, softening the interface.

---

## 3. Typography: Editorial Authority
The system utilizes a dual-font strategy to balance historical gravitas with modern utility.

### The Display Tier (Newsreader)
*   **Usage:** Display, Headline, and Title-LG levels.
*   **Character:** High-contrast serifs that evoke the feeling of printed manuscripts. Use `display-lg` (`3.5rem`) for hero archival titles to create immediate visual impact.
*   **Identity:** This font conveys the "brand" of the archive—it is the voice of the historian.

### The Utility Tier (Public Sans)
*   **Usage:** Title (MD/SM), Body, and Label levels.
*   **Character:** A neutral, highly legible sans-serif that ensures research and data entry remain frictionless.
*   **Identity:** This is the "modern digital tool" within the archive. It should feel invisible, providing clarity without competing with the headlines.

---

## 4. Elevation & Depth: Tonal Layering
In this design system, depth is a matter of light and material, not artificial shadows.

*   **Ambient Shadows:** For floating elements like modals or artifact previews, shadows must be extra-diffused. Use a 24px-48px blur with an opacity of 4%-6%, tinted with the `on_surface` (`#1c1c18`) color. This mimics natural ambient light in a physical room.
*   **The Ghost Border Fallback:** If a border is required for accessibility, it must be a "Ghost Border." Use `outline_variant` (`#dcc0be`) at **20% opacity**. Never use 100% opaque, high-contrast borders.
*   **Soft Minimalism:** Use `surface_dim` (`#dcdad3`) for recessed areas (like code snippets or archival footnotes) to create a "pressed-in" look.

---

## 5. Components

### Buttons
*   **Primary:** Background `primary` (`#4d0408`), text `on_primary` (`#ffffff`). Roundedness `sm` (`0.125rem`) to maintain a crisp, formal edge.
*   **Secondary:** Background `secondary_container` (`#cfe2f9`), text `on_secondary_container` (`#526478`).
*   **Tertiary (Editorial):** No background. Use `Newsreader` bold with a subtle underline in `primary_fixed`.

### Cards & Artifact Previews
*   **Rule:** Forbid divider lines. 
*   **Styling:** Use `surface_container_low` for the card body. On hover, transition to `surface_container_highest` (`#e5e2db`) and apply an ambient shadow. Ensure padding is generous—use 32px (2rem) minimum to let the "artifact" breathe.

### Input Fields
*   **Styling:** Use `surface_container_lowest` for the field fill. The bottom border should be a 1px line using `outline_variant` at 40% opacity. 
*   **Focus State:** Shift the border to `primary` (`#4d0408`) and introduce a subtle `primary_container` glow.

### Archival Specifics: The Metadata Chip
*   **Styling:** Use `secondary_fixed` (`#d1e4fb`) for the background with `on_secondary_fixed` (`#091d2e`) text. Use `Public Sans` Label-MD. This provides a clear, modern "tag" that doesn't distract from the historical content.

---

## 6. Do's and Don'ts

### Do
*   **Do** embrace asymmetry. A headline centered with a body paragraph slightly offset to the right creates a premium, bespoke editorial feel.
*   **Do** use `on_surface_variant` (`#554241`) for secondary text. Its slight warmth keeps the charcoal from feeling sterile.
*   **Do** use large margins. White space is not "empty"—it is the "matting" around a piece of art.

### Don't
*   **Don't** use 100% black. The `on_background` (`#1c1c18`) is deep enough to provide contrast while remaining organic.
*   **Don't** use standard `lg` or `xl` rounded corners. This system thrives on the formal, "clipped" look of `sm` (`0.125rem`) or `none` (0px) for a more academic feel.
*   **Don't** use bright, saturated colors. Every color must feel like it could be found in a 19th-century watercolor or an aged ink pot.