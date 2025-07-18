import type { Star } from "lucide-react";

export type Stylist = {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  avatarUrl: string;
  imageUrl: string; // Added imageUrl to Stylist type
  rating: number;
  reviewCount: number;
  portfolio: string[];
};

export type Service = {
  id: string;
  name: string;
  category: 'Hair' | 'Nails' | 'Beauty';
  description: string;
  price: number;
  duration: number; // in minutes
  imageUrl: string;
};

export type Review = {
  id: string;
  author: string;
  avatarUrl: string;
  rating: number;
  comment: string;
  date: string;
};

export const stylists: Stylist[] = [
  {
    id: '1',
    name: 'Amina Diallo',
    specialty: 'Expert in Balayage',
    bio: 'Amina is a master colorist with over 10 years of experience, specializing in natural-looking highlights and vibrant color transformations. Her artistic vision and precision make her a client favorite.',
    avatarUrl: 'https://placehold.co/100x100',
    imageUrl: 'https://placehold.co/600x400', // Using a different placeholder for the card image
    rating: 4.9,
    reviewCount: 124,
    portfolio: [
      'https://placehold.co/600x400',
      'https://placehold.co/600x400',
      'https://placehold.co/600x400',
      'https://placehold.co/600x400',
    ],
  },
  {
    id: '2',
    name: 'Beverly Osu',
    specialty: 'Creative Nail Art',
    bio: 'Beverly turns nails into miniature masterpieces. From minimalist chic to bold, intricate designs, she uses high-quality products to ensure your manicure is both beautiful and long-lasting.',
    avatarUrl: 'https://placehold.co/100x100',
    imageUrl: 'https://placehold.co/600x400', // Using a different placeholder for the card image
    rating: 5.0,
    reviewCount: 98,
    portfolio: [
      'https://placehold.co/600x400',
      'https://placehold.co/600x400',
      'https://placehold.co/600x400',
    ],
  },
  {
    id: '3',
    name: 'Chidi Okoro',
    specialty: 'Precision Haircuts',
    bio: "With a keen eye for detail, Chidi crafts haircuts that perfectly complement your face shape and lifestyle. He believes a great haircut is the foundation of any great style.",
    avatarUrl: 'https://placehold.co/100x100',
    imageUrl: 'https://placehold.co/600x400', // Using a different placeholder for the card image
    rating: 4.8,
    reviewCount: 85,
    portfolio: [
        'https://placehold.co/600x400',
        'https://placehold.co/600x400',
    ],
  },
];

export const services: Service[] = [
  {
    id: 's1',
    category: 'Hair',
    name: 'Signature Haircut & Style',
    description: 'A personalized haircut followed by a professional blowout and style.',
    price: 75,
    duration: 60,
    imageUrl: 'https://placehold.co/300x200',
  },
  {
    id: 's2',
    category: 'Hair',
    name: 'Full Balayage',
    description: 'Hand-painted highlights for a natural, sun-kissed look. Includes gloss and blowout.',
    price: 250,
    duration: 180,
    imageUrl: 'https://placehold.co/300x200',
  },
  {
    id: 's3',
    category: 'Nails',
    name: 'Gel Manicure',
    description: 'A long-lasting manicure with your choice of gel polish, including nail shaping and cuticle care.',
    price: 50,
    duration: 45,
    imageUrl: 'https://placehold.co/300x200',
  },
  {
    id: 's4',
    category: 'Nails',
    name: 'Custom Nail Art',
    description: 'Express your style with custom nail art. Price and duration vary based on design complexity.',
    price: 20, // Starting price
    duration: 30, // Starting duration
    imageUrl: 'https://placehold.co/300x200',
  },
   {
    id: 's5',
    category: 'Beauty',
    name: 'Eyebrow Shaping & Tint',
    description: 'Define your brows with professional waxing, shaping, and tinting for a polished look.',
    price: 40,
    duration: 30,
    imageUrl: 'https://placehold.co/300x200',
  },
];

export const reviews: Review[] = [
    {
        id: 'r1',
        author: 'Fatima',
        avatarUrl: 'https://placehold.co/50x50',
        rating: 5,
        comment: "Amina is a genius! She knew exactly what to do with my hair. I've never felt so confident. The salon itself is gorgeous and so relaxing.",
        date: '2 days ago',
    },
     {
        id: 'r2',
        author: 'Zainab',
        avatarUrl: 'https://placehold.co/50x50',
        rating: 5,
        comment: "Beverly's nail art is out of this world. She is so creative and her attention to detail is incredible. I get so many compliments!",
        date: '1 week ago',
    },
    {
        id: 'r3',
        author: 'Tolu',
        avatarUrl: 'https://placehold.co/50x50',
        rating: 5,
        comment: "Best haircut of my life from Chidi. He listened to what I wanted and gave me a style that's easy to manage and looks amazing.",
        date: '3 weeks ago',
    }
];

export const portfolioImages = [
  { src: "https://placehold.co/600x800", alt: "Elegant hairstyle", hint: "elegant hairstyle" },
  { src: "https://placehold.co/600x800", alt: "Vibrant hair color", hint: "vibrant hair" },
  { src: "https://placehold.co/600x800", alt: "Intricate nail art", hint: "nail art" },
  { src: "https://placehold.co/600x800", alt: "Chic short haircut", hint: "chic haircut" },
];

export const promotions = [
  {
    title: "20% Off Your First Color Service",
    description: "New clients can enjoy a special discount on any hair color treatment. Mention this offer when booking.",
  },
  {
    title: "Mid-Week Manicure Special",
    description: "Book a gel manicure on a Tuesday or Wednesday and receive a complimentary hand massage.",
  },
]
