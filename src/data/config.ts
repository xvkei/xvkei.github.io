/**
 * ──────────────────────────────────────────────────────────────
 *  haya.exe — owner configuration
 *
 *  Everything personal lives here. Search for "TODO" to find
 *  every spot to fill in. Values left as null / '' / [] are
 *  hidden or shown as a labelled "setup placeholder".
 *
 *  Text tips:
 *   - Text goes inside quotes: 'like this'
 *   - If your text has an apostrophe (I'm, don't), use double
 *     quotes instead: "I'm a developer"
 *   - Keep the commas at the end of each line.
 * ──────────────────────────────────────────────────────────────
 */

export type ProjectImage = { src: string; alt: string; width: number; height: number };

export type FeaturedProject = {
  id: string;
  name: string;
  placeholder?: boolean;
  shortDescription: string;
  longDescription?: string | null;
  problem?: string | null;
  features?: string[];
  technologies: string[];
  category?: string | null;
  repositoryUrl?: string | null;
  demoUrl?: string | null;
  image?: ProjectImage | null;
  status?: string | null;
  featured: boolean;
  personalContribution?: string | null;
};

export type SkillGroup = { group: string; items: string[] };
export type ResumeEntry = { title: string; organization: string; period?: string | null; points?: string[] };
export type ListeningItem = { title: string; artist: string; note?: string | null; url?: string | null };
export type Note = { id: string; title: string; date?: string | null; body: string };

/* ── 1. identity ──────────────────────────────────────────── */

type SiteConfig = {
  handle: string;
  fullName: string | null;
  role: string | null;
  location: string | null;
  welcome: string;
};

export const site: SiteConfig = {
  handle: 'haya',
  fullName: 'Merhaya Yahiya', // TODO: your name, e.g. 'Haya Santos'  (null = show only "haya")
  role: 'student developer — data science & frontend', // TODO: one short line, e.g. 'frontend developer'
  location: 'Cavite, PH', // optional, e.g. 'based in Cavite, PH'
  welcome: 'my little corner of the internet.',
};

/* ── 2. GitHub archive ────────────────────────────────────── */

// TODO: your PUBLIC GitHub username only — the part after github.com/
// Never put a password or token here.
const GITHUB_USERNAME = 'xvkei';

export const github = {
  username: (import.meta.env.VITE_GITHUB_USERNAME || GITHUB_USERNAME).trim(),
  includeForks: false, // true = also show repos you forked
  includeArchived: true,
  maxPages: 5,
  cacheMinutes: 10,
};

/* ── 3. featured projects ─────────────────────────────────── */
// TODO: replace these two templates with your real projects.
// For each one: fill it in, then DELETE the line `placeholder: true,`
// Add more by copying a whole { ... }, block. Each id must be unique.
// Screenshots: put the image in public/images/ and set image like:
//   image: { src: 'images/my-app.png', alt: 'What the screenshot shows', width: 1200, height: 750 },

