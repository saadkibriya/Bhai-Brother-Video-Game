/**
 * Shop Hours Logic in Asia/Dhaka (UTC+6)
 * Requirements: FR-HRS-01, FR-HRS-02, FR-HRS-03, FR-HRS-04
 */

export interface WeekdayHours {
  weekday: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  nameEn: string;
  nameBn: string;
  open: string;  // "14:00"
  close: string; // "23:00" or "01:00"
  isClosed?: boolean;
}

export const DEFAULT_WEEKLY_HOURS: WeekdayHours[] = [
  { weekday: 6, nameEn: 'Saturday', nameBn: 'শনিবার', open: '14:00', close: '23:00' },
  { weekday: 0, nameEn: 'Sunday', nameBn: 'রবিবার', open: '14:00', close: '23:00' },
  { weekday: 1, nameEn: 'Monday', nameBn: 'সোমবার', open: '14:00', close: '23:00' },
  { weekday: 2, nameEn: 'Tuesday', nameBn: 'মঙ্গলবার', open: '14:00', close: '23:00' },
  { weekday: 3, nameEn: 'Wednesday', nameBn: 'বুধবার', open: '14:00', close: '23:00' },
  { weekday: 4, nameEn: 'Thursday', nameBn: 'বৃহস্পতিবার', open: '14:00', close: '01:00' },
  { weekday: 5, nameEn: 'Friday', nameBn: 'শুক্রবার', open: '15:00', close: '00:00' },
];

export interface SpecialHour {
  date: string; // "YYYY-MM-DD"
  open?: string;
  close?: string;
  isClosed: boolean;
  noteEn?: string;
  noteBn?: string;
}

export const SAMPLE_SPECIAL_HOURS: SpecialHour[] = [];

/**
 * Converts any Date to Dhaka Local Time components (Year, Month, Date, Day, Hours, Minutes)
 */
export function getDhakaTimeParts(inputDate: Date = new Date()) {
  // Asia/Dhaka is fixed at UTC+6 (360 minutes offset, no daylight savings)
  const utcMillis = inputDate.getTime() + inputDate.getTimezoneOffset() * 60000;
  const dhakaMillis = utcMillis + 6 * 3600000;
  const dhakaDate = new Date(dhakaMillis);

  return {
    year: dhakaDate.getFullYear(),
    month: dhakaDate.getMonth(), // 0-11
    date: dhakaDate.getDate(),
    weekday: dhakaDate.getDay(), // 0=Sun, 6=Sat
    hours: dhakaDate.getHours(),
    minutes: dhakaDate.getMinutes(),
    totalMinutes: dhakaDate.getHours() * 60 + dhakaDate.getMinutes(),
    dateString: `${dhakaDate.getFullYear()}-${String(dhakaDate.getMonth() + 1).padStart(2, '0')}-${String(dhakaDate.getDate()).padStart(2, '0')}`,
    jsDate: dhakaDate,
  };
}

function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function format12Hour(timeStr: string, lang: 'en' | 'bn' = 'en'): string {
  const [h, m] = timeStr.split(':').map(Number);
  const periodEn = h >= 12 ? 'PM' : 'AM';
  const hours12 = h % 12 || 12;
  const minStr = m > 0 ? `:${String(m).padStart(2, '0')}` : '';

  if (lang === 'bn') {
    let periodBn = 'সকাল';
    if (h >= 12 && h < 15) periodBn = 'দুপুর';
    else if (h >= 15 && h < 18) periodBn = 'বিকাল';
    else if (h >= 18 && h < 20) periodBn = 'সন্ধ্যা';
    else if (h >= 20 || h < 4) periodBn = 'রাত';

    const bnHours = String(hours12).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
    const bnMin = m > 0 ? `:${String(m).padStart(2, '0').replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)])}` : '';
    return `${periodBn} ${bnHours}${bnMin}`;
  }

  return `${hours12}${minStr} ${periodEn}`;
}

export interface ShopOpenStatus {
  isOpen: boolean;
  isClosingSoon: boolean;
  status: 'open' | 'closing_soon' | 'closed';
  labelEn: string;
  labelBn: string;
  todayHoursEn: string;
  todayHoursBn: string;
  noteEn?: string;
  noteBn?: string;
}

