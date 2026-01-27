# Adam's Portfolio Website

You have access to gltf-transform and gltfpack. gltfpack exe is located at `public\assets\gltfpack.exe`.

## Tech Stack
- **NextJS** - Static site generator
- **GSAP** - ScrollTrigger, spring animations
- **TypeScript**

This project uses Bun runtime and package manager.

## Project Structure
- `layout.md` - Final page design specifications
- `ideas.md` - Brainstorming and ideas
- `app/lib/animationTiming.ts` - Global animation timing configuration for all sections

## Design Principles
- Single-page scroll-driven storytelling
- Bold and playful aesthetic
- Interstellar/space theme
- Noscript fallbacks for SEO
- Static images with GSAP transforms (no animated sprites)
- Minimize gradients

## Color Scheme
- **Primary:** #fca311 (golden yellow)
- **Secondary:** #22223b (dark purple)
- **Background:** #000814 (deep navy)

## Content Sections
1. Hero (name, title)
2. Career journey (7 zones: space → earth)
3. Education (TBD)
4. Projects (TBD)
5. Contact (TBD)

## Animation Timing
All scroll-driven animation timings are centralized in `app/lib/animationTiming.ts`. This file controls:
- Section-specific timing (when elements appear/disappear within their section)
- Cross-section fade timing (when elements from one section fade based on another section's progress)
- Utility functions for calculating fade-in/fade-out values

When modifying animation timing, always update this file to maintain consistency across sections.