export const featuredProjects: FeaturedProject[] = [
  {
    id: 'scholarian',
    name: 'Scholarian',
    shortDescription:
      'A scholarship management system for LPU Cavite with an AI eligibility checker and an FAQ chatbot.',
    longDescription:
      'Built in a three-week sprint as the finals project for DSELC03C (AI-Integrated System Development). It received a grade of 92/100 and a 5.0/5.0 rating in user acceptance testing with three external testers.',
    problem:
      'Scholarship applications involve a lot of back-and-forth between students and administrators: checking eligibility, submitting documents, and following up on status.',
    features: [
      'Browse scholarships with eligibility details and deadlines',
      'Submit applications, upload documents, and track their status in real time',
      'AI eligibility checker that evaluates GPA, course, and year level against scholarship criteria',
      'ScholarBot, a chatbot that answers FAQs about scholarships and deadlines',
      'Admin dashboard to manage listings and approve or reject applications with remarks',
    ],
    technologies: ['Python', 'Flask', 'Flask-SQLAlchemy', 'MySQL', 'Bootstrap 5', 'Jinja2', 'NVIDIA Nemotron API'],
    category: 'AI-integrated web app',
    repositoryUrl: 'https://github.com/xvkei/scholarian',
    demoUrl: null,
    image: null,
    status: 'academic project (team)',
    featured: true,
    personalContribution:
    "I worked as front-end developer, database designer, and back-end developer: I designed the 7-table normalized database, built the CRUD operations and role-based access with Flask-SQLAlchemy, built the front end with Bootstrap 5 and Jinja2, and integrated the NVIDIA Nemotron API for the eligibility checker and chatbot.",
  },
  {
    id: 'sproutwatch',
    name: 'SproutWatch',
    shortDescription:
      'A plant growth anomaly detector that flags unusual patterns in height data and explains each one on an interactive chart.',
    longDescription:
      'Upload a CSV of weekly plant height measurements and SproutWatch combines Z-score analysis with rule-based checks to flag points that look wrong, tagging each one with the reason it was flagged. Built for DSELC03C – CS301 at LPU Cavite.',
    problem:
      'Spotting problems in growth data by eye, like a wilted plant, a sudden drop, or growth that has stalled, is slow and easy to miss across many plants and weeks.',
    features: [
      'CSV upload of weekly plant heights, plus a built-in sample dataset',
      'Detects five anomaly types: statistical outliers (Z-score), dead or wilted plants, sudden drops, sudden spikes, and stagnant growth',
      'Interactive D3.js chart with tooltips showing height, Z-score, and the reasons a point was flagged',
      'Adjustable Z-score threshold slider and filters for anomalies or normal points',
    ],
    technologies: ['PHP', 'JavaScript', 'D3.js', 'Bootstrap 5', 'HTML', 'CSS'],
    category: 'data analysis & visualization',
    repositoryUrl: 'https://github.com/xvkei/sproutwatch',
    demoUrl: null,
    image: null,
    status: 'academic project (team)',
    featured: true,
    personalContribution:
    "I built the web app's growth-data processing and anomaly detection, and designed the interactive D3.js visualizations that chart growth trends and flag abnormal points.",
  },
];

/* ── 4. about ─────────────────────────────────────────────── */

type AboutConfig = { intro: string[]; interests: string[]; photo: ProjectImage | null };

export const about: AboutConfig = {
  intro: [
    "Hello, I'm Haya! I'm a student at LPU Cavite who loves working with data — finding patterns and turning it into something people can actually use.",
    "Lately, I've been learning new languages to add to my toolkit and building personal projects along the way. They'll show up here as they're ready, since this portfolio is a work in progress too.",
    "Right now, I'm looking for internships I can take on while studying. If you have an opportunity in data science, AI, or frontend, I'd love to hear from you.",
  ],
  interests: [
    'building AI-powered apps',
    'large language models',
    'machine learning',
    'web development',
  ],
  photo: null,
};

export const skills: SkillGroup[] = [
  {
    group: 'Data',
    items: ['Python', 'pandas', 'NumPy', 'SQL', 'Jupyter', 'scikit-learn', 'Matplotlib', 'Seaborn', 'Plotly', 'Excel', 'Statistics basics'],
  },
  {
    group: 'AI / ML',
    items: ['PyTorch', 'TensorFlow', 'Hugging Face', 'OpenAI API', 'Anthropic API', 'LangChain', 'Prompt engineering', 'NVIDIA Nemotron API', 'NVIDIA NIM (Llama 3.1)'],
  },
  {
    group: 'Frontend',
    items: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Responsive design'],
  },
  {
    group: 'Tools',
    items: ['Git', 'GitHub', 'VS Code', 'Figma', 'Google Colab'],
  },
];

/* ── 5. resume ────────────────────────────────────────────── */

type ResumeConfig = {
  pdfPath: string | null;
  lastUpdated: string | null;
  summary: string | null;
  experience: ResumeEntry[];
  education: ResumeEntry[];
  certifications: string[];
};

