# Portfolio Concept: Space to Earth Visual Journey

## Theme
Interstellar-inspired descent from cosmos to ground, showcasing design and 3D animation skills through scroll-driven storytelling.

## Direction
- **Scroll Down** = Descend from space to earth
- **Space (Top)** = Beginning of journey
- **Earth (Bottom)** = Destination

## Visual Zones

### 1. Outer Space — The Stage
- Solar system with planets (sun, mars, saturn, jupiter)
- Lens flare effect responding to cursor
- Starfield background with twinkling layers

**Text:** "Every story needs a stage"

---

### 2. Rocket to Moon — Motion
- Rocket flies across screen toward moon
- Moon revealed via expanding elliptical mask
- Rocket flame intensifies as it approaches
- Chemtrails fade during scroll

**Text:** "A good design is not rocket science"
**Description:** "But a rocket sure helps with making it look cool."

---

### 3. Orbital View — Dimension
- Moon scales out and repositions to corner
- Satellite orbits into view
- Data streams visualized as light trails

**Text:** "Do not go gentle into that good night"
**Description:** "For old age should burn and rave at close of day; Rage, rage against the dying of the light."

---

### 4. Atmospheric Re-entry — You Are Not Alone
- Asteroids crash downward
- Heat and flame effects intensify (re-entry burn)
- Asteroids burn out and exit top-right
- Hot air balloon drifts in from bottom-left with rotation
- Balloon stays left, text on right (desktop)

**Title:** "You are not alone"

**Description:** "The world feels heavy sometimes. The noise, the uncertainty, the weight of it all. But even in freefall, there's a quiet truth — we're all descending together. And somehow, that makes the fall a little lighter."

---

### 5. Cloudscape — Stillness
- Hot air balloon scales down
- Volumetric clouds fade in (from public/images/clouds/)
- Soft parallax layering
- Calm after the intensity

**Text:** "Open up your mind to the endless possibilities"

---

### 6. Cityscape — Arrival
- Futuristic skyline emerges from clouds
- Neon lights, geometric buildings
- City SVG silhouette with gradient mask
- Journey's end

**Text:** "Have you decided to look [typewriter effect]"
- Typewriter cycles through: cool, awesome, bombastic, stellar, legendary, magnificent, spectacular, phenomenal, incredible, extraordinary

---

## Footer Section — Contact & Social

### Layout
- Two-column grid layout (stacked on mobile)
- Full black background (#000000) for distinct separation
- Primary color accents (#fca311)

### Left Column: Profile & Social
- Square profile photo (256x256) with rounded corners
- 3px golden border with subtle glow effect
- Social link placards positioned at bottom-right of photo:
  - LinkedIn icon button
  - GitHub icon button
- Buttons have hover effect (background switches to primary color)

### Right Column: Contact Form
- Heading: "Contact Me"
- Form fields:
  - Name (text input, required)
  - Email (email input, required)
  - Message (textarea, 5 rows, required)
- Submit button with primary color (#fca311)
- Form submits to Formspree
- Status messages for success/error states

### Copyright
- Centered text below content
- Separated by subtle border line
- Dynamic year display

---

## Animation Style
- Scroll-driven storytelling via GSAP ScrollTrigger
- 3D elements with React Three Fiber
- Parallax layering throughout
- Smooth interpolation (no jittery motion)
- Static images with GSAP transforms (no animated sprites)
