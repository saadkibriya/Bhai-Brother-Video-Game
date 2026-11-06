import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_PRICING_RULES, PricingPackage, PricingRule, SAMPLE_PACKAGES } from './pricing';
import { DEFAULT_WEEKLY_HOURS, WeekdayHours, SpecialHour } from './hours';
import { normalizePhone, syntheticEmail } from './phone';

export interface Station {
  id: string;
  name: string;
  platform: 'ps5' | 'ps4';
  status: 'free' | 'busy' | 'maintenance';
  isActive: boolean;
  sort: number;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  platforms: ('ps5' | 'ps4' | 'arcade')[];
  genres: string[];
  maxPlayers: number;
  tags: string[];
  imageUrl?: string;
  descriptionEn?: string;
  descriptionBn?: string;
  isFeatured: boolean;
}

export interface ArcadeMachine {
  id: string;
  name: string;
  coinsPerPlay: number;
  isActive: boolean;
}

export interface ArcadeRate {
  id: string;
  coins: number;
  priceBdt: number;
  isBase: boolean;
}

export interface ShopSettings {
  nameEn: string;
  nameBn: string;
  taglineEn: string;
  taglineBn: string;
  addressEn: string;
  addressBn: string;
  phones: string[];
  whatsapp: string;
  facebookUrl: string;
  mapLink: string;
  mapEmbedUrl: string;
  lat: number;
  lng: number;
  bookingCodePrefix: string;
  priceRounding: number;
  cancelCutoffMinutes: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  nickname?: string;
  phone: string;
  contactEmail?: string;
  role: 'member' | 'staff' | 'admin';
  isBanned: boolean;
  createdAt: string;
  sessionsCompleted: number;
  totalHours: number;
}

export interface Booking {
  id: string;
  code: string;
  memberId?: string;
  guestName?: string;
  guestPhone?: string;
  platform: 'ps5' | 'ps4';
  stationId?: string;
  gameId?: string;
  startAt: string; // ISO string
  endAt: string;   // ISO string
  players: number;
  estimatedBdt: number;
  actualMinutes?: number;
  note?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  cancelReason?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  titleEn: string;
  titleBn: string;
  bodyEn: string;
  bodyBn: string;
  isActive: boolean;
}

