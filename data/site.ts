export const brand = {
  name: "Jewel Stone",
  tagline: "Shine With You",
  owner: "Ishan Vaghani",
  title: "Founder & Diamond Consultant",
  phone: "+1 551-341-3256",
  email: "ishan@thejewelstone.com",
  website: "https://thejewelstone.com",
  address: "62 W 47th St, Suite 505, New York, NY 10036",
  hours: "Monday to Saturday, by appointment"
};

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/collections", label: "Collections" },
  { href: "/diamonds", label: "Diamonds" },
  { href: "/custom", label: "Custom Design" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export type NavChild = { href: string; label: string; description?: string };
export type NavGroup = { title: string; items: NavChild[] };
export type NavFeatured = { image: string; title: string; subtitle?: string; cta: string; href: string };
export type NavItem = {
  href: string;
  label: string;
  groups?: NavGroup[];
  featured?: NavFeatured;
  viewAll?: string;
  children?: NavChild[];
};

export const megaNav: NavItem[] = [
  {
    href: '/collections/engagement-rings',
    label: 'Engagement',
    viewAll: '/collections/engagement-rings',
    groups: [
      {
        title: 'Shop by Style',
        items: [
          { href: '/collections/engagement-rings', label: 'Solitaire' },
          { href: '/collections/engagement-rings', label: 'Halo' },
          { href: '/collections/engagement-rings', label: 'Three-Stone' },
          { href: '/collections/engagement-rings', label: 'Pavé' },
          { href: '/collections/engagement-rings', label: 'Vintage' },
          { href: '/collections/engagement-rings', label: 'Gemstone' },
        ],
      },
      {
        title: 'Shop by Shape',
        items: [
          { href: '/diamonds', label: 'Round' },
          { href: '/diamonds', label: 'Oval' },
          { href: '/diamonds', label: 'Cushion' },
          { href: '/diamonds', label: 'Emerald' },
          { href: '/diamonds', label: 'Pear' },
          { href: '/diamonds', label: 'Princess' },
          { href: '/diamonds', label: 'Marquise' },
          { href: '/diamonds', label: 'Asscher' },
        ],
      },
    ],
    featured: {
      image: '/images/products/heart-halo-ring/cover.jpg',
      title: 'Build Your Ring',
      subtitle: 'Choose your diamond, then your setting',
      cta: 'Start Designing',
      href: '/custom',
    },
  },
  {
    href: '/collections/wedding-bands',
    label: 'Wedding',
    viewAll: '/collections/wedding-bands',
    groups: [
      {
        title: "Women's Bands",
        items: [
          { href: '/collections/wedding-bands', label: 'Eternity Rings' },
          { href: '/collections/wedding-bands', label: 'Pavé Bands' },
          { href: '/collections/wedding-bands', label: 'Stackable Bands' },
          { href: '/collections/wedding-bands', label: 'Enhancers' },
          { href: '/collections/wedding-bands', label: 'Anniversary Rings' },
        ],
      },
      {
        title: "Men's Bands",
        items: [
          { href: '/collections/wedding-bands', label: 'Classic Bands' },
          { href: '/collections/wedding-bands', label: 'Diamond-Set' },
          { href: '/collections/wedding-bands', label: 'Signet Rings' },
        ],
      },
    ],
    featured: {
      image: '/images/placeholder-coming-soon-portrait.jpg',
      title: 'Wedding Collections',
      subtitle: 'Timeless bands crafted in New York — coming soon',
      cta: 'View All Bands',
      href: '/collections/wedding-bands',
    },
  },
  {
    href: '/collections',
    label: 'Jewelry',
    viewAll: '/collections',
    groups: [
      {
        title: 'Earrings',
        items: [
          { href: '/collections/earrings', label: 'Studs' },
          { href: '/collections/earrings', label: 'Hoops' },
          { href: '/collections/earrings', label: 'Drops & Dangles' },
          { href: '/collections/earrings', label: 'Statement' },
        ],
      },
      {
        title: 'Necklaces',
        items: [
          { href: '/collections/necklaces', label: 'Pendants' },
          { href: '/collections/necklaces', label: 'Tennis Necklaces' },
          { href: '/collections/necklaces', label: 'Chains' },
          { href: '/collections/necklaces', label: 'Layering' },
        ],
      },
      {
        title: 'Bracelets',
        items: [
          { href: '/collections/bracelets', label: 'Tennis Bracelets' },
          { href: '/collections/bracelets', label: 'Bangles' },
          { href: '/collections/bracelets', label: 'Stackables' },
        ],
      },
    ],
    featured: {
      image: '/images/products/asscher-halo-drop-earrings/cover.jpg',
      title: 'Fine Jewelry',
      subtitle: 'Handcrafted pieces for every occasion',
      cta: 'Shop All Jewelry',
      href: '/collections',
    },
  },
  {
    href: '/diamonds',
    label: 'Diamonds',
    viewAll: '/diamonds',
    groups: [
      {
        title: 'By Shape',
        items: [
          { href: '/diamonds', label: 'Round' },
          { href: '/diamonds', label: 'Oval' },
          { href: '/diamonds', label: 'Cushion' },
          { href: '/diamonds', label: 'Emerald Cut' },
          { href: '/diamonds', label: 'Pear' },
          { href: '/diamonds', label: 'Princess' },
        ],
      },
      {
        title: 'Learn',
        items: [
          { href: '/diamonds', label: 'The 4 Cs' },
          { href: '/diamonds', label: 'Lab vs Natural' },
          { href: '/diamonds', label: 'GIA & IGI Certified' },
          { href: '/diamonds', label: 'How to Choose' },
        ],
      },
    ],
    featured: {
      image: '/images/products/emerald-halo-stud-earrings/cover.jpg',
      title: '160,000+ Certified Stones',
      subtitle: 'GIA & IGI certified natural and lab diamonds',
      cta: 'Search Diamonds',
      href: '/diamonds',
    },
  },
  {
    href: '/custom',
    label: 'Custom Design',
    viewAll: '/custom',
    groups: [
      {
        title: 'Our Process',
        items: [
          { href: '/custom', label: 'Consultation' },
          { href: '/custom', label: 'Design Concept' },
          { href: '/custom', label: 'Diamond Selection' },
          { href: '/custom', label: 'Crafting' },
          { href: '/custom', label: 'Final Delivery' },
        ],
      },
      {
        title: 'Start With',
        items: [
          { href: '/custom', label: 'Engagement Ring' },
          { href: '/custom', label: 'Wedding Band' },
          { href: '/custom', label: 'Necklace' },
          { href: '/custom', label: 'Earrings' },
          { href: '/custom', label: 'Bracelet' },
        ],
      },
    ],
    featured: {
      image: '/images/placeholder-coming-soon-portrait.jpg',
      title: 'Bespoke Jewelry',
      subtitle: 'Made to order in New York\'s Diamond District',
      cta: 'Book a Consultation',
      href: '/contact',
    },
  },
  { href: '/about', label: 'About' },
];

export const services = [
  "Pavé & natural diamond jewelry",
  "Lab grown and natural diamond jewelry",
  "Loose diamonds",
  "Custom jewelry design",
  "IGI and GIA certified diamonds",
  "Non-certified diamonds"
];

export const processSteps = [
  {
    title: "Consultation",
    copy: "Meet in the Diamond District or begin remotely with stone preferences, occasion, budget, and fit."
  },
  {
    title: "Design Concept",
    copy: "Review silhouettes, metal finish, setting details, and proportions before any stone is reserved."
  },
  {
    title: "Diamond Selection",
    copy: "Compare natural, lab grown, GIA, IGI, and non-certified options with transparent trade guidance."
  },
  {
    title: "Crafting",
    copy: "Approve the final direction while the piece is prepared in rose gold, platinum, white gold, or yellow gold."
  },
  {
    title: "Final Delivery",
    copy: "Inspect, size, insure, and receive care guidance for a piece made to shine with you."
  }
];

export const trustSignals = [
  "GIA Certified",
  "IGI Certified",
  "NYC Diamond District",
  "Custom Design",
  "Natural & Lab Grown Diamonds"
];
