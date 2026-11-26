/**
 * Shared multilingual helpers for dynamic catalog metadata, numbers, and dates (uz / ru / en).
 */

export const parseMaybeJson = (val) => {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return val;
    }
  }
  return val;
};

export const getLocalizedField = (field, currentLang = 'uz', fallback = '') => {
  if (field === null || field === undefined || field === '') return fallback;
  const parsed = parseMaybeJson(field);
  if (typeof parsed === 'object' && parsed !== null) {
    return parsed[currentLang] || parsed.uz || parsed.ru || parsed.en || Object.values(parsed)[0] || fallback;
  }
  return String(parsed);
};

export const localizeSpecText = (val, currentLang = 'uz') => {
  if (!val) return '';
  let s = String(val);
  if (currentLang === 'ru') {
    s = s
      .replace(/so'm \/ m²/gi, 'сум / м²')
      .replace(/so'm \/ metr/gi, 'сум / пог. м')
      .replace(/so'm/gi, 'сум')
      .replace(/ish kuni/gi, 'раб. дней')
      .replace(/\byil tajriba\b/gi, 'лет опыта')
      .replace(/\byil\b/gi, 'лет')
      .replace(/\bobyekt\b/gi, 'объектов')
      .replace(/Toshkent shahri/gi, 'г. Ташкент')
      .replace(/Toshkent sh\.,/gi, 'г. Ташкент,')
      .replace(/Toshkent viloyati,/gi, 'Ташкентская обл.,')
      .replace(/3-qavatli polimer/gi, '3-слойный полимер')
      .replace(/Polimer qoplama/gi, 'Полимерное покрытие')
      .replace(/Mat Poliester/gi, 'Матовый полиэстер')
      .replace(/Poliester/gi, 'Полиэстер')
      .replace(/Sink \+ Polimer/gi, 'Цинк + Полимер')
      .replace(/alyumin/gi, 'алюминий')
      .replace(/\bmetr\b/gi, 'м')
      .replace(/m²/g, 'м²')
      .replace(/^Yangi$/i, 'Новинка')
      .replace(/^Ommabop$/i, 'Популярное')
      .replace(/^Mustahkam$/i, 'Надежное')
      .replace(/^Dizayn Yechim$/i, 'Дизайн-решение')
      .replace(/^Premium Standart$/i, 'Премиум Стандарт')
      .replace(/^Trend 2026$/i, 'Тренд 2026')
      .replace(/^Bestseller$/i, 'Хит продаж');
  } else if (currentLang === 'en') {
    s = s
      .replace(/so'm \/ m²/gi, 'UZS / sq.m')
      .replace(/so'm \/ metr/gi, 'UZS / m')
      .replace(/so'm/gi, 'UZS')
      .replace(/ish kuni/gi, 'work days')
      .replace(/\byil tajriba\b/gi, 'years experience')
      .replace(/\byil\b/gi, 'years')
      .replace(/\bobyekt\b/gi, 'projects')
      .replace(/Toshkent shahri/gi, 'Tashkent city')
      .replace(/Toshkent sh\.,/gi, 'Tashkent,')
      .replace(/Toshkent viloyati,/gi, 'Tashkent reg.,')
      .replace(/3-qavatli polimer/gi, '3-layer polymer')
      .replace(/Polimer qoplama/gi, 'Polymer coating')
      .replace(/Mat Poliester/gi, 'Matte Polyester')
      .replace(/Poliester/gi, 'Polyester')
      .replace(/Sink \+ Polimer/gi, 'Zinc + Polymer')
      .replace(/alyumin/gi, 'aluminum')
      .replace(/\bmetr\b/gi, 'm')
      .replace(/m²/g, 'sq.m')
      .replace(/^Yangi$/i, 'New')
      .replace(/^Ommabop$/i, 'Popular')
      .replace(/^Mustahkam$/i, 'Heavy-Duty')
      .replace(/^Dizayn Yechim$/i, 'Design Pick')
      .replace(/^Premium Standart$/i, 'Premium Standard');
  }
  return s;
};

const MONTHS = {
  uz: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
  ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};

export const formatReviewMonthYear = (dateInput = new Date(), currentLang = 'uz') => {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput || '');
  const year = d.getFullYear();
  const monthIdx = d.getMonth();
  const langMonths = MONTHS[currentLang] || MONTHS.uz;
  const monthName = langMonths[monthIdx] || '';
  if (currentLang === 'ru') return `${monthName} ${year} г.`;
  if (currentLang === 'en') return `${monthName} ${year}`;
  return `${year}-yil, ${monthName}`;
};

export const normalizePhoneForSubmit = (rawPhone) => {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (digits.length === 9) {
    return `+998${digits}`;
  }
  if (digits.length >= 12 && digits.startsWith('998')) {
    return `+${digits.slice(0, 12)}`;
  }
  return String(rawPhone || '').trim();
};
