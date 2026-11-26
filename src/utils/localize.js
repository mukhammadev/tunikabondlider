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
      .replace(/\bToshkent,/gi, 'Ташкент,')
      .replace(/\bMirobod tumani\b/gi, 'Мирабадский р-н')
      .replace(/Yangiyo'?l/gi, 'Янгиюль')
      .replace(/\bQibray\b/gi, 'Кибрай')
      .replace(/\bYunusobod\b/gi, 'Юнусабад')
      .replace(/Mirzo Ulug'?bek/gi, 'Мирзо-Улугбек')
      .replace(/\bChilonzor\b/gi, 'Чиланзар')
      .replace(/\bSergeli\b|\bSergili\b/gi, 'Сергели')
      .replace(/\bYakkasaroy\b/gi, 'Яккасарай')
      .replace(/\bOlmazor\b/gi, 'Алмазар')
      .replace(/\bShayxontohur\b/gi, 'Шайхантахур')
      .replace(/\bTemir Karkas\b/gi, 'Металлокаркас')
      .replace(/Spot yoritgichlar/gi, 'Точечная подсветка')
      .replace(/LED chiziqlar/gi, 'LED-подсветка')
      .replace(/Olovga chidamli/gi, 'Огнестойкий')
      .replace(/Oltin Eman/gi, 'Золотой Дуб')
      .replace(/Mat-Antratsit/gi, 'Матовый Антрацит')
      .replace(/\bGrafit\b/gi, 'Графит')
      .replace(/\bTunikabond Premium\b/gi, 'Туникабонд Премиум')
      .replace(/\bTunikabond\b/gi, 'Туникабонд')
      .replace(/\bAlyukabond\b/gi, 'Алюкобонд')
      .replace(/PVDF polimer/gi, 'ПВДФ полимер')
      .replace(/Fluoropolimer PVDF/gi, 'Фторполимер ПВДФ')
      .replace(/3-qavatli polimer/gi, '3-слойный полимер')
      .replace(/Polimer qoplama/gi, 'Полимерное покрытие')
      .replace(/Mat Poliester/gi, 'Матовый полиэстер')
      .replace(/Poliester/gi, 'Полиэстер')
      .replace(/Sink \+ Polimer/gi, 'Цинк + Полимер')
      .replace(/alyumin/gi, 'алюминий')
      .replace(/(\d+(?:[.,]\d+)?)\s*mm\b/gi, '$1 мм')
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
      .replace(/\bToshkent,/gi, 'Tashkent,')
      .replace(/\bMirobod tumani\b/gi, 'Mirobod district')
      .replace(/Yangiyo'?l/gi, 'Yangiyul')
      .replace(/\bQibray\b/gi, 'Kibray')
      .replace(/\bYunusobod\b/gi, 'Yunusabad')
      .replace(/\bChilonzor\b/gi, 'Chilanzar')
      .replace(/\bSergili\b/gi, 'Sergeli')
      .replace(/\bTemir Karkas\b/gi, 'Steel Frame')
      .replace(/Spot yoritgichlar/gi, 'Spot lighting')
      .replace(/LED chiziqlar/gi, 'LED lighting')
      .replace(/Olovga chidamli/gi, 'Fire-Retardant')
      .replace(/Oltin Eman/gi, 'Golden Oak')
      .replace(/Mat-Antratsit/gi, 'Matte Anthracite')
      .replace(/\bGrafit\b/gi, 'Graphite')
      .replace(/\bAlyukabond\b/gi, 'Alucobond')
      .replace(/PVDF polimer/gi, 'PVDF polymer')
      .replace(/Fluoropolimer PVDF/gi, 'Fluoropolymer PVDF')
      .replace(/3-qavatli polimer/gi, '3-layer polymer')
      .replace(/Polimer qoplama/gi, 'Polymer coating')
      .replace(/Mat Poliester/gi, 'Matte Polyester')
      .replace(/Poliester/gi, 'Polyester')
      .replace(/Sink \+ Polimer/gi, 'Zinc + Polymer')
      .replace(/alyumin/gi, 'aluminum')
      .replace(/(\d+(?:[.,]\d+)?)\s*mm\b/gi, '$1 mm')
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

const RU_NAME_MAP = {
  'Muhammadaziz Mirzayev': 'Мухаммадазиз Мирзаев',
  'Rustam Karimov': 'Рустам Каримов',
  'Dilshod Usta': 'Мастер Дилшод',
  'Sanjar Usta': 'Мастер Санжар',
  'Bobur Usta': 'Мастер Бобур',
  'Akmal Usta': 'Мастер Акмал',
  'Ibragimov': 'Ибрагимов',
};

export const localizePersonName = (name, currentLang = 'uz') => {
  if (!name) return '';
  const raw = String(name).trim();
  if (currentLang === 'ru') {
    if (RU_NAME_MAP[raw]) return RU_NAME_MAP[raw];
    return raw.replace(/\bUsta\b/gi, 'Мастер');
  }
  if (currentLang === 'en') {
    return raw.replace(/\bUsta\b/gi, 'Master');
  }
  return raw;
};

export const formatWorksCount = (count, currentLang = 'uz') => {
  const n = Number(count) || 0;
  if (currentLang === 'ru') {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return `${n} работа в каталоге`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} работы в каталоге`;
    return `${n} работ в каталоге`;
  }
  if (currentLang === 'en') {
    return n === 1 ? '1 catalog work' : `${n} catalog works`;
  }
  return `${n} ta katalog ishi`;
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
