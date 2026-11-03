// ─────────────────────────────────────────────────────────────
//  EDIT THIS FILE. Everything personal on the site lives here.
//  Put your photos in /public (e.g. /public/me.jpg) and point
//  `photo` / `workPhoto` at them. Leave them empty to show a
//  placeholder. Leave a link empty ("") to hide it everywhere.
// ─────────────────────────────────────────────────────────────

export const profile = {
  firstName: "Clinton",
  lastName: "Ezeh",
  fullName: "Ezeh Chukwuebuka Clinton",
  initials: "CE",
  role: "Product Designer & Developer",
  // Rotating titles typed out under your name in the hero
  typedRoles: [
    "Product Designer",
    "UI/UX Designer",
    "Full-Stack Developer",
    "Data Analyst",
    "Machine Learning Tinkerer",
  ],
  location: "Abuja, Nigeria",
  timezone: "Africa/Lagos",
  tzLabel: "UTC+1",
  tzShort: "WAT",
  email: "wizzclint@gmail.com",
  phone: "+234 81 0107 4533",
  github: "https://github.com/wizzclint",
  linkedin: "", // e.g. "https://www.linkedin.com/in/your-handle"
  credly: "", // a page listing all your certificates, if you have one
  photo: "/me.jpg",
  workPhoto: "", // e.g. "/me-working.jpg"
  workPhotoCaption: "Where most of it actually happens.",
  available: "open to new projects",
  footerBlurb:
    "Product designer, full-stack developer, and a person who genuinely enjoys a clean dataset.",
};

export function demoRequestUrl(project = "Portfolio walkthrough") {
  const subject = "Demo request: " + project;
  const body = "Hi Clinton,\n\nI'd like a private walkthrough of " + project + ".\n\nName:\nCompany or role:\nWhat I'd like to see:\nPreferred time and timezone:\n\nThank you!";
  return "mailto:" + profile.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
}

export const engineeringTools = [
  { label: "Core project stack", tools: ["TypeScript", "Next.js", "React", "Python", "MongoDB", "SQL"] },
  { label: "Additional tools I've worked with", tools: ["C++", "Java", "C#", "Go (Golang)", "Ruby", "Ruby on Rails"] },
  { label: "Trading & Web3 projects", tools: ["Exchange APIs", "CCXT", "Solana", "Wallet adapters"] },
];

export const heroIntro = {
  // Plain text + highlighted fragments, rendered in order
  parts: [
    { text: "I design products, then build them properly. I work across " },
    { text: "product & UI/UX design", strong: true },
    { text: ", " },
    { text: "full-stack development", strong: true },
    { text: " and " },
    { text: "data analytics", strong: true },
    {
      text: ", taking mobile apps, dashboards and web platforms from the first wireframe all the way to production.",
    },
  ],
};

export const stats = [
  { value: 5, suffix: "+", label: "Years designing" },
  { value: 5, suffix: "", label: "Product design roles" },
  { value: 10, suffix: "+", label: "Projects built" },
  { value: 11, suffix: "", label: "Live browser tools" },
];

export const heroCard = [
  ["location", profile.location],
  ["local time", "__clock__"],
  ["discipline", "design · full-stack · data"],
  ["stack", "Figma · Next.js · Python"],
  ["tooling", "11 live, client-side"],
  ["status", profile.available],
] as const;

export const marquee = [
  "Figma",
  "Design Systems",
  "Prototyping",
  "UX Research",
  "Usability Testing",
  "Next.js",
  "TypeScript",
  "C++",
  "Java",
  "C#",
  "Go",
  "Ruby on Rails",
  "React Native",
  "Tailwind CSS",
  "MongoDB",
  "Python",
  "TensorFlow",
  "Data Analysis",
  "Excel",
  "Dashboards",
];

