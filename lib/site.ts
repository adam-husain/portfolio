export type Experience = {
  role: string;
  company: string;
  period?: string;
  location?: string;
  summary?: string;
};

export type Education = {
  degree: string;
  institution: string;
  period?: string;
  detail?: string;
};

export type ProjectImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type CareerProject = {
  slug: string;
  name: string;
  year: string;
  role: string;
  description: string;
  highlights?: string[];
  technologies: string[];
  link?: string;
  status?: string;
  heroImage: ProjectImage;
  mobileImages?: ProjectImage[];
  extraImages?: ProjectImage[];
};

export type CvProject = {
  slug: string;
  name: string;
  year: string;
  org?: string;
  description: string;
  technologies: string[];
  link?: string;
  images?: ProjectImage[];
};

export type TedTalk = {
  title: string;
  event: string;
  date: string;
  youtubeId: string;
  url: string;
  description: string;
};

export const siteConfig = {
  name: "Adam Husain",
  tagline: "Software Engineer | Master of AI",
  greeting: "Hello, I'm",
  description:
    "Software engineer who ships entire products solo: web platforms, mobile apps, AI systems, and the infrastructure behind them. Master of AI, Monash University. TEDx speaker.",

  // SEO fields
  url: "https://adamhusain.me",

  bio: "Adam Husain is a software engineer with a Master of AI from Monash University. He builds web and mobile products end to end, from startup landing pages and SOC2-compliant dashboards to AI-powered accessibility apps, and spoke at TEDx on privacy and data collection.",

  currentJob: {
    title: "Software Engineer",
    company: "Nation.dev",
  },

  experience: [
    {
      role: "Software Engineer",
      company: "Nation.dev",
      period: "2025 - Present",
      location: "Malaysia (Remote)",
      summary:
        "Web and mobile development for client products. Solo frontend developer on SmartSenior (Next.js) and solo developer on its Expo mobile app.",
    },
    {
      role: "Senior Software Engineer",
      company: "Outer Insights",
      period: "2023 - 2025",
      location: "Vancouver, Canada",
      summary:
        "Senior lead of a 5-person team. LLM training, systems architecture, PySpark data processing at 1M+ record scale, Terraform on AWS, CI/CD.",
    },
    {
      role: "AI Researcher",
      company: "SHRDC",
      period: "2021 - 2023",
      location: "Selangor, Malaysia",
      summary:
        "Applied reinforcement learning and vision detection research, backend development, and project management.",
    },
  ] as Experience[],

  education: [
    {
      degree: "Master of AI",
      institution: "Monash University",
      period: "2024 - 2025",
      detail: "Deep learning, model training, LLMs, data curation",
    },
    {
      degree: "BSc Computer Science",
      institution: "Monash University",
      period: "2019 - 2023",
      detail: "Algorithms, data structures, performance optimization, multithreading",
    },
  ] as Education[],

  skills: {
    languages: ["TypeScript", "JavaScript", "Python", "Java", "C#", "Dart"],
    frontend: ["React", "Next.js", "Svelte", "Astro", "Tailwind CSS", "GSAP"],
    mobile: ["React Native", "Expo", "Flutter", "Unity3D"],
    backend: [
      "Node.js",
      "Spring Boot",
      "ASP.NET",
      "FastAPI",
      "tRPC",
      "PostgreSQL",
      "MySQL",
      "Redis",
      "MongoDB",
    ],
    cloud: ["AWS", "GCP", "Azure", "Terraform", "Firebase", "Supabase", "Vercel"],
    ml: ["LLM Training", "Computer Vision", "Reinforcement Learning", "PySpark", "ONNX"],
  },

  careerProjects: [
    {
      slug: "smartsenior",
      name: "SmartSenior",
      year: "2025",
      role: "Solo Frontend Developer (web), Solo Developer (mobile) at Nation.dev",
      description:
        "Discount and benefits club for people over 55 in Sweden. I maintain the Next.js web application as the sole frontend developer and built the iOS and Android app solo with Expo and React Native, both backed by an ASP.NET API with a Python AI recommendation microservice.",
      technologies: ["Next.js", "Expo", "React Native", "ASP.NET", "Google Cloud"],
      link: "https://smartsenior.se",
      heroImage: {
        src: "/images/projects/smartsenior-web.jpg",
        alt: "SmartSenior web application homepage with deals for seniors",
        width: 1216,
        height: 617,
      },
      mobileImages: [
        {
          src: "/images/projects/smartsenior-mobile-1.jpg",
          alt: "SmartSenior mobile app home screen with discount search",
          width: 427,
          height: 924,
        },
        {
          src: "/images/projects/smartsenior-mobile-2.jpg",
          alt: "SmartSenior mobile app travel deals onboarding screen",
          width: 427,
          height: 924,
        },
        {
          src: "/images/projects/smartsenior-mobile-3.jpg",
          alt: "SmartSenior mobile app local discounts near you screen",
          width: 427,
          height: 924,
        },
        {
          src: "/images/projects/smartsenior-mobile-4.jpg",
          alt: "SmartSenior mobile app discount categories screen",
          width: 427,
          height: 924,
        },
      ],
    },
    {
      slug: "outerinsights",
      name: "Outer Insights",
      year: "2023",
      role: "Senior Lead for 5-person Team",
      description:
        "Platform connecting business founders with investment banks. I built the animated Three.js landing page solo and led the client dashboard: calendar and email sync engines, data processing for over a million records, meeting transcription and analysis, intelligent search on a fine-tuned LLM, and pitch-deck telemetry. SOC2 compliant with WorkOS enterprise integration and public-key encryption of personal data.",
      technologies: [
        "Astro",
        "Three.js",
        "GSAP",
        "React",
        "Recharts",
        "FastAPI",
        "MySQL",
        "Redis",
        "MongoDB",
      ],
      link: "https://outerinsights.io",
      heroImage: {
        src: "/images/projects/outerinsights-landing.jpg",
        alt: "Outer Insights landing page with 3D globe and capital connections headline",
        width: 990,
        height: 501,
      },
      extraImages: [
        {
          src: "/images/projects/outerinsights-dashboard-1.png",
          alt: "Outer Insights deck insights dashboard with engagement analytics",
          width: 1160,
          height: 1080,
        },
        {
          src: "/images/projects/outerinsights-dashboard-2.jpg",
          alt: "Outer Insights contacts database view",
          width: 1064,
          height: 988,
        },
        {
          src: "/images/projects/outerinsights-dashboard-3.png",
          alt: "Outer Insights calendar packed with investor meetings",
          width: 1600,
          height: 727,
        },
      ],
    },
    {
      slug: "authhero",
      name: "Auth Hero",
      year: "2025",
      role: "Co-founder, Senior Lead for 4-person Team",
      status: "Shut down",
      description:
        "Health-tech startup connecting clinics, insurers, HR, legal, and patients in one workspace for California workers' comp clinics. I built the hand-drawn SVG animated landing page and the case-management dashboard: realtime messaging on Azure Communication Services, e-fax integration with California clinics, stakeholder automation, and a SMART on FHIR app. HIPAA compliant. Shut down for financial reasons; source available for proof.",
      technologies: ["Next.js", "Tailwind", "GSAP", "tRPC", "PostgreSQL", "FHIR", "Azure"],
      heroImage: {
        src: "/images/projects/authhero-landing.jpg",
        alt: "Auth Hero landing page: run your clinic, not your paperwork",
        width: 1465,
        height: 743,
      },
      extraImages: [
        {
          src: "/images/projects/authhero-dashboard-1.png",
          alt: "Auth Hero task board for clinic case work",
          width: 1015,
          height: 944,
        },
        {
          src: "/images/projects/authhero-dashboard-2.png",
          alt: "Auth Hero patient case detail view",
          width: 1007,
          height: 935,
        },
        {
          src: "/images/projects/authhero-dashboard-3.png",
          alt: "Auth Hero cases table with priorities and statuses",
          width: 1600,
          height: 703,
        },
      ],
    },
    {
      slug: "petville",
      name: "Petville",
      year: "2024",
      role: "Solo Developer (CTO)",
      status: "Shut down",
      description:
        "Pet-care marketplace startup: custom e-commerce site, a business dashboard with an AI meeting-insights tool, and a Flutter mobile app I developed and launched on both stores within 60 days. Python and Pandas powered the recommendation engine. Company shut down; source available for proof.",
      technologies: ["Vite", "React", "Flutter", "Firebase", "MySQL", "GCP", "Azure", "Pandas"],
      heroImage: {
        src: "/images/projects/petville-web.jpg",
        alt: "Petville e-commerce website homepage with pet care services",
        width: 1600,
        height: 740,
      },
      extraImages: [
        {
          src: "/images/projects/petville-dashboard-1.png",
          alt: "Petville business dashboard with sales metrics",
          width: 1055,
          height: 488,
        },
        {
          src: "/images/projects/petville-dashboard-2.png",
          alt: "Petville appointments calendar for pet businesses",
          width: 1055,
          height: 488,
        },
        {
          src: "/images/projects/petville-dashboard-3.jpg",
          alt: "Petville Pawdium AI meeting insights tool",
          width: 1055,
          height: 488,
        },
        {
          src: "/images/projects/petville-dashboard-4.png",
          alt: "Petville products management table",
          width: 1055,
          height: 488,
        },
      ],
      mobileImages: [
        {
          src: "/images/projects/petville-mobile-1.jpg",
          alt: "Petville mobile app home with pet services",
          width: 465,
          height: 944,
        },
        {
          src: "/images/projects/petville-mobile-2.png",
          alt: "Petville mobile app booking status flow",
          width: 465,
          height: 944,
        },
        {
          src: "/images/projects/petville-mobile-3.jpg",
          alt: "Petville mobile app pet sitter booking screen",
          width: 465,
          height: 944,
        },
        {
          src: "/images/projects/petville-mobile-4.png",
          alt: "Petville mobile app chat with a pet sitter",
          width: 465,
          height: 944,
        },
        {
          src: "/images/projects/petville-mobile-5.jpg",
          alt: "Petville mobile app pet profiles screen",
          width: 465,
          height: 944,
        },
      ],
    },
    {
      slug: "studentmarket",
      name: "Student Market",
      year: "2021",
      role: "Solo Developer",
      status: "Relaunched as Dashubs",
      description:
        "Buy-and-sell marketplace empowering student communities, peaking at 300 active users a month. Built solo on React with a PHP, Apache, and MySQL backend, and later relaunched as Dashubs.",
      technologies: ["React", "PHP", "Apache", "MySQL"],
      heroImage: {
        src: "/images/projects/studentmarket-web.jpg",
        alt: "Student Market web marketplace with product listings",
        width: 1600,
        height: 740,
      },
    },
    {
      slug: "portfolio",
      name: "This Website",
      year: "2024",
      role: "Solo Developer",
      description:
        "Highly overengineered portfolio, just for the fun of it. The previous version told a space-to-earth scroll story in React Three Fiber; this one trades the rocket for restraint.",
      technologies: ["Next.js", "GSAP", "TypeScript", "Tailwind"],
      link: "https://adamhusain.me",
      heroImage: {
        src: "/images/projects/portfolio-site.jpg",
        alt: "Previous portfolio website hero with handwritten name and 3D rocket",
        width: 1574,
        height: 728,
      },
    },
  ] as CareerProject[],

  cvProjects: [
    {
      slug: "strider",
      name: "Project Strider",
      year: "2025",
      org: "Monash University",
      description:
        "Master's final year project: accessibility app that estimates ground depth through the camera (MiDaS + Dense Prediction Transformer on Google Cloud) and guides visually impaired users with vibration and sound. AI Engineer in a 5-person team.",
      technologies: ["Unity3D", "ONNX", "MiDaS", "Google Cloud"],
      link: "https://fit5120-t12-starter.netlify.app",
      images: [
        {
          src: "/images/projects/strider-landing.jpg",
          alt: "Strider landing page for AI-powered obstacle detection",
          width: 1593,
          height: 897,
        },
        {
          src: "/images/projects/strider-app.jpg",
          alt: "Strider app detecting a wall through the camera",
          width: 230,
          height: 498,
        },
      ],
    },
    {
      slug: "image-segmentation",
      name: "Image Segmentation",
      year: "2023",
      org: "Monash University",
      description:
        "Custom AI model that extracts number plates from vehicle images with high accuracy.",
      technologies: ["Python", "Computer Vision"],
    },
    {
      slug: "dashubs",
      name: "Dashubs",
      year: "2022",
      org: "Personal project",
      description:
        "Thrifting and events app for students, live on iOS and Android. The relaunch of Student Market as a full mobile product, built solo.",
      technologies: ["Expo", "React Native", "Supabase"],
      images: [
        {
          src: "/images/projects/dashubs-app-1.png",
          alt: "Dashubs app home feed with secondhand listings",
          width: 427,
          height: 924,
        },
        {
          src: "/images/projects/dashubs-app-2.jpg",
          alt: "Dashubs app product detail page",
          width: 427,
          height: 924,
        },
        {
          src: "/images/projects/dashubs-app-3.jpg",
          alt: "Dashubs app events map around Kuala Lumpur",
          width: 427,
          height: 924,
        },
        {
          src: "/images/projects/dashubs-app-4.png",
          alt: "Dashubs app word game screen",
          width: 427,
          height: 924,
        },
      ],
    },
    {
      slug: "student-mentorship",
      name: "Student Mentorship",
      year: "2020",
      org: "Heriot-Watt University, Dubai",
      description:
        "Volunteer at the Computer Science Festival: lectures on game programming and hands-on sessions with students.",
      technologies: ["Teaching", "Game Programming"],
    },
    {
      slug: "examination-software",
      name: "Examination Software",
      year: "2018",
      org: "Indian School Muscat, Oman",
      description:
        "Led a 3-person team building native Windows aptitude-testing software for grade 10 students, with commendation letters from the principal and head of computer science.",
      technologies: ["C#", ".NET Framework"],
      images: [
        {
          src: "/images/projects/examsoft-letter-1.jpg",
          alt: "Letter of appreciation from the principal of Indian School Muscat",
          width: 832,
          height: 1174,
        },
        {
          src: "/images/projects/examsoft-letter-2.jpg",
          alt: "Reference letter from the head of computer science",
          width: 853,
          height: 1174,
        },
      ],
    },
  ] as CvProject[],

  tedTalk: {
    title: "Privacy and Data Collection in the Digital Age",
    event: "TEDx, Malaysia",
    date: "2022-09-20",
    youtubeId: "IDeagHjCF3A",
    url: "https://www.youtube.com/watch?v=IDeagHjCF3A",
    description:
      "A talk on how much of ourselves we trade away online, and what privacy should mean in an era of pervasive data collection.",
  } as TedTalk,
};

export const socialLinks = {
  linkedin: "https://www.linkedin.com/in/adam-husain",
  github: "https://github.com/adam-husain",
};
