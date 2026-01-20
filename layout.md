# Portfolio Layout Design

## Overview
Single-page scroll-driven storytelling portfolio. Journey from **space (present)** to **earth (past)**, traversing through career history.

**Tech:** NextJS + GSAP (scroll-triggered animations)
**Style:** Bold, playful, Interstellar-inspired
**SEO:** Noscript fallbacks for all content

## Technical Notes

### GSAP Implementation
- ScrollTrigger for all zone transitions
- Spring animations for pinecone physics
- Parallax layers per zone
- Static images with transform properties (scale, rotate, translate, opacity)

### Noscript Fallback
- All content visible in semantic HTML
- Static background images per zone
- Standard vertical layout without animations

### SEO Considerations
- Proper heading hierarchy (h1 for name, h2 for each role)
- Semantic sections
- Meta descriptions for each major section
- Structured data for Person schema
