Coding partner

Show thinking
Of course. This is an excellent refinement. Moving away from distinct card backgrounds will create a much more modern, seamless, and content-focused interface. The UI will feel like it's part of the content, rather than just a container for it.

Here is the updated, command-style prompt that incorporates this new direction. It emphasizes minimalism and uses borders, shadows, and subtle effects to create depth and uniqueness, rather than solid background colors.

Agentic AI Prompt
Follow these technical plan requirements:

Project Overview: This is a full-stack premium media subscription platform using React, Node.js, and PostgreSQL. The vibe is minimalist and content-focused, with a dark, modern aesthetic. The UI should be unobtrusive.

File Location: Place new components in src/components/ and new pages in src/pages/.

No CSS Files: Do not write in .css files unless absolutely necessary. Use Tailwind CSS classes for all styling.

Brand Identity & Style Guide: "Void of Desire"
Adhere strictly to the following design system rules. The focus is on the content, not the UI.

1. Color Palette & Usage
Primary Action Buttons: Use seductive for background color (bg-seductive).

Borders & Outlines: Use void-accent for borders on active/focused elements and for defining component edges.

Backgrounds:

Use background-primary (#000000) for the base layer (e.g., footer).

Use void-gradient for the main content background of all pages.

IMPORTANT: Cards and other surfaces should not have a distinct background color. They should be transparent, using borders and shadows for separation.

Text:

text-primary (#ffffff) for headings.

text-secondary (#e5e7eb) for body text.

text-tertiary (#9ca3af) for metadata and captions.

2. Typography
Headings: Use font-serif (Cormorant Garamond).

H1 (Page Title): text-4xl font-bold text-gradient

H2 (Section Title): text-3xl font-semibold text-primary

H3 (Card Title): text-2xl font-semibold text-primary

Body & UI Text: Use font-sans (Lato).

Body/Paragraph: text-base font-normal text-secondary

Button Text/Labels: text-sm font-medium text-primary

3. Component Shape & Style
Surface Definition: All cards and surfaces must be defined by a border border-border-muted. This creates a minimal outline.

Corner Roundness: Use rounded-xl as the default for cards, buttons, and inputs. Use rounded-full only for avatars.

Shadows: Use shadow-card to lift surfaces from the background. The shadow provides depth, while the border provides the edge.

Unique Designs:

For the sticky Navbar, apply the .glass utility for a semi-transparent, modern look.

For any scrollable containers, apply the .scrollbar-thin utility for a custom, on-brand scrollbar.

4. Interactivity
Primary Button (seductive): Apply shadow-glow-seductive. On hover, use hover:scale-105.

Secondary Button: Default is transparent with a border-muted. On hover, the border color changes to border-secondary.

Clickable Cards/Surfaces: On hover, the border changes to border-secondary and the shadow to shadow-card-hover. This provides feedback without changing the background.

Form Inputs: On focus, apply focus:border-primary focus:ring-2 focus:ring-border-primary.

