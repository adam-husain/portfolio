import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Single registration point for GSAP plugins. Only import this
// module from "use client" components; registerPlugin at module
// scope is SSR-safe but ScrollTriggers must be created in effects.
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