export interface TournamentEvent {
  id: string;
  titleEn: string;
  titleBn: string;
  gameTitle: string;
  platform: 'ps5' | 'ps4';
  dateStr: string;
  entryFeeBdt: number;
  prizeEn: string;
  prizeBn: string;
  registeredCount: number;
  maxSlots: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface FaqItem {
  id: string;
  kind: 'faq' | 'rule';
  qEn: string;
  qBn: string;
  aEn: string;
  aBn: string;
}

import fc26Image from '../assets/images/game_cover_fc26_1793937072193.jpg';
import tekken8Image from '../assets/images/game_cover_tekken8_1793937073457.jpg';
import racingImage from '../assets/images/game_cover_racing_1793937074177.jpg';
import spidermanImage from '../assets/images/game_cover_spiderman_1793937074730.jpg';

// Initial default state
const INITIAL_SETTINGS: ShopSettings = {
  nameEn: 'Bhai Brother Video Game',
  nameBn: 'ভাই ব্রাদার ভিডিও গেম',
  taglineEn: 'PS5 · PS4 · Arcade — play with your squad',
  taglineBn: 'পিএস৫ · পিএস৪ · আর্কেড — স্কোয়াড নিয়ে আসো',
  addressEn: 'Beside Sporsho Beauty Buzz, Green City Residential, Block C, Dhaka Uddan, Mohammadpur, Dhaka-1354',
  addressBn: 'স্পর্শ বিউটি বাজ এর পাশে, গ্রিন সিটি আবাসিক, ব্লক সি, ঢাকা উদ্যান, মোহাম্মদপুর, ঢাকা-১৩৫৪',
  phones: ['01775-533852'],
  whatsapp: '8801775533852',
  facebookUrl: 'https://facebook.com',
  mapLink: 'https://maps.app.goo.gl/dF6cr5AkT2A1JDFQ6',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d912.8!2d90.3371311!3d23.7584635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755bf0030a6a8f9%3A0x59c47b55d14e0920!2sSporsho%20Beauty%20Buzz!5e0!3m2!1sen!2sbd!4v1730900000000!5m2!1sen!2sbd',
  lat: 23.7584635,
  lng: 90.3371311,
  bookingCodePrefix: 'BB-',
  priceRounding: 5,
  cancelCutoffMinutes: 60,
};

const INITIAL_STATIONS: Station[] = [
  { id: 'st-ps5-1', name: 'PS5 #1 (4K HDR OLED)', platform: 'ps5', status: 'free', isActive: true, sort: 1 },
  { id: 'st-ps4-1', name: 'PS4 #1 (Pro Lounge)', platform: 'ps4', status: 'free', isActive: true, sort: 2 },
];

const INITIAL_GAMES: Game[] = [
  {
    id: 'game-fc26',
    title: 'EA SPORTS FC 26',
    slug: 'fc-26',
    platforms: ['ps5', 'ps4'],
    genres: ['Sports', 'Football'],
    maxPlayers: 4,
    tags: ['Popular', 'Multiplayer'],
    isFeatured: true,
    imageUrl: fc26Image,
    descriptionEn: 'The world\'s game with realistic hypermotion, latest squad rosters, and tournament modes.',
    descriptionBn: 'লেটেস্ট স্কোয়াড ও চরম গ্রাফিক্সের সাথে বিশ্বসেরা ফুটবল সিমুলেশন।',
  },
  {
    id: 'game-tekken8',
    title: 'Tekken 8',
    slug: 'tekken-8',
    platforms: ['ps5'],
    genres: ['Fighting'],
    maxPlayers: 2,
    tags: ['Popular', 'New'],
    isFeatured: true,
    imageUrl: tekken8Image,
    descriptionEn: 'Fist meets fate in the next-gen Unreal Engine 5 arcade fighter.',
    descriptionBn: 'নেক্সট-জেন ইঞ্জিন ও স্মুথ কম্বো অ্যাকশন সমৃদ্ধ আর্কেড ফাইটিং গেম।',
  },
  {
    id: 'game-spiderman2',
    title: 'Marvel\'s Spider-Man 2',
    slug: 'spiderman-2',
    platforms: ['ps5'],
    genres: ['Action', 'Adventure'],
    maxPlayers: 1,
    tags: ['New', 'Popular'],
    isFeatured: true,
    imageUrl: spidermanImage,
    descriptionEn: 'Web-sling across NYC as Peter Parker and Miles Morales against Venom with instant fast travel.',
    descriptionBn: 'নিউ ইয়র্কের আকাশে স্পাইডার-ম্যানের হাই-স্পিড ওয়েব সুইং ও আল্টিমেট অ্যাকশন।',
  },
  {
    id: 'game-nfs',
    title: 'Need for Speed Unbound',
    slug: 'nfs-unbound',
    platforms: ['ps5'],
    genres: ['Racing'],
    maxPlayers: 2,
    tags: ['Multiplayer', 'Popular'],
    isFeatured: true,
    imageUrl: racingImage,
    descriptionEn: 'Street racing, cop chases, neon car customization, and thrilling midnight drifts.',
    descriptionBn: 'রাতের রাস্তায় হাই স্পিড স্ট্রিট রেসিং ও কাস্টম ড্র্রিফট অ্যাকশন।',
  },
  {
    id: 'game-mk1',
    title: 'Mortal Kombat 1',
    slug: 'mk-1',
    platforms: ['ps5'],
    genres: ['Fighting'],
    maxPlayers: 2,
    tags: ['Popular'],
    isFeatured: false,
    descriptionEn: 'Reborn Mortal Kombat universe with Kameo fighters and cinematic fatalities.',
    descriptionBn: 'সিনেমেটিক অ্যাকশন এবং নতুন চরিত্র নিয়ে মারাত্মক কমব্যাট অভিজ্ঞতা।',
  },
  {
    id: 'game-gtav',
    title: 'Grand Theft Auto V',
    slug: 'gta-v',
    platforms: ['ps5', 'ps4'],
    genres: ['Action', 'Open World'],
    maxPlayers: 1,
    tags: ['Popular'],
    isFeatured: false,
    descriptionEn: 'Explore Los Santos in 60 FPS 4K with enhanced DualSense haptic feedback.',
    descriptionBn: 'লস স্যান্টোসে উন্মুক্ত ড্রাইভ এবং মিশন অ্যাকশনের সেরা অভিজ্ঞতা।',
  },
  {
    id: 'game-cod',
    title: 'Call of Duty: Modern Warfare III',
    slug: 'cod-mw3',
    platforms: ['ps5', 'ps4'],
    genres: ['Shooter', 'Action'],
    maxPlayers: 2,
    tags: ['Popular'],
    isFeatured: false,
    descriptionEn: 'High-octane FPS combat, multiplayer splitscreen, and classic map rotations.',
    descriptionBn: 'তীব্র বন্দুকযুদ্ধ এবং বন্ধুদের সাথে স্প্লিট-স্ক্রিন মাল্টিপ্লেয়ার।',
  },
  {
    id: 'game-wwe',
    title: 'WWE 2K24',
    slug: 'wwe-2k24',
    platforms: ['ps5', 'ps4'],
    genres: ['Sports', 'Wrestling'],
    maxPlayers: 4,
    tags: ['Multiplayer'],
    isFeatured: false,
    descriptionEn: '40 Years of WrestleMania, Royal Rumble, and 4-player tag team chaos.',
    descriptionBn: 'রয়েল রাম্বল ও ৪ জন খেলোয়াড়ের জমজমাট রেসলিং ফাইট।',
  },
  {
    id: 'game-cricket24',
    title: 'Cricket 24',
    slug: 'cricket-24',
    platforms: ['ps5', 'ps4'],
    genres: ['Sports', 'Cricket'],
    maxPlayers: 2,
    tags: ['Popular'],
    isFeatured: false,
    descriptionEn: 'Official Ashes and world tournaments with realistic Bangladeshi cricket fans favorites.',
    descriptionBn: 'অফিসিয়াল টুর্নামেন্ট ও স্টেডিয়ামে রোমাঞ্চকর ক্রিকেট লড়াই।',
  },
  {
    id: 'game-naruto',
    title: 'Naruto x Boruto Storm Connections',
    slug: 'naruto-storm',
    platforms: ['ps5', 'ps4'],
    genres: ['Fighting', 'Anime'],
    maxPlayers: 2,
    tags: ['Popular'],
    isFeatured: false,
    descriptionEn: 'Over 130 ninja warriors, ultimate jutsu specials, and anime battles.',
    descriptionBn: 'নিনজা কম্বো এবং আল্টিমেট জুতসুর তীব্র অ্যানিমে লড়াই।',
  },
];

const INITIAL_ARCADE_RATES: ArcadeRate[] = [
  { id: 'arc-3', coins: 3, priceBdt: 10, isBase: true },
  { id: 'arc-6', coins: 6, priceBdt: 20, isBase: false },
  { id: 'arc-10', coins: 10, priceBdt: 30, isBase: false },
];

const INITIAL_ARCADE_MACHINES: ArcadeMachine[] = [
  { id: 'm-tekken', name: 'Tekken Arcade Cabinet', coinsPerPlay: 1, isActive: true },
];

const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user-admin',
    fullName: 'Owner Bhai',
    nickname: 'OwnerBhai',
    phone: '8801775533852',
    contactEmail: 'owner@bhaibrother.app',
    role: 'admin',
    isBanned: false,
    createdAt: '2026-01-01T00:00:00Z',
    sessionsCompleted: 140, // Diamond Tier (100+)
    totalHours: 195,
  },
  {
    id: 'user-member-1',
    fullName: 'Rafi Ahmed',
    nickname: 'RafiGamer',
    phone: '8801711223344',
    contactEmail: 'rafi@example.com',
    role: 'member',
    isBanned: false,
    createdAt: '2026-02-10T12:00:00Z',
    sessionsCompleted: 18, // Silver Tier (15-29)
    totalHours: 27,
  },
  {
    id: 'user-member-2',
    fullName: 'Tanvir Hossain',
    nickname: 'TanvirSniper',
    phone: '8801722334455',
    role: 'member',
    isBanned: false,
    createdAt: '2026-02-15T15:00:00Z',
    sessionsCompleted: 34, // Gold Tier (30-59)
    totalHours: 52,
  },
  {
    id: 'user-member-3',
    fullName: 'Shakib Al Amin',
    nickname: 'ShakibPro',
    phone: '8801733445566',
    role: 'member',
    isBanned: false,
    createdAt: '2026-03-01T10:00:00Z',
    sessionsCompleted: 65, // Platinum Tier (60-99)
    totalHours: 98,
  },
  {
    id: 'user-member-4',
    fullName: 'Nayeem Islam',
    nickname: 'NayeemNinja',
    phone: '8801744556677',
    role: 'member',
    isBanned: false,
    createdAt: '2026-03-05T18:00:00Z',
    sessionsCompleted: 8, // Bronze Tier (5-14)
    totalHours: 12,
  },
  {
    id: 'user-member-5',
    fullName: 'Siam Khan',
    nickname: 'SiamStriker',
    phone: '8801755667788',
    role: 'member',
    isBanned: false,
    createdAt: '2026-03-10T14:00:00Z',
    sessionsCompleted: 3, // Rookie Tier (0-4)
    totalHours: 4,
  },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    titleEn: 'Weekend FC 26 1v1 Tournament',
    titleBn: 'উইকেন্ড এফসি ২৬ ১ বনাম ১ টুর্নামেন্ট',
    bodyEn: 'Registration open! Champion takes ৳২,০০০ cash + 5 hours free PS5 game time. Talk to counter or book your slot.',
    bodyBn: 'রেজিস্ট্রেশন চলছে! চ্যাম্পিয়ন পাবে ২,০০০ টাকা ক্যাশ প্রাইজ ও ৫ ঘণ্টা ফ্রি পিএস৫ গেমিং। কাউন্টারে যোগাযোগ করুন।',
    isActive: true,
  },
];

