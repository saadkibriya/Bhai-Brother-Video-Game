import fc26 from '../assets/images/fc26.webp';
import tekken8 from '../assets/images/tekken8.webp';
import racing from '../assets/images/racing.webp';
import spiderman from '../assets/images/spiderman.webp';
import loungeLarge from '../assets/images/lounge-1200.webp';
import loungeSmall from '../assets/images/lounge-700.webp';
import type { Platform } from '../lib/pricing';

export { SHOP } from './contact';

export const photos = {
  lounge: loungeLarge,
  loungeSmall,
};

export interface Bay {
  id: Platform;
  title: string;
  rate: number;
  platforms: string;
  copy: string;
  specs: string[];
}

export const BAYS: Bay[] = [
  {
    id: 'ps5',
    title: 'PlayStation 5',
    rate: 70,
    platforms: 'PS5',
    copy: 'The big screen. 4K, fast loads, and four DualSense pads so nobody has to sit out.',
    specs: ['4K HDR screen', '4 wireless controllers', 'FC 26 · Tekken 8 · Spider-Man 2'],
  },
  {
    id: 'ps4',
    title: 'PlayStation 4',
    rate: 50,
    platforms: 'PS4',
    copy: 'The dependable one. Cheaper hours, quick rematches, same couch for the whole squad.',
    specs: ['4 controllers', 'GTA V · WWE 2K · Cricket 24'],
  },
];

export const ARCADE = {
  title: 'Coin-op corner',
  rate: '৳10',
  rateNote: '3 tokens',
  copy: 'Tekken cabinet and a stack of classics. Tokens at the counter, no booking needed.',
  packs: [
    { tokens: 3, price: 10 },
    { tokens: 6, price: 20 },
    { tokens: 10, price: 30 },
  ],
};

export interface Pass {
  name: string;
  detail: string;
  ps5: number;
  ps4: number;
  wasPs5?: number;
  wasPs4?: number;
}

export const PASSES: Pass[] = [
  { name: 'Squad pass', detail: '3 hours, one visit', ps5: 190, ps4: 135, wasPs5: 210, wasPs4: 150 },
  { name: 'Weekly pass', detail: '7 hours across 7 days', ps5: 420, ps4: 300 },
  { name: 'Monthly pass', detail: '30 hours across 30 days', ps5: 1750, ps4: 1200 },
];

export interface Game {
  title: string;
  platforms: (Platform | 'arcade')[];
  genre: string;
  players: number;
  blurb: string;
  cover?: string;
  tag?: string;
}

export const GAMES: Game[] = [
  {
    title: 'EA SPORTS FC 26',
    platforms: ['ps5', 'ps4'],
    genre: 'Football',
    players: 4,
    blurb: 'The house favourite. Squad rosters, quick matches, and a lot of shouting.',
    cover: fc26,
    tag: 'Most played',
  },
  {
    title: 'Tekken 8',
    platforms: ['ps5'],
    genre: 'Fighting',
    players: 2,
    blurb: 'King of the couch. Best of five, loser buys the next round of tokens.',
    cover: tekken8,
    tag: 'Tournament',
  },
  {
    title: "Marvel's Spider-Man 2",
    platforms: ['ps5'],
    genre: 'Action',
    players: 1,
    blurb: 'Swing across New York, hand the pad over when you fall off a building.',
    cover: spiderman,
  },
  {
    title: 'Need for Speed Unbound',
    platforms: ['ps5'],
    genre: 'Racing',
    players: 2,
    blurb: 'Neon, midnight streets and police chases. Bring your own playlist energy.',
    cover: racing,
  },
  { title: 'Mortal Kombat 1', platforms: ['ps5'], genre: 'Fighting', players: 2, blurb: 'Fatalities on the big screen. Keep it friendly, keep the deposit.' },
  { title: 'Grand Theft Auto V', platforms: ['ps5', 'ps4'], genre: 'Open world', players: 1, blurb: 'Los Santos at 60 fps. Still the best way to kill an hour.' },
  { title: 'Call of Duty: Modern Warfare III', platforms: ['ps5', 'ps4'], genre: 'Shooter', players: 2, blurb: 'Split-screen multiplayer for when the wifi at home is not cooperating.' },
  { title: 'WWE 2K24', platforms: ['ps5', 'ps4'], genre: 'Wrestling', players: 4, blurb: 'Royal Rumble with the whole squad. Tables are encouraged.' },
  { title: 'Cricket 24', platforms: ['ps5', 'ps4'], genre: 'Cricket', players: 2, blurb: 'For the ones who argue about the national team between overs.' },
  { title: 'Naruto x Boruto Storm Connections', platforms: ['ps5', 'ps4'], genre: 'Fighting', players: 2, blurb: '130+ ninja, big jutsu, zero chill.' },
];

export const FAQS = [
  {
    q: 'Do I need to book, or can I walk in?',
    a: 'Walk in any time we are open. If you want a specific evening — Friday and Saturday after 7 PM — send a booking request on WhatsApp so we can keep a station for you.',
  },
  {
    q: 'Is the price per person or per station?',
    a: 'Per person. Each player pays ৳70/hr on PS5 or ৳50/hr on PS4, and a half hour is ৳40 or ৳30. Four people on one station each pay their share; arcade tokens are separate.',
  },
  {
    q: 'How many controllers do you have?',
    a: 'Four wireless controllers per station. Games that support four players: FC 26, WWE 2K24, and most sports titles.',
  },
  {
    q: 'How early should we arrive?',
    a: 'At least 10 minutes before your slot, so we can set the game up and hand over the pads. We only hold a booking until 10 minutes after the start time — after that the booking is lost and the station goes to walk-ins. If you are running late, call the counter.',
  },
  {
    q: 'How do we pay?',
    a: 'Cash, bKash or Nagad at the counter, after your session. Bookings are not prepaid.',
  },
  {
    q: 'Can we book for a birthday or a whole squad?',
    a: 'Yes. Message the counter on WhatsApp with the date, time and how many people, and we will hold the stations together. For groups of six or more, give us a day so we can block the floor.',
  },
  {
    q: 'Can I come alone?',
    a: 'Absolutely. Solo players are welcome — take a pad, take the couch, and we can match you with someone waiting for a match. The hourly rate is per person.',
  },
  {
    q: 'Can we bring food or smoke?',
    a: 'Outside food is fine if you keep it off the console tables. Smoking and vaping are not allowed inside.',
  },
];

export const TOURNAMENT = {
  title: 'Friday Showdown',
  game: 'EA SPORTS FC 26',
  when: 'Every Friday · 4 PM',
  entry: 100,
  prize: '৳2,000 + trophy',
  format: '1v1 · 16 players',
};