export function getOpenStatus(
  currentDate: Date = new Date(),
  weeklyHours: WeekdayHours[] = DEFAULT_WEEKLY_HOURS,
  specialHours: SpecialHour[] = SAMPLE_SPECIAL_HOURS
): ShopOpenStatus {
  const dhaka = getDhakaTimeParts(currentDate);

  // Check special day override for today
  const todaySpecial = specialHours.find((s) => s.date === dhaka.dateString);
  if (todaySpecial && todaySpecial.isClosed) {
    return {
      isOpen: false,
      isClosingSoon: false,
      status: 'closed',
      labelEn: 'Closed Today',
      labelBn: 'আজ বন্ধ',
      todayHoursEn: 'Closed today',
      todayHoursBn: 'আজ বন্ধ',
      noteEn: todaySpecial.noteEn,
      noteBn: todaySpecial.noteBn,
    };
  }

  // Find yesterday's rule to see if we are currently in yesterday's past-midnight window!
  const yesterdayWeekday = (dhaka.weekday + 6) % 7;
  const yesterdaySchedule = weeklyHours.find((h) => h.weekday === yesterdayWeekday);

  if (yesterdaySchedule && !yesterdaySchedule.isClosed) {
    const yOpen = parseTimeToMinutes(yesterdaySchedule.open);
    const yClose = parseTimeToMinutes(yesterdaySchedule.close);

    // If yesterday closed after midnight (e.g. yClose <= yOpen or close is e.g. 01:00)
    if (yClose <= yOpen && dhaka.totalMinutes < yClose) {
      const minutesLeft = yClose - dhaka.totalMinutes;
      const isClosingSoon = minutesLeft <= 30;
      const closeLabelEn = format12Hour(yesterdaySchedule.close, 'en');
      const closeLabelBn = format12Hour(yesterdaySchedule.close, 'bn');

      return {
        isOpen: true,
        isClosingSoon,
        status: isClosingSoon ? 'closing_soon' : 'open',
        labelEn: isClosingSoon ? `Closing soon · till ${closeLabelEn}` : `Open · till ${closeLabelEn}`,
        labelBn: isClosingSoon ? `শীঘ্রই বন্ধ হবে · ${closeLabelBn} পর্যন্ত` : `খোলা আছে · ${closeLabelBn} পর্যন্ত`,
        todayHoursEn: `Open till ${closeLabelEn}`,
        todayHoursBn: `${closeLabelBn} পর্যন্ত খোলা`,
      };
    }
  }

  // Check today's schedule
  const todaySchedule = weeklyHours.find((h) => h.weekday === dhaka.weekday);
  if (!todaySchedule || todaySchedule.isClosed) {
    return {
      isOpen: false,
      isClosingSoon: false,
      status: 'closed',
      labelEn: 'Closed today',
      labelBn: 'আজ বন্ধ',
      todayHoursEn: 'Closed',
      todayHoursBn: 'বন্ধ',
    };
  }

  const openMinutes = parseTimeToMinutes(todaySchedule.open);
  let closeMinutes = parseTimeToMinutes(todaySchedule.close);
  const closesNextDay = closeMinutes <= openMinutes;
  const effectiveCloseMinutes = closesNextDay ? closeMinutes + 1440 : closeMinutes;

  const todayHoursFormattedEn = `${format12Hour(todaySchedule.open, 'en')} – ${format12Hour(todaySchedule.close, 'en')}`;
  const todayHoursFormattedBn = `${format12Hour(todaySchedule.open, 'bn')} – ${format12Hour(todaySchedule.close, 'bn')}`;

  if (dhaka.totalMinutes < openMinutes) {
    const openTimeEn = format12Hour(todaySchedule.open, 'en');
    const openTimeBn = format12Hour(todaySchedule.open, 'bn');
    return {
      isOpen: false,
      isClosingSoon: false,
      status: 'closed',
      labelEn: `Closed · opens ${openTimeEn} today`,
      labelBn: `বন্ধ · আজ ${openTimeBn} এ খুলবে`,
      todayHoursEn: todayHoursFormattedEn,
      todayHoursBn: todayHoursFormattedBn,
    };
  }

  // Within today's open window
  if (dhaka.totalMinutes < effectiveCloseMinutes) {
    const minutesLeft = effectiveCloseMinutes - dhaka.totalMinutes;
    const isClosingSoon = minutesLeft <= 30;
    const closeTimeEn = format12Hour(todaySchedule.close, 'en');
    const closeTimeBn = format12Hour(todaySchedule.close, 'bn');

    return {
      isOpen: true,
      isClosingSoon,
      status: isClosingSoon ? 'closing_soon' : 'open',
      labelEn: isClosingSoon ? `Closing soon · till ${closeTimeEn}` : `Open · till ${closeTimeEn}`,
      labelBn: isClosingSoon ? `শীঘ্রই বন্ধ হবে · ${closeTimeBn} পর্যন্ত` : `খোলা আছে · ${closeTimeBn} পর্যন্ত`,
      todayHoursEn: todayHoursFormattedEn,
      todayHoursBn: todayHoursFormattedBn,
    };
  }

  // Closed for the day
  return {
    isOpen: false,
    isClosingSoon: false,
    status: 'closed',
    labelEn: 'Closed for today',
    labelBn: 'আজকের জন্য বন্ধ',
    todayHoursEn: todayHoursFormattedEn,
    todayHoursBn: todayHoursFormattedBn,
  };
}