const INITIAL_EVENTS: TournamentEvent[] = [
  {
    id: 'evt-1',
    titleEn: 'FC 26 Friday Showdown',
    titleBn: 'এফসি ২৬ ফ্রাইডে শো-ডাউন',
    gameTitle: 'EA SPORTS FC 26',
    platform: 'ps5',
    dateStr: 'This Friday · 4:00 PM',
    entryFeeBdt: 100,
    prizeEn: '৳2,000 Cash + Trophy',
    prizeBn: '৳২,০০০ ক্যাশ + ট্রফি',
    registeredCount: 12,
    maxSlots: 16,
    status: 'upcoming',
  },
  {
    id: 'evt-2',
    titleEn: 'Tekken 8 King of Iron Fist Dhaka',
    titleBn: 'টেকেন ৮ কিং অফ আয়রন ফিস্ট',
    gameTitle: 'Tekken 8',
    platform: 'ps5',
    dateStr: 'Next Saturday · 6:00 PM',
    entryFeeBdt: 150,
    prizeEn: '৳3,000 Cash + 10h Game Time',
    prizeBn: '৳৩,০০০ ক্যাশ + ১০ ঘণ্টা গেমিং',
    registeredCount: 8,
    maxSlots: 16,
    status: 'upcoming',
  },
];

