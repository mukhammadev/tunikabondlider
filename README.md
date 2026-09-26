# Tunikabond Lider (`tunikabondlider.uz`) v2.0 🚀

Tunikabond va Alyukabond fasad panellari, zamonaviy karnizlar, profnastil va tom yopish xizmatlarini taqdim etuvchi **Tunikabond Lider** kompaniyasining yangi avlod rasmiy platformasi.

---

## 🌟 Yangi Versiyadagi Asosiy Imkoniyatlar (v2.0)

1. **🧮 Interaktiv Fasad & Tom Kalkulyatori:**
   - Bino turini tanlash (Kottedj, Savdo markazi, Karniz, Naves).
   - Kvadrat metr ($m^2$) slayderi va to'g'ridan-to'g'ri kiritish.
   - Material toifasi (Tunikabond 0.40/0.45mm, Alyukabond 3mm/4mm A2, Profnastil).
   - Montaj xizmatini qo'shish/ayirish.
   - Taxminiy xarajat va ish muddatini real vaqt rejimida hisoblash hamda to'g'ridan-to'g'ri ariza yuborish.

2. **🎨 Ranglar va Teksturalar Palitrasi (Architectural Swatches):**
   - Yog'och teksturalari (Golden Oak, Dark Walnut).
   - Metallik va Almaz ranglar (Antratsit, Shampan, Kumush).
   - Klassik RAL palitrasi (RAL 7016 Grafit, RAL 8017 Shokolad, RAL 9003 Oq).
   - Oyna va maxsus xrom effektlari.
   - Har bir rang uchun qoplama (PVDF), RAL kodi va tavsiya etiladigan qo'llanish sohalari.

3. **📦 Parametrli Mahsulotlar Katalogi:**
   - To'liq texnik parametrlar (qalinlik, og'irlik, PVDF qoplama, olovga chidamlilik, kafolat).
   - Har bir mahsulotda "Batafsil / Buyurtma berish" modali.
   - Test ma'lumotlaridan tozalangan real mahsulotlar.

4. **🏢 Bajarilgan Ishlar (Portfolio):**
   - Kategoriya bo'yicha saralash (Xonadonlar, Tijoriy obyektlar, Karnizlar).
   - Lightbox (kattalashtirib ko'rish).
   - Manzil, sarflangan muddat va material ko'rsatkichlari.

5. **📱 Qulay va Xavfsiz Aloqa:**
   - Telefon raqamlarida to'g'ri ishlaydigan `tel:` protokoli (futerda va menyuda).
   - Telefon raqami formati: `+998 (__) ___-__-__`.
   - Floating tezkor qo'ng'iroq va Telegram tugmalari.
   - Telegram bot tokeni frontendda ochiq qolmaydi — backend API orqali xavfsiz marshrutlanadi.
   - Har bir ariza zaxira sifatida `leads.json` faylida saqlanadi.

6. **⚡ 70% Yengilroq va Super Tezkor:**
   - CSS: 245 KB dan 33 KB ga tushirildi (-86%).
   - JS: 548 KB dan 279 KB ga tushirildi (-50%).
   - Xotira oqishi (scroll memory leak) bartaraf etildi.
   - Vektorli haqiqiy SVG piktogrammalar (900 KB raster SVG o'rniga).

7. **🌐 3 Tilda Mukammal Interfeys:**
   - O'zbekcha (`uz`), Ruscha (`ru`), Inglizcha (`en`).

---

## 💻 Loyihani Ishga Tushirish

### 1. Frontendni ishga tushirish (Development):
```bash
# Paketlarni o'rnatish
npm install

# Dev serverni yoqish
npm run dev
```

### 2. Ishlab chiqarish (Production Build):
```bash
npm run build
```
Natijada tayyor optimallashtirilgan fayllar `dist/` papkasida hosil bo'ladi.

### 3. Backend / API Serverni ishga tushirish:
```bash
# Python serverni yoqish (Flask / API + SPA)
python3 main.py
```
Server standart holatda `http://localhost:5001` da ishga tushadi.

---

## 🔒 Xavfsizlik va Atrof-muhit O'zgaruvchilari (`.env`)

Telegram bot integratsiyasi uchun:
```env
TELEGRAM_BOT_TOKEN="8160493029:AAHA2wWKlaSR__UTzByJtLt24rWXtsxV3c4"
TELEGRAM_CHAT_ID="-1003209002534"
PORT=5001
```

---

## 📁 Loyiha Tuzilmasi

```text
├── public/                 # Statik fayllar (favicon, robots.txt, sitemap.xml)
├── src/
│   ├── components/         # UI komponentlari
│   │   ├── Navbar.jsx      # Boshqaruv paneli va navigatsiya
│   │   ├── Hero.jsx        # Asosiy ekranning sotuvchi qismi
│   │   ├── Calculator.jsx  # Narx va material hisoblagich
│   │   ├── Products.jsx    # Mahsulotlar ro'yxati
│   │   ├── ProductModal.jsx# Mahsulot tafsilotlari va buyurtma
│   │   ├── ColorSwatches.jsx# Ranglar va teksturalar palitrasi
│   │   ├── Portfolio.jsx   # Bajarilgan ishlar galereyasi
│   │   ├── WhyUs.jsx       # 6 ta asosiy afzallik
│   │   ├── Process.jsx     # 4 bosqichli ish tartibi
│   │   ├── FAQ.jsx         # Ko'p beriladigan savollar
│   │   ├── ContactSection.jsx # Aloqa bo'limi va xarita
│   │   ├── LeadModal.jsx   # Bepul o'lchov va buyurtma modali
│   │   ├── QuickActions.jsx# Suzuvchi tezkor qo'ng'iroq/telegram
│   │   └── Footer.jsx      # Futer va ijtimoiy tarmoqlar
│   ├── data/               # Ma'lumotlar va tarjimalar
│   │   ├── translations.js # O'zbek, Rus, Ingliz tillari
│   │   ├── products.js     # Mahsulotlar bazasi
│   │   ├── swatches.js     # Ranglar palitrasi
│   │   ├── portfolio.js    # Bajarilgan obyektlar
│   │   └── faq.js          # Savol-javoblar
│   ├── services/           # Xizmatlar (Telegram bot, zaxiralash)
│   ├── App.jsx             # Asosiy ilova
│   ├── index.css           # Tailwind va maxsus stillar
│   └── main.jsx            # React kirish nuqtasi
├── main.py                 # Backend API va zaxira server
├── package.json
└── README.md
```
