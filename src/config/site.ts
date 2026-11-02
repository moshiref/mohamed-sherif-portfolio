export const site = {
  name: { first: 'MOHAMED', last: 'SHERIF' },
  role: 'WEB DEVELOPER',
  tagline: ['FROM CODE TO CREATION.', 'BUILDING THE FUTURE OF THE WEB.'],
  year: new Date().getFullYear(),
  portrait: {
    // Intrinsic size of the cleaned cutout, used to reserve layout space (no CLS).
    width: 734,
    height: 1448,
    sources: {
      mobile: '/images/portrait-960.webp',
      desktop: '/images/portrait-1448.webp',
    },
    alt: 'Mohamed Sherif in a black suit, buttoning his jacket',
  },
} as const

export const about = {
  eyebrow: 'WHO I AM',
  title: { solid: 'ABOUT', chrome: 'ME' },
  intro: ["I'M MOHAMED", 'SHERIF.'],
  lead: 'A Web Developer building digital experiences, educational platforms, custom systems, professional portfolios, and powerful e-commerce solutions.',
  detail:
    'I also develop custom Shopify and Zid themes, creating tailored experiences for businesses across Egypt, Europe, and the Gulf region.',
  regionsLabel: 'WORKING ACROSS',
  regions: ['EGYPT', 'EUROPE', 'THE GULF'],
  cta: "LET'S WORK TOGETHER",
} as const

const WHATSAPP_NUMBER = '201274776417' // 01274776417, in international format for wa.me
const WHATSAPP_GREETING = "Hi Mohamed, I'd like to talk about a project."

export const contact = {
  eyebrow: 'GET IN TOUCH',
  title: { solid: "LET'S", chrome: 'TALK.' },
  lede: 'Have a project in mind? Message me directly on WhatsApp or Facebook.',
  channels: [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      value: '+20 127 477 6417',
      href: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_GREETING)}`,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      value: 'Send a message',
      href: 'https://www.facebook.com/share/1HH4uEySLf/',
    },
  ],
} as const

export type ContactChannel = (typeof contact.channels)[number]

export type SectionId = 'home' | 'about' | 'work' | 'contact'

export interface NavItem {
  id: SectionId
  label: string
}

/**
 * Navigation is declared up-front for the full site. Sections that do not exist
 * in the DOM yet are detected at runtime, so nothing here needs to change when
 * the About / Work / Contact phases land: just render an element with the id.
 */
export const navItems: NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact' },
]