const INITIAL_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    kind: 'faq',
    qEn: 'Can I play with my own squad (3-4 players)?',
    qBn: 'আমরা কি ৩-৪ জন বন্ধু একসাথে খেলতে পারব?',
    aEn: 'Yes! All PS5 & PS4 stations support up to 4 wireless controllers for multiplayer games like FC 26, WWE 2K, etc.',
    aBn: 'হ্যাঁ! আমাদের প্রতিটি পিএস৫ ও পিএস৪ স্টেশনে ৪টি কন্ট্রোলার দিয়ে ফিফা, ডাব্লিউডাব্লিউই সহ অন্যান্য গেম খেলা যায়।',
  },
  {
    id: 'faq-2',
    kind: 'faq',
    qEn: 'What is the arcade token rate?',
    qBn: 'আর্কেড টোকেনের রেট কত?',
    aEn: 'Arcade tokens are 3 coins for ৳10. Special pack: 10 coins for ৳30.',
    aBn: 'আর্কেড টোকেন ৩ টি কয়েন মাত্র ১০ টাকায় পাওয়া যায়। ১০টি কয়েনের স্পেশাল প্যাক ৩০ টাকা।',
  },
  {
    id: 'rule-arrival',
    kind: 'rule',
    qEn: 'Arrival Buffer Policy (10 to 20 Mins Early)',
    qBn: 'স্লট শুরুর ১০-২০ মিনিট আগে উপস্থিতির নিয়ম',
    aEn: 'Members must be present at the shop 10 to 20 minutes before their booked start time to check in and claim their station. If you do not arrive at least 10 minutes prior, the slot may be released to waiting walk-in players.',
    aBn: 'বুকিংকৃত খেলোয়াড়দের তাদের স্লট শুরুর অন্তত ১০ থেকে ২০ মিনিট আগে শপে উপস্থিত থাকতে হবে। ১০ মিনিট আগে উপস্থিত না হলে স্লটটি অন্য অপেক্ষমান খেলোয়াড়দের দিয়ে দেওয়া হতে পারে।',
  },
  {
    id: 'rule-1',
    kind: 'rule',
    qEn: 'Controller Care & Fair Play',
    qBn: 'কন্ট্রোলারের যত্ন ও সুন্দর আচরণ',
    aEn: 'Please handle DualSense and DualShock controllers with care. Aggressive banging, throwing, or misuse is strictly prohibited.',
    aBn: 'দয়া করে জয়স্টিক ও কন্ট্রোলার সাবধানে ব্যবহার করবেন। কোনো প্রকার আছাড় বা ক্ষতির ক্ষেত্রে জরিমানা প্রযোজ্য।',
  },
  {
    id: 'rule-2',
    kind: 'rule',
    qEn: 'Clean Environment & No Smoking',
    qBn: 'ধূমপানমুক্ত ও পরিচ্ছন্ন পরিবেশ',
    aEn: 'Smoking or consumption of messy outside food around console tables is strictly prohibited to keep equipment clean.',
    aBn: 'গেমিং জোনের ভিতরে ধূমপান সম্পূর্ণ নিষিদ্ধ। খাবারের উচ্ছিষ্টাংশ টেবিলে ফেলবেন না।',
  },
];