export const about = {
  title: "Who's behind this",
  lede: "A little context on how I got here and what I care about.",
  paragraphs: [
    "I started in product design, turning rough ideas into interfaces people can actually use: mobile apps, admin dashboards, landing pages, and the *design systems* that hold them together. My process starts with the user problem, not the pixels.",
    "Five design roles later, I got tired of handing off and hoping. So I learned to **build what I design**: full-stack Next.js and TypeScript apps with real auth, payments and databases, shipped to production. It also means I know exactly what a clean developer handoff needs to look like.",
    "Then came data. A **data analytics bootcamp**, dashboards that make product metrics visible to stakeholders, and machine-learning side projects with TensorFlow, from a pest-detection CNN to a career-guidance chatbot. **Everything in the Tool Lab below runs in your browser.** Try it.",
  ],
  facts: [
    ["Based in", `${profile.location} · ${profile.tzLabel}`],
    ["Focus", "Product design · Full-stack · Data"],
    ["Design", "Figma · Design systems · Prototyping · UX research"],
    ["Code", "TypeScript · Next.js · React Native · Python · PHP"],
    ["Also worked with", "C++ · Java · C# · Go · Ruby / Rails"],
    ["Trading & Web3", "AlphaBot collaboration · Solana wallet integration"],
    ["Data", "Excel · Data analysis · Dashboards · TensorFlow / Keras"],
    ["Contact", profile.phone],
  ],
};

// Scores are self-assessed. Adjust them to taste.
export const capabilities = [
  {
    name: "Product & UI/UX Design",
    short: "Product & UI/UX Design",
    score: 92,
    color: "#34d399",
    detail: "End-to-end product design: user flows, wireframes, high-fidelity UI and interactive Figma prototypes.",
  },
  {
    name: "Design Systems & Handoff",
    short: "Design Systems",
    score: 90,
    color: "#60a5fa",
    detail: "Component libraries, UI patterns and handoff docs a dev team can build from without a dozen follow-up questions.",
  },
  {
    name: "Mobile Design (iOS & Android)",
    short: "Mobile Design",
    score: 88,
    color: "#c084fc",
    detail: "Cross-platform app UI, refined through usability testing to iron out iOS and Android inconsistencies.",
  },
  {
    name: "UX Research & Usability",
    short: "UX Research",
    score: 85,
    color: "#f59e0b",
    detail: "User research, usability testing and turning feedback into a prioritised redesign backlog.",
  },
  {
    name: "Full-Stack Development",
    short: "Full-Stack Development",
    score: 84,
    color: "#a78bfa",
    detail: "Next.js, TypeScript, Tailwind, MongoDB, auth and payments (Paystack), deployed on Vercel.",
  },
  {
    name: "Data Analytics",
    short: "Data Analytics",
    score: 80,
    color: "#10b981",
    detail: "Cleaning, analysing and visualising data in Excel and Python, and building dashboards that make metrics visible.",
  },
  {
    name: "Machine Learning (Python)",
    short: "Machine Learning",
    score: 74,
    color: "#3b82f6",
    detail: "TensorFlow / Keras models: CNN image classification and neural-network intent classification.",
  },
];

export const WORK_CATEGORIES = ["Systems & C++", "Trading & Web3", "Design", "Web", "AI & Python"] as const;

export type WorkItem = {
  n: string;
  title: string;
  category: (typeof WORK_CATEGORIES)[number];
  description: string;
  tags: string[];
  credit?: string;
};

