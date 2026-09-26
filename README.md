# Tunikabond Lider (`tunikabondlider.uz`)

Tunikabond va Alyukabond fasad panellari, zamonaviy karnizlar, profnastil va tom yopish xizmatlarini taqdim etuvchi **Tunikabond Lider** rasmiy platformasi uchun loyiha ombori (repository).

---

## 📋 Sayt va Tizim Tahlili (Texnik Audit)

Sayt holati (`https://tunikabondlider.uz/`) to'liq o'rganildi va quyidagi muhim jihatlar aniqlandi:

### 1. Texnologik Stek
- **Frontend:** React 18, Vite, React Router DOM, Bootstrap 5 / React-Bootstrap, Swiper, Axios, i18next (uz, ru).
- **Backend API:** Django / Django REST Framework (`https://api.tunikabondlider.uz/api/`), drf-yasg.
- **Web Server:** Nginx 1.18.0 (Ubuntu) — IP: `38.242.229.191` (Germaniya / Contabo).
- **Aloqa integratsiyasi:** Telegram Bot API.

---

### 🚨 Aniqlangan Xatoliklar va Muammolar

#### 1. Xavfsizlik (Security)
- [ ] **Telegram Bot Token ochiq kodda:** Bot tokeni va guruh chat_id si brauzer JS bundle faylida ochiq qolgan (`$w = 8160493029...`). Bu botni buzib kirishga imkon beradi. Buni Django backend orqali yuborish kerak.
- [ ] **Django `DEBUG = True` holatida:** `https://api.tunikabondlider.uz/` da mavjud bo'lmagan yo'l ochilsa Django debug traceback sahifasi barcha ichki sozlamalari bilan ko'rinmoqda.
- [ ] **`www` domenidagi SSL va Apache xatosi:** `http://www.tunikabondlider.uz` da Apache boshlang'ich sahifasi, `https` da esa SSL sertifikat xatosi chiqmoqda. Nginx orqali `www` dan `non-www` ga 301 redirect qilinishi shart.

#### 2. Ishlash tezligi (Performance)
- [ ] **Rasmlar hajmi (11+ MB):** Sahifadagi ayrim portfolio rasmlari 4.15 MB, 2.25 MB gacha yetadi. Barcha rasmlarni WebP/AVIF ga o'tkazish zarur.
- [ ] **Soxta SVG piktogrammalar:** Instagram (898 KB) va Logo (738 KB) SVG tegi ichiga base64 raster rasm solingan. Ularni toza vektor (5-10 KB) formatiga almashtirish kerak.
- [ ] **Gzip / Brotli siqish o'chirilgan:** Nginx sozlamalarida `gzip on;` qilinmagan. JS (548 KB) va CSS (245 KB) siqilmasdan to'liq uzatilmoqda.

#### 3. Funksional va UX Kamchiliklar
- [ ] **Futerda telefon havolalari:** `href="+99899..."` shaklida yozilgan (`tel:` prefiksi yo'q), bosilganda qo'ng'iroq bo'lmaydi, 404 sahifaga o'tib ketadi.
- [ ] **Navbar scroll xotira oqishi (Memory leak):** Navbar komponentida `window.addEventListener('scroll', ...)` har renderda qayta qo'shilib, xotirani to'ldirib yubormoqda (`useEffect` tozalash zarur).
- [ ] **Mahsulot sahifasi (`/product/:id`):** Buyurtma berish (CTA) tugmasi yo'q, xususiyatlar va qaytish tugmasi yo'q.
- [ ] **Google Xarita:** Har bir sahifa tubida (Mahsulotlar, Biz haqimizda, Bosh sahifa) majburiy chiqib turibdi. Faqat "Aloqa" sahifasida bo'lishi kerak.
- [ ] **Test ma'lumotlar:** Bazada "Fake Uz", "Qalesz degan naves" kabi test yozuvlar qolib ketgan.

---

## 🚀 Rejalashtirilgan Bosqichlar (Roadmap)

1. **1-bosqich:** Telegram arizalarini xavfsiz backend API orqali qabul qilish (Rate limiting, ma'lumotlar bazasida saqlash).
2. **2-bosqich:** Nginx va Server sozlamalari (`www` redirect, SSL, `DEBUG = False`, Gzip siqish).
3. **3-bosqich:** Frontend kodini optimallashtirish (Rasmlarni WebP qilish, SVG'larni tozalash, xotira oqishini bartaraf qilish).
4. **4-bosqich:** Savdo konversiyasini oshirish (Mahsulot sahifasida buyurtma berish tugmasi, xususiyatlar, SEO meta teglari, robots.txt, sitemap.xml).