interface StoreContextType {
  settings: ShopSettings;
  updateSettings: (newSettings: Partial<ShopSettings>) => void;
  stations: Station[];
  updateStationStatus: (stationId: string, status: 'free' | 'busy' | 'maintenance') => void;
  games: Game[];
  addGame: (game: Omit<Game, 'id'>) => void;
  updateGame: (id: string, updates: Partial<Game>) => void;
  deleteGame: (id: string) => void;
  pricingRules: Record<'ps5' | 'ps4', PricingRule>;
  updatePricingRule: (platform: 'ps5' | 'ps4', updates: Partial<PricingRule>) => void;
  pricingPackages: PricingPackage[];
  arcadeRates: ArcadeRate[];
  arcadeMachines: ArcadeMachine[];
  weeklyHours: WeekdayHours[];
  updateWeekdayHours: (weekday: number, updates: Partial<WeekdayHours>) => void;
  specialHours: SpecialHour[];
  addSpecialHour: (special: SpecialHour) => void;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  loginWithPhone: (phone: string, password?: string) => { success: boolean; error?: string };
  registerUser: (data: { fullName: string; phone: string; nickname?: string; contactEmail?: string }) => { success: boolean; error?: string; user?: UserProfile };
  logout: () => void;
  bookings: Booking[];
  createBooking: (bookingData: {
    platform: 'ps5' | 'ps4';
    startAt: string;
    durationMinutes: number;
    players: number;
    gameId?: string;
    note?: string;
    guestName?: string;
    guestPhone?: string;
  }) => { success: boolean; error?: string; booking?: Booking };
  cancelBooking: (bookingId: string, reason?: string) => { success: boolean; error?: string };
  updateBookingStatus: (bookingId: string, status: Booking['status'], stationId?: string) => void;
  announcements: Announcement[];
  events: TournamentEvent[];
  registerEventInterest: (eventId: string) => void;
  faqs: FaqItem[];
  lang: 'en' | 'bn';
  setLang: (l: 'en' | 'bn') => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  allMembers: UserProfile[];
  toggleBanMember: (userId: string) => void;
  resetMemberPassword: (userId: string) => void;
  promoteMember: (userId: string, role: 'member' | 'staff' | 'admin') => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_PREFIX = 'bhaibrother_gameshop_v5_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage write error:', err);
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ShopSettings>(() => loadFromStorage('settings', INITIAL_SETTINGS));
  const [stations, setStations] = useState<Station[]>(() => loadFromStorage('stations', INITIAL_STATIONS));
  const [games, setGames] = useState<Game[]>(() => loadFromStorage('games', INITIAL_GAMES));
  const [pricingRules, setPricingRules] = useState<Record<'ps5' | 'ps4', PricingRule>>(() =>
    loadFromStorage('pricing_rules', DEFAULT_PRICING_RULES)
  );
  const [pricingPackages] = useState<PricingPackage[]>(() => loadFromStorage('pricing_packages', SAMPLE_PACKAGES));
  const [arcadeRates] = useState<ArcadeRate[]>(() => loadFromStorage('arcade_rates', INITIAL_ARCADE_RATES));
  const [arcadeMachines] = useState<ArcadeMachine[]>(() => loadFromStorage('arcade_machines', INITIAL_ARCADE_MACHINES));
  const [weeklyHours, setWeeklyHours] = useState<WeekdayHours[]>(() => loadFromStorage('weekly_hours', DEFAULT_WEEKLY_HOURS));
  const [specialHours, setSpecialHours] = useState<SpecialHour[]>(() => loadFromStorage('special_hours', []));
  const [allMembers, setAllMembers] = useState<UserProfile[]>(() => loadFromStorage('members', INITIAL_PROFILES));
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => loadFromStorage('current_user', INITIAL_PROFILES[1])); // Default to logged-in Rafi for preview convenience
  const [bookings, setBookings] = useState<Booking[]>(() => loadFromStorage('bookings', [
    {
      id: 'bk-sample-confirmed-today',
      code: 'BB-7A9P',
      memberId: 'user-member-1',
      platform: 'ps5',
      stationId: 'st-ps5-1',
      gameId: 'game-fc26',
      startAt: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
      endAt: new Date(Date.now() + 10800000).toISOString(),
      players: 2,
      estimatedBdt: 140,
      note: 'FC 26 Friday Derby Match',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bk-sample-tomorrow',
      code: 'BB-9X2K',
      memberId: 'user-member-2',
      platform: 'ps5',
      stationId: 'st-ps5-1',
      gameId: 'game-tekken8',
      startAt: new Date(Date.now() + 86400000).toISOString(),
      endAt: new Date(Date.now() + 86400000 + 7200000).toISOString(),
      players: 2,
      estimatedBdt: 280,
      note: 'Tekken 8 championship practice',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bk-sample-ps4-upcoming',
      code: 'BB-4Q1L',
      guestName: 'Kazi Noman',
      guestPhone: '8801799887766',
      platform: 'ps4',
      stationId: 'st-ps4-1',
      startAt: new Date(Date.now() + 14400000).toISOString(), // 4 hours from now
      endAt: new Date(Date.now() + 18000000).toISOString(),
      players: 2,
      estimatedBdt: 100,
      note: 'WWE 2K squad fight',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bk-sample-past-1',
      code: 'BB-7R4M',
      memberId: 'user-member-1',
      platform: 'ps5',
      stationId: 'st-ps5-1',
      startAt: new Date(Date.now() - 172800000).toISOString(),
      endAt: new Date(Date.now() - 172800000 + 3600000).toISOString(),
      players: 1,
      estimatedBdt: 70,
      actualMinutes: 60,
      status: 'completed',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'bk-sample-past-2',
      code: 'BB-3M5K',
      memberId: 'user-member-3',
      platform: 'ps4',
      stationId: 'st-ps4-1',
      startAt: new Date(Date.now() - 259200000).toISOString(),
      endAt: new Date(Date.now() - 259200000 + 7200000).toISOString(),
      players: 2,
      estimatedBdt: 200,
      actualMinutes: 120,
      status: 'completed',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
    }
  ]));
  const [announcements] = useState<Announcement[]>(() => loadFromStorage('announcements', INITIAL_ANNOUNCEMENTS));
  const [events, setEvents] = useState<TournamentEvent[]>(() => loadFromStorage('events', INITIAL_EVENTS));
  const [faqs] = useState<FaqItem[]>(() => loadFromStorage('faqs', INITIAL_FAQS));

  const [lang, setLangState] = useState<'en' | 'bn'>(() => {
    return (localStorage.getItem('bhaibrother_lang') as 'en' | 'bn') || 'en';
  });

  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('bhaibrother_theme') as 'dark' | 'light') || 'dark';
  });

  // Sync lang to html attribute
  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem('bhaibrother_lang', lang);
  }, [lang]);

  // Sync theme to html class and storage
  useEffect(() => {
    localStorage.setItem('bhaibrother_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Save changes to storage
  useEffect(() => saveToStorage('settings', settings), [settings]);
  useEffect(() => saveToStorage('stations', stations), [stations]);
  useEffect(() => saveToStorage('games', games), [games]);
  useEffect(() => saveToStorage('pricing_rules', pricingRules), [pricingRules]);
  useEffect(() => saveToStorage('weekly_hours', weeklyHours), [weeklyHours]);
  useEffect(() => saveToStorage('special_hours', specialHours), [specialHours]);
  useEffect(() => saveToStorage('members', allMembers), [allMembers]);
  useEffect(() => saveToStorage('current_user', currentUser), [currentUser]);
  useEffect(() => saveToStorage('bookings', bookings), [bookings]);
  useEffect(() => saveToStorage('events', events), [events]);

  const updateSettings = (newSettings: Partial<ShopSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateStationStatus = (stationId: string, status: 'free' | 'busy' | 'maintenance') => {
    setStations((prev) =>
      prev.map((s) => (s.id === stationId ? { ...s, status } : s))
    );
  };

  const addGame = (gameData: Omit<Game, 'id'>) => {
    const newGame: Game = {
      ...gameData,
      id: `game-${Date.now()}`,
    };
    setGames((prev) => [newGame, ...prev]);
  };

  const updateGame = (id: string, updates: Partial<Game>) => {
    setGames((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteGame = (id: string) => {
    setGames((prev) => prev.filter((g) => g.id !== id));
  };

  const updatePricingRule = (platform: 'ps5' | 'ps4', updates: Partial<PricingRule>) => {
    setPricingRules((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], ...updates },
    }));
  };

  const updateWeekdayHours = (weekday: number, updates: Partial<WeekdayHours>) => {
    setWeeklyHours((prev) =>
      prev.map((h) => (h.weekday === weekday ? { ...h, ...updates } : h))
    );
  };

  const addSpecialHour = (special: SpecialHour) => {
    setSpecialHours((prev) => [...prev.filter((s) => s.date !== special.date), special]);
  };

  const loginWithPhone = (rawPhone: string) => {
    const { isValid, normalized, error } = normalizePhone(rawPhone);
    if (!isValid) {
      return { success: false, error: error || 'Invalid phone' };
    }

    const member = allMembers.find((m) => m.phone === normalized);
    if (!member) {
      return { success: false, error: 'No account found with this phone. Please register.' };
    }

    if (member.isBanned) {
      return { success: false, error: 'Your account has been suspended by management.' };
    }

    setCurrentUser(member);
    return { success: true };
  };

  const registerUser = (data: { fullName: string; phone: string; nickname?: string; contactEmail?: string }) => {
    const { isValid, normalized, error } = normalizePhone(data.phone);
    if (!isValid) {
      return { success: false, error: error || 'Invalid Bangladeshi mobile phone' };
    }

    if (allMembers.some((m) => m.phone === normalized)) {
      return { success: false, error: 'An account with this phone already exists. Please log in.' };
    }

    if (data.nickname && allMembers.some((m) => m.nickname?.toLowerCase() === data.nickname?.toLowerCase())) {
      return { success: false, error: 'This nickname is already taken. Please choose another.' };
    }

    const newMember: UserProfile = {
      id: `user-${Date.now()}`,
      fullName: data.fullName.trim(),
      nickname: data.nickname?.trim() || undefined,
      phone: normalized,
      contactEmail: data.contactEmail?.trim() || syntheticEmail(normalized),
      role: 'member',
      isBanned: false,
      createdAt: new Date().toISOString(),
      sessionsCompleted: 0,
      totalHours: 0,
    };

    setAllMembers((prev) => [...prev, newMember]);
    setCurrentUser(newMember);

    // Link any guest bookings with matching phone
    setBookings((prev) =>
      prev.map((b) => (b.guestPhone === normalized ? { ...b, memberId: newMember.id } : b))
    );

    return { success: true, user: newMember };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const createBooking = (bookingData: {
    platform: 'ps5' | 'ps4';
    startAt: string;
    durationMinutes: number;
    players: number;
    gameId?: string;
    note?: string;
    guestName?: string;
    guestPhone?: string;
  }) => {
    const start = new Date(bookingData.startAt);
    const now = new Date();

    if (start.getTime() < now.getTime() + 10 * 60000) {
      return { success: false, error: 'Booking must be at least 15 minutes in advance.' };
    }

    const end = new Date(start.getTime() + bookingData.durationMinutes * 60000);

    // Calculate capacity
    const activeStations = stations.filter(
      (s) => s.platform === bookingData.platform && s.status !== 'maintenance' && s.isActive
    );

    const overlapping = bookings.filter(
      (b) =>
        b.platform === bookingData.platform &&
        b.status !== 'cancelled' &&
        b.status !== 'no_show' &&
        new Date(b.startAt) < end &&
        new Date(b.endAt) > start
    );

    if (overlapping.length >= activeStations.length) {
      return {
        success: false,
        error: `All ${bookingData.platform.toUpperCase()} stations are currently booked at this time. Please choose another slot.`,
      };
    }

    // Rate calculation
    const rule = pricingRules[bookingData.platform];
    const base = (rule.hourly_bdt * bookingData.durationMinutes) / 60;
    const extra = (rule.extra_player_hourly_bdt * Math.max(0, bookingData.players - 1) * bookingData.durationMinutes) / 60;
    const estBdt = Math.ceil((base + extra) / settings.priceRounding) * settings.priceRounding;

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `${settings.bookingCodePrefix}${randomSuffix}`;

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      code,
      memberId: currentUser?.id,
      guestName: bookingData.guestName,
      guestPhone: bookingData.guestPhone,
      platform: bookingData.platform,
      gameId: bookingData.gameId,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      players: bookingData.players,
      estimatedBdt: estBdt,
      note: bookingData.note,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    return { success: true, booking: newBooking };
  };

  const cancelBooking = (bookingId: string, reason = 'Cancelled by member') => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, error: 'Booking not found' };

    const start = new Date(booking.startAt);
    const now = new Date();
    const minutesRemaining = (start.getTime() - now.getTime()) / 60000;

    if (minutesRemaining < settings.cancelCutoffMinutes && currentUser?.role === 'member') {
      return {
        success: false,
        error: `Cancellation cutoff is ${settings.cancelCutoffMinutes} minutes before the session starts.`,
      };
    }

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled', cancelReason: reason } : b))
    );
    return { success: true };
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status'], stationId?: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const updated = { ...b, status };
          if (stationId) updated.stationId = stationId;
          return updated;
        }
        return b;
      })
    );

    // If status changed to completed, increment member's completed sessions
    if (status === 'completed') {
      const target = bookings.find((b) => b.id === bookingId);
      if (target?.memberId) {
        setAllMembers((prev) =>
          prev.map((m) =>
            m.id === target.memberId
              ? {
                  ...m,
                  sessionsCompleted: m.sessionsCompleted + 1,
                  totalHours: m.totalHours + Math.round((new Date(target.endAt).getTime() - new Date(target.startAt).getTime()) / 3600000),
                }
              : m
          )
        );
      }
    }
  };

  const registerEventInterest = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e))
    );
  };

  const toggleBanMember = (userId: string) => {
    setAllMembers((prev) =>
      prev.map((m) => (m.id === userId ? { ...m, isBanned: !m.isBanned } : m))
    );
  };

  const resetMemberPassword = (_userId: string) => {
    // In local store, simulation of password reset
  };

  const promoteMember = (userId: string, role: 'member' | 'staff' | 'admin') => {
    setAllMembers((prev) => prev.map((m) => (m.id === userId ? { ...m, role } : m)));
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        updateSettings,
        stations,
        updateStationStatus,
        games,
        addGame,
        updateGame,
        deleteGame,
        pricingRules,
        updatePricingRule,
        pricingPackages,
        arcadeRates,
        arcadeMachines,
        weeklyHours,
        updateWeekdayHours,
        specialHours,
        addSpecialHour,
        currentUser,
        setCurrentUser,
        loginWithPhone,
        registerUser,
        logout,
        bookings,
        createBooking,
        cancelBooking,
        updateBookingStatus,
        announcements,
        events,
        registerEventInterest,
        faqs,
        lang,
        setLang: setLangState,
        theme,
        setTheme: setThemeState,
        allMembers,
        toggleBanMember,
        resetMemberPassword,
        promoteMember,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};
