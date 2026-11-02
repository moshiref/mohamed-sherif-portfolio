export interface Project {
  slug: string
  name: string
  url: string
  /** Shown in the browser-frame address bar. */
  domain: string
  category: string
  market?: string
  platform?: string
  description: string
  /** 'client' = custom-domain commercial work, shown first. */
  group: 'client' | 'portfolio'
  /**
   * Real screenshots captured from the live site (public/images/work).
   * `null` when the site could not be reached at capture time; the showcase
   * then renders a neutral typographic frame instead of an invented preview.
   */
  preview: { desktop: string; desktopSmall: string; mobile: string } | null
}

const shots = (slug: string) => ({
  desktop: `/images/work/${slug}-1440.webp`,
  desktopSmall: `/images/work/${slug}-720.webp`,
  mobile: `/images/work/${slug}-mobile.webp`,
})

/** Order is intentional: custom-domain client work first, then Vercel-hosted work. */
export const projects: Project[] = [
  {
    slug: 'besht-al-salem',
    name: 'Besht Al Salem',
    url: 'https://besht-alsalem.com/',
    domain: 'besht-alsalem.com',
    category: 'Luxury E-commerce',
    market: 'Qatar',
    platform: 'Zid',
    description:
      'A luxury e-commerce store for a Qatari Bisht house, built on a custom Zid theme that carries the brand’s heritage into a premium shopping experience.',
    group: 'client',
    preview: shots('besht-al-salem'),
  },
  {
    slug: 'wood-art-egypt',
    name: 'Wood Art Egypt',
    url: 'https://woodartegypt.com/',
    domain: 'woodartegypt.com',
    category: 'E-commerce',
    market: 'Egypt',
    platform: 'Shopify',
    description:
      'A customised Shopify storefront for a modern furniture brand: warm, editorial product presentation and an Arabic-first shopping experience.',
    group: 'client',
    preview: shots('wood-art-egypt'),
  },
  {
    slug: 'dawoud-telekommunikation',
    name: 'Dawoud Telekommunikation',
    url: 'https://dawoud-telekommunikation.de/',
    domain: 'dawoud-telekommunikation.de',
    category: 'Business Website',
    market: 'Germany',
    description:
      'A corporate website for a German fibre-optic specialist, presenting planning, installation and service through a dark, technical visual language.',
    group: 'client',
    preview: shots('dawoud-telekommunikation'),
  },
  {
    slug: 'noour-elgendy',
    name: 'Noour Elgendy',
    url: 'https://noour-elgendy-2.vercel.app/',
    domain: 'noour-elgendy-2.vercel.app',
    category: 'Artist Portfolio',
    description: 'A cinematic portfolio for a visual artist working across AI video, UGC and creative design.',
    group: 'portfolio',
    preview: shots('noour-elgendy'),
  },
  {
    slug: 'ramy-said-eid',
    name: 'Ramy Said Eid',
    url: 'https://ramy-said-eid.vercel.app/',
    domain: 'ramy-said-eid.vercel.app',
    category: 'Personal Portfolio',
    description: 'An editorial portfolio for a brand identity designer, built around expressive serif typography and selected work.',
    group: 'portfolio',
    preview: shots('ramy-said-eid'),
  },
  {
    slug: 'crev-exam-platform',
    name: 'CREV Exam Platform',
    url: 'https://crev-exam-platform-g923.vercel.app/',
    domain: 'crev-exam-platform-g923.vercel.app',
    category: 'Educational Platform',
    description:
      'An Arabic online examination platform with dedicated portals for administrators, teachers, students and parents.',
    group: 'portfolio',
    preview: shots('crev-exam-platform'),
  },
  {
    slug: 'dental-portfolio',
    name: 'Dental Portfolio',
    url: 'https://dental-site-tau-puce.vercel.app/',
    domain: 'dental-site-tau-puce.vercel.app',
    category: 'Professional Portfolio',
    market: 'Egypt',
    description:
      'A portfolio for a dental-equipment specialist, presenting clinic installation and maintenance services across Egypt.',
    group: 'portfolio',
    preview: shots('dental-portfolio'),
  },
  {
    slug: 'omar-hany',
    name: 'Omar Hany',
    url: 'https://omarhany-alpn.vercel.app/',
    domain: 'omarhany-alpn.vercel.app',
    category: 'Personal Portfolio',
    description: 'A portfolio for a football content creator, showcasing his audience, UGC work and brand collaborations.',
    group: 'portfolio',
    preview: shots('omar-hany'),
  },
  {
    slug: 'nofalll',
    name: 'Nofalll',
    url: 'https://nofalll.vercel.app/',
    domain: 'nofalll.vercel.app',
    category: 'Personal Portfolio',
    market: 'Egypt',
    description: 'A service portfolio for an air-conditioning technician, designed to turn visits into calls and WhatsApp messages.',
    group: 'portfolio',
    preview: shots('nofalll'),
  },
  {
    slug: 'ahmed-ruby',
    name: 'Ahmed Ruby',
    url: 'https://ahmed-ruby-rho.vercel.app/',
    domain: 'ahmed-ruby-rho.vercel.app',
    category: 'Wedding Invitation',
    description: 'An interactive digital wedding invitation with refined Arabic calligraphy, event details and guest wishes.',
    group: 'portfolio',
    preview: shots('ahmed-ruby'),
  },
]

export const workGroups = {
  client: { label: 'Client Work', note: 'Commercial projects on custom domains' },
  portfolio: { label: 'Portfolios & Platforms', note: 'Personal brands, education and web applications' },
} as const