export const selectedWork: WorkItem[] = [
  {
    n: "LAB / C++17",
    title: "Market Data Buffer Lab",
    category: "Systems & C++",
    description: "A new C++17 portfolio sample exploring two producer threads, bounded bid/ask queues, sequence checks and a local consumer. Uses synthetic normalized quotes; live WebSocket ingestion and latency validation are outside this sample.",
    tags: ["C++17", "Multithreading", "Atomics", "Bounded buffers"],
    credit: "New portfolio sample · source review available",
  },
  {
    n: "COLLAB / TRADING",
    title: "AlphaBot / ApexAlpha",
    category: "Trading & Web3",
    description: "Collaborator on an automated trading system with a Next.js dashboard, a separate trading engine, exchange integrations, paper trading and protective order handling. A private walkthrough covers the architecture and my contribution.",
    tags: ["TypeScript", "Next.js", "CCXT", "MongoDB", "Exchange APIs"],
    credit: "Collaborator · D734m / AlphaBot",
  },
  {
    n: "COLLAB / WEB3",
    title: "Flare",
    category: "Trading & Web3",
    description: "Collaborator on a Solana-connected web application with wallet connection flows and interactive account experiences. Built around Next.js, TypeScript, Solana Web3.js and wallet adapters.",
    tags: ["Solana", "Web3.js", "Wallet adapters", "TypeScript", "Prisma"],
    credit: "Collaborator · AJBrownson / flare",
  },
  {
    n: "01 / 2026",
    title: "Nike Sneaker Store App",
    category: "Design",
    description:
      "A mobile shopping experience for a sneaker store: product discovery, detail pages, cart and checkout, designed and prototyped end to end in Figma.",
    tags: ["Figma", "Mobile UI", "Prototyping"],
  },
  {
    n: "02 / 2025",
    title: "FAITH App",
    category: "Design",
    description:
      "UI for a cross-platform mobile app, refined through usability testing so the experience holds up on both iOS and Android.",
    tags: ["Figma", "iOS & Android", "Usability testing"],
  },
  {
    n: "03 / 2024",
    title: "Gamified Self-Regulation App",
    category: "Design",
    description:
      "A playful habit and self-regulation app that uses game mechanics to keep users coming back, from research through to high-fidelity screens.",
    tags: ["Figma", "UX Research", "Gamification"],
  },
  {
    n: "04 / 2026",
    title: "NextPlate",
    category: "Web",
    description: "A food booking app: browse, book and manage orders, built with Next.js and TypeScript.",
    tags: ["Next.js", "TypeScript"],
  },
  {
    n: "05 / 2026",
    title: "Fireflies in the Night",
    category: "Web",
    description:
      "An essay, memoir and community site with sectioned reading pages and a dedicated long-form memoir reader.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    n: "06 / 2026",
    title: "Aphis fabae Pest Detection",
    category: "AI & Python",
    description:
      "A deep-learning computer vision system that detects black bean aphid infestations from field images, with a GUI for real-time detection.",
    tags: ["Python", "TensorFlow / Keras", "CNN"],
  },
  {
    n: "07 / 2026",
    title: "CounselBot",
    category: "AI & Python",
    description:
      "An end-to-end career guidance chatbot that uses a TensorFlow neural network for intent classification to answer student questions on colleges, streams and subjects.",
    tags: ["Python", "TensorFlow", "NLP"],
  },
  {
    n: "08 / 2026",
    title: "Image Steganography",
    category: "AI & Python",
    description: "A desktop GUI for hiding and recovering secret messages inside images.",
    tags: ["Python", "GUI", "Security"],
  },
];

export const flagship = [
  {
    kicker: "Pawn & collateral loan platform",
    title: "Collatera",
    status: "Live",
    headline:
      "A full-stack pawn platform: collateral loans, a customer wallet, repayments and a complete admin panel.",
    body: "A ground-up Next.js rebuild of a PHP pawnshop prototype, with a new brand (deep emerald and gold, shield-and-vault mark) and all the pieces the original was missing: wallet, repayment flow and an admin dashboard with charts.",
    bullets: [
      "Customer wallet and loan repayment flow",
      "Admin panel with dashboard charts",
      "bcrypt + JWT sessions, enforced in middleware",
      "Rebrand and full UI designed from scratch",
    ],
    tags: ["Next.js", "TypeScript", "MongoDB", "Tailwind CSS", "Recharts"],
    year: "2026",
  },
  {
    kicker: "Cosmetics e-commerce",
    title: "Naturéa",
    status: "Built",
    headline:
      "A production-ready cosmetics store with real payments, an admin dashboard and a tested back end.",
    body: "Catalogue, cart and checkout with Paystack plus a manual bank-transfer fallback, reviewed by admins with proof of payment. Transactional email, error tracking, and a Vitest suite that runs against an in-memory MongoDB.",
    bullets: [
      "Paystack checkout + bank-transfer fallback",
      "Admin dashboard with payment proof review",
      "Email via Resend, error tracking via Sentry",
      "Tested with Vitest against real MongoDB",
    ],
    tags: ["Next.js 16", "TypeScript", "MongoDB", "Paystack", "Vitest"],
    year: "2026",
  },
  {
    kicker: "Business operations app",
    title: "Ahmad HQ",
    status: "Live",
    headline:
      "An operating system for a group of businesses, with a Google Spreadsheet as the single source of truth.",
    body: "Each business area gets its own page and the home screen summarises progress across all of them. Google sign-in with roles, batched and cached reads from Google Sheets, and a demo mode that runs on sample data when no credentials are configured.",
    bullets: [
      "Google sign-in with per-user roles and areas",
      "Reads and writes Google Sheets via the API",
      "Cross-business progress dashboard",
    ],
    tags: ["Next.js", "TypeScript", "NextAuth", "Google Sheets API"],
    year: "2026",
  },
];

