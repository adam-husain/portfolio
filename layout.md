# Portfolio Layout Design

## Overview
Single-page scroll-driven storytelling portfolio. Journey from **space (present)** to **earth (past)**, traversing through career history.

**Tech:** Astro + GSAP (scroll-triggered animations)
**Style:** Bold, playful, Interstellar-inspired
**SEO:** Noscript fallbacks for all content

---

## Page Structure

### Hero (Top)
- Name: **Adam Husain**
- Title: Software Engineer | AI Specialist
- Scroll prompt indicator
- Background: Deep space begins

---

## Scroll Zones (Career Journey)

### Zone 1: Deep Space — Nation.dev (2025–Present)
**Visual:** Nebula, stars, floating "Do Not Go Gentle Into That Good Night" text glowing softly
**Content:** Current role, remote work, Web/Mobile, React/Svelte, Google Cloud
**Scroll Transform:** Stars parallax, text fades in/out with depth

---

### Zone 2: Orbital — Outer Insights (2024–2025)
**Visual:** Satellites beaming data streams as light trails, orbital paths
**Content:** Senior Software Engineer, Vancouver. LLM Training, Big Data, PySpark, AWS
**Scroll Transform:** Satellites rotate around viewport, data trails follow scroll

---

### Zone 3: Moon Surface — Social Presence (2024–2025)
**Visual:** Lunar landscape, Earth visible on horizon, transmission towers
**Content:** Software Engineer, London. UI/UX, Figma, React/Vue/Angular
**Scroll Transform:** Earth rises on horizon as user scrolls, towers transmit pulses

---

### Zone 4: Stratosphere — Petville Global (2023–2024)
**Visual:** Airplane in thin atmosphere, Adam (static image) jumps out
**Content:** CTO, Kuala Lumpur. Entrepreneurship, Leadership, Startup
**Scroll Transform:** Airplane exits frame, Adam silhouette begins freefall

---

### Zone 5: Cloudscape — SHRDC (2021–2023)
**Visual:** Hot air balloon, mountain peaks piercing through clouds, Adam silhouette falling
**Content:** AI Researcher, Selangor. Reinforcement Learning, Vision Detection
**Scroll Transform:** Clouds parallax, balloon drifts, mountains reveal gradually

---

### Zone 6: Cityscape — Snyper Labs (2017–2020)
**Visual:** Dubai-inspired futuristic skyline, neon lights, Burj Khalifa silhouette
**Content:** Game Developer, Dubai. Unreal Engine, 3D Graphics, Animation
**Scroll Transform:** Buildings rise into view, neon signs flicker on, Adam passes through

---

### Zone 7: Forest Floor — Self-Employed (2017–2018)
**Visual:** Pinecone trees, forest canopy, Adam lands
**Content:** Freelance, Muscat, Oman. Web & Mobile Development
**Animation:**
- 2 pinecone trees with GSAP spring physics
- Adam lands on trees, they bend under weight
- Pinecones drop and slide Adam out
- Text reveals as pinecones bend (role details)

---

## Post-Landing Sections (Future Implementation)

### Education Section
- Monash University (Master of AI, BSc Computer Science)
- Heriot-Watt University (BSc Software Engineering)
- *Design TBD*

### Projects Section
- Project Strider
- Image Segmentation Software
- Dashubs
- Student Mentorship
- Examination Software
- *Design TBD*

### Contact/Footer
- Email, LinkedIn, GitHub
- Resume download
- *Placement TBD*

---

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