export const resume: ResumeConfig = {
  pdfPath: null,
  lastUpdated: 'October 2026',
  summary:
    "Fourth-year Computer Science student at LPU Cavite who enjoys data science, AI, and frontend development. I've built AI-integrated web apps, interactive data visualizations, and a browser game with automated end-to-end tests.",
  experience: [
    {
      title: 'Business Developer (Intern)',
      organization: 'NOAH Business Application',
      period: 'June – August 2026',
      points: [
        // TODO: one or two lines on what you did during the internship
      ],
    },
    {
      title: 'Secretary',
      organization: 'College of Information Technology and Computer Studies Student Government (CCS SG)',
      period: '2023 – 2024',
      points: [
        'Managed official records, meeting minutes, and correspondence for the student government body.',
        'Coordinated communication between officers and college administration to support student-led programs and events.',
      ],
    },
  ],
  education: [
    {
      title: 'BS Computer Science',
      organization: 'Lyceum of the Philippines University Cavite',
      period: '4th year · expected graduation June 2027',
      points: [
        // optional: 'GPA: 1.xx' — your PDF lists 1.63 as of 2nd year, so update it if you include it
      ],
    },
  ],
  certifications: [
    'Python Essentials 1 & 2 — Cisco Networking Academy (2024)',
    'Networking Essentials — Cisco Networking Academy (June 2026)',
  ],
};

/* ── 6. contact (unset links are hidden) ──────────────────── */

type ContactConfig = { email: string | null; linkedin: string | null; other: { label: string; url: string }[] };

export const contact: ContactConfig = {
  email: 'yahiyamerhaya@gmail.com',
  linkedin: 'https://www.linkedin.com/in/myahiya',
  other: [
    // { label: 'Blog', url: 'https://…' },
  ],
};

/* ── 7. optional apps (hidden until they have content) ────── */

export const notes: { enabled: boolean; items: Note[] } = {
  enabled: true,
  items: [
    {
      id: 'testing-bughunt',
      title: 'what 24 Playwright tests taught me',
      date: '2026-06-10',
      body: "For BugHunt, I wrote 24 end-to-end tests with Playwright that run across Chromium, Firefox, and WebKit. They caught a few bugs and taught me how to write maintainable tests that don't break when the UI changes.",
    },
    {
      id: 'scholarian-database',
      title: 'designing a 7-table database',
      date: '2026-05-15',
      body: "For Scholarian, I designed a normalized database with 7 tables and built the CRUD operations on top of it with Flask-SQLAlchemy.",
    },
    {
      id: 'noah-internship',
      title: 'notes from my internship',
      date: '2026-08-03',
      body: "From June to August 2026, I interned as a Business Developer at NOAH Business Application.",
    },
    {
      id: 'future-language',
      title: 'future idea: my own programming language',
      date: '2026-10-20',
      body: "Someday I want to build my own small programming language, one that's optimized for a specific kind of job.",
    },
  ],
};

export const music: { items: ListeningItem[] } = {
  items: [
    { title: 'Last Night on Earth', artist: 'Green Day', note: 'my all-time favorite', url: 'https://www.youtube.com/watch?v=xg_Y7Or_hWM'},
    { title: 'Nicole Kidman', artist: 'ADÉLA', note: 'current favorite working song', url: 'https://youtu.be/IXA6bQsVNjs?si=6KMLk-r0S6_HSv2b'},
    { title: 'About You', artist: 'The 1975', note: 'my writing song', url: 'https://www.youtube.com/watch?v=tGv7CUutzqU'},
    { title: 'Infrunami', artist: 'Steve Lacy', note: 'stuck in my head', url: 'https://youtu.be/Ol0-9Ob-QNk?si=BB086DlTZ-OfFqaf'},
    { title: 'Heavy', artist: 'The Marías', note: 'the goat', url: 'https://youtu.be/1BCqCgamowo?si=MDGuWrgIcsAF267V'},
    { title: 'Luna (2011 Remaster)', artist: 'The Smashing Pumpkins', note: '<3', url: 'https://youtu.be/dIdiuPPD69E?si=cU5eOmWBCNJoqzi2'},
  ],
};

/* ── 8. guestbook (Supabase) ──────────────────────────────── */
// Entries live in a Supabase table. The URL and publishable key are public
// by design: the database's row level security rules decide what visitors
// can do (read and sign, never edit or delete).
// NEVER put the secret / service_role key here.
// Leave url or publishableKey empty to hide the guestbook.

export const guestbook = {
  url: 'https://dfjbuypqgtqlionlysst.supabase.co',
  publishableKey: 'sb_publishable_obuYSxNKhKBVuiCdD8NEWw_QH1lGO0i',
  nameMax: 32, // keep in sync with the SQL check constraints
  messageMax: 500,
};