export const credentials = [
  {
    issuer: "Dexter & Heros Consulting Ltd",
    level: "Data",
    title: "Data Analysis with Excel",
    issued: "May 2026",
    expires: "",
    number: "DTA04052026/000572994",
    image: "/certs/data-analysis-with-excel.jpg",
    url: "",
  },
  {
    issuer: "Alexander Freberg",
    level: "Data",
    title: "Data Analytics Bootcamp",
    issued: "2026",
    expires: "",
    number: "",
    image: "/certs/data-analytics-bootcamp.jpg",
    url: "",
  },
];

export const timeline = [
  {
    when: "2026",
    title: "Data Analytics Bootcamp",
    org: "Alexander Freberg",
    text: "Formal grounding in data analysis, adding analytics to the design and engineering toolkit.",
  },
  {
    when: "May 2026",
    title: "Data Analysis with Excel",
    org: "Dexter & Heros Consulting Ltd",
    text: "Certified training in cleaning, analysing and reporting on data in Excel.",
  },
  {
    when: "Apr 2026 - Present",
    title: "Product Designer",
    org: "Clacachi Technology Hub",
    text: "Own end-to-end product design across a growing platform: user flows, high-fidelity UI, and the design system and handoff docs the dev team builds from. Mentoring along the way.",
  },
  {
    when: "Oct 2025 - Dec 2025",
    title: "Product Designer, Mobile",
    org: "Stridrsoft",
    text: "Designed and refined UI for a cross-platform Flutter app, running usability testing to iron out inconsistencies between iOS and Android.",
  },
  {
    when: "Jan 2024 - Jan 2025",
    title: "Product Designer / UX Research",
    org: "Aioniasoft",
    text: "Turned user feedback and product data into a prioritised redesign backlog, and built dashboards that made UX and quality metrics visible to stakeholders.",
  },
  {
    when: "Jan 2023 - Aug 2023",
    title: "UI/UX Designer",
    org: "Surgetechnology",
    text: "Designed intuitive, accessible interfaces for web applications end to end: research, wireframes, visual design and dev-ready specs.",
  },
  {
    when: "Oct 2021 - Dec 2022",
    title: "Product Designer",
    org: "Soutech Ventures",
    text: "Established the UI patterns and design standards used across multiple web builds, shortening the path from design to shipped product.",
  },
];

// The "Beyond the code" feature card
export const venture = {
  sectionLede: "I don't just build the product. I design it first.",
  badge: "Product Designer · since 2021",
  name: "Design first.",
  lede: [
    { text: "Code is one half of what I do. The other half is " },
    { text: "product design", accent: true },
    { text: ", where I take an idea from " },
    { text: "research to a design system", accent: true },
    { text: " that engineers can actually build from." },
  ],
  body: "My process starts with the user problem, not the pixels: research and data first, then wireframes, then a visual system I can hand to engineering without a dozen follow-up questions. I'm especially interested in fintech: mobile apps, admin dashboards, and the design systems that hold them together.",
  bullets: [
    "Research and data before pixels",
    "Wireframes → high-fidelity UI → design system",
    "Handoff docs engineers can build from",
  ],
  url: demoRequestUrl("Design prototypes"),
  cta: "Request a design walkthrough",
  urlLabel: "Private demo",
};

export const contact = {
  pitch:
    "A mobile app, an admin dashboard, a full build from scratch, or a dataset that needs to start talking. I design it, build it and ship it. I reply to everything.",
};
