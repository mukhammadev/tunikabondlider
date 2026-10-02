import os
import json
import logging
import hashlib
import html
import secrets
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
import requests

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("TunikabondLider")

app = Flask(__name__, static_folder="dist")

DATA_DIR = os.path.join(os.path.dirname(__file__), "server_data")
os.makedirs(DATA_DIR, exist_ok=True)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "public", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
DIST_UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "dist", "uploads")
os.makedirs(DIST_UPLOAD_FOLDER, exist_ok=True)

ADMINS_FILE = os.path.join(DATA_DIR, "admins.json")
LEADS_FILE = os.path.join(DATA_DIR, "leads.json")
PRODUCTS_FILE = os.path.join(DATA_DIR, "products.json")
PORTFOLIO_FILE = os.path.join(DATA_DIR, "portfolio.json")
TEAM_FILE = os.path.join(DATA_DIR, "team.json")
CALC_FILE = os.path.join(DATA_DIR, "calculator.json")
SWATCHES_FILE = os.path.join(DATA_DIR, "swatches.json")

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8160493029:AAHA2wWKlaSR__UTzByJtLt24rWXtsxV3c4")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "-1003209002534,1003939636")

ACTIVE_TOKENS = {}  # token -> admin_info


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


# Helper JSON loaders & savers
def load_json(filepath, default_data=None):
    if not os.path.exists(filepath):
        if default_data is not None:
            save_json(filepath, default_data)
            return default_data
        return []
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading {filepath}: {e}")
        return default_data if default_data is not None else []


def save_json(filepath, data):
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving {filepath}: {e}")
        return False


# Initialize default admin if not exists
def init_default_admins():
    admins = load_json(ADMINS_FILE, None)
    if not admins:
        initial_admins = [
            {
                "id": "admin-1",
                "username": "Muhammadazez",
                "fullName": "Muhammad Aziz",
                "role": "Super Admin",
                "password_hash": hash_password("admin123"),
                "createdAt": datetime.now().isoformat()
            },
            {
                "id": "admin-2",
                "username": "admin",
                "fullName": "Bosh Administrator",
                "role": "Super Admin",
                "password_hash": hash_password("admin123"),
                "createdAt": datetime.now().isoformat()
            }
        ]
        save_json(ADMINS_FILE, initial_admins)
        logger.info("Initialized default admins: Muhammadazez and admin")


# Initialize default products
def init_default_products():
    if not os.path.exists(PRODUCTS_FILE):
        default_prods = [
            {
                "id": "tb-045-wood",
                "category": "tunikabond",
                "name": {
                    "uz": "Tunikabond Premium Yog'och Teksturali (0.45 mm)",
                    "ru": "Туникабонд Премиум Текстура Дерева (0.45 мм)",
                    "en": "Tunikabond Premium Wood Grain (0.45 mm)"
                },
                "shortDesc": {
                    "uz": "Tabiiy eman va yong'oq yog'ochi ko'rinishidagi super chidamli fasad paneli. Quyosh va namlikdan aslo qo'rqmaydi.",
                    "ru": "Высокопрочная фасадная панель с реалистичной текстурой дуба и ореха. Абсолютно не боится ультрафиолета и влаги.",
                    "en": "High-durability facade panel featuring realistic natural oak & walnut grain. 100% resistant to UV and weathering."
                },
                "thickness": "0.45 mm",
                "coating": "PVDF 3-qavatli polimer",
                "warranty": "10 yil",
                "badge": "Bestseller",
                "priceRange": "145,000 - 180,000 so'm / m²",
                "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
            },
            {
                "id": "tb-040-matte",
                "category": "tunikabond",
                "name": {
                    "uz": "Tunikabond Mat Grafit & Qora (0.40 mm)",
                    "ru": "Туникабонд Матовый Графит & Черный (0.40 мм)",
                    "en": "Tunikabond Matte Graphite & Black (0.40 mm)"
                },
                "shortDesc": {
                    "uz": "Zamonaviy Minimalizm va High-Tech uslubidagi binolar uchun zamonaviy mat qoplamali tunikabond.",
                    "ru": "Современный матовый туникабонд для зданий в стиле минимализм и хай-тек.",
                    "en": "Sleek matte finished tunikabond tailored for contemporary minimalist and high-tech architecture."
                },
                "thickness": "0.40 mm",
                "coating": "Mat Poliester / PVDF",
                "warranty": "8 yil",
                "badge": "Trend 2026",
                "priceRange": "125,000 - 155,000 so'm / m²",
                "image": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
            },
            {
                "id": "ab-40-fireproof",
                "category": "alyukabond",
                "name": {
                    "uz": "Alyukabond A2 Olovga Chidamli Kompozit (4 mm)",
                    "ru": "Алюкобонд А2 Огнестойкий Композит (4 мм)",
                    "en": "Alucobond A2 Fire-Retardant Composite (4 mm)"
                },
                "shortDesc": {
                    "uz": "Tijoriy binolar, biznes markazlar va ko'p qavatli obyektlar uchun yong'inga qarshi A2 toifali alyumin kompozit paneli.",
                    "ru": "Алюминиевая композитная панель класса негорючести А2 для коммерческих и высотных зданий.",
                    "en": "Class A2 non-combustible aluminum composite panel engineered for commercial towers and public complexes."
                },
                "thickness": "4.0 mm (0.40 mm alyumin)",
                "coating": "Flüoropolimer PVDF",
                "warranty": "15 yil",
                "badge": "Premium Standart",
                "priceRange": "220,000 - 290,000 so'm / m²",
                "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
            },
            {
                "id": "ab-30-classic",
                "category": "alyukabond",
                "name": {
                    "uz": "Alyukabond Klassik Fasad Paneli (3 mm)",
                    "ru": "Алюкобонд Классический Фасадный (3 мм)",
                    "en": "Alucobond Classic Architectural (3 mm)"
                },
                "shortDesc": {
                    "uz": "Do'konlar, dorixonalar, avtosalonlar va ofislar uchun eng optimal, engil va elastik fasad yechimi.",
                    "ru": "Оптимальное, легкое и надежное решение для магазинов, аптек, автосалонов и офисов.",
                    "en": "The industry-standard lightweight composite panel for commercial storefronts, clinics, and showrooms."
                },
                "thickness": "3.0 mm (0.21 mm alyumin)",
                "coating": "Poliester / PVDF",
                "warranty": "10 yil",
                "badge": "Ommabop",
                "priceRange": "160,000 - 210,000 so'm / m²",
                "image": "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=800&q=80"
            },
            {
                "id": "karniz-neoclassic",
                "category": "cornice",
                "name": {
                    "uz": "Neoklassik va Zamonaviy Fasad Karnizlari",
                    "ru": "Неоклассические и Современные Карнизы",
                    "en": "Neoclassic & Modern Architectural Cornices"
                },
                "shortDesc": {
                    "uz": "Tom va devor tutashuvini bezovchi, yomg'ir suvini bino fasadiga oqishidan himoyalovchi bejirim karnizlar.",
                    "ru": "Элегантные карнизы, защищающие фасад от подтеков дождевой воды и придающие законченный премиальный вид.",
                    "en": "Precision-engineered cornices protecting the facade from rainwater runoff while providing stately curb appeal."
                },
                "thickness": "0.45 - 0.50 mm",
                "coating": "Polimer qoplama",
                "warranty": "10 yil",
                "badge": "Dizayn Yechim",
                "priceRange": "80,000 - 130,000 so'm / metr",
                "image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
            },
            {
                "id": "roof-profnastil",
                "category": "roofing",
                "name": {
                    "uz": "Profnastil PK-20 / PK-35 va Tom Yopish Tizimi",
                    "ru": "Профнастил ПК-20 / ПК-35 и Кровельные Системы",
                    "en": "Corrugated Roofing Sheets PK-20 / PK-35"
                },
                "shortDesc": {
                    "uz": "Yuqori qovurg'ali, qor va shamol bosimiga bardosh beruvchi uzoq muddatli tom yopish profnastili.",
                    "ru": "Надежный профнастил с высоким ребром жесткости, устойчивый к снеговым и ветровым нагрузкам.",
                    "en": "Heavy-duty profiled roofing sheets designed for maximum snow and wind load bearing capabilities."
                },
                "thickness": "0.45 - 0.70 mm",
                "coating": "Sink + Polimer (RAL)",
                "warranty": "15 yil",
                "badge": "Mustahkam",
                "priceRange": "65,000 - 95,000 so'm / m²",
                "image": "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=80"
            }
        ]
        save_json(PRODUCTS_FILE, default_prods)


# Initialize default portfolio
def init_default_portfolio():
    if not os.path.exists(PORTFOLIO_FILE):
        default_port = [
            {
                "id": "port-1",
                "category": "residential",
                "title": {
                    "uz": "Toshkent shahridagi 3 qavatli zamonaviy kottedj fasadi",
                    "ru": "Фасад 3-этажного современного коттеджа в г. Ташкент",
                    "en": "3-Storey Contemporary Villa Facade in Tashkent"
                },
                "location": "Toshkent, Mirzo Ulug'bek",
                "material": "Tunikabond Oltin Eman (0.45mm) + Grafit 7016",
                "area": "340 m²",
                "time": "14 ish kuni",
                "image": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80"
            },
            {
                "id": "port-2",
                "category": "commercial",
                "title": {
                    "uz": "Biznes markaz va savdo majmuasi tashqi fasadi",
                    "ru": "Вентилируемый фасад торгового и бизнес-центра",
                    "en": "Commercial & Business Center Ventilated Facade"
                },
                "location": "Toshkent, Chilonzor",
                "material": "Alyukabond A2 Olovga chidamli (4mm)",
                "area": "820 m²",
                "time": "24 ish kuni",
                "image": "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80"
            },
            {
                "id": "port-3",
                "category": "cornices",
                "title": {
                    "uz": "Zamonaviy neoklassik karniz va terassa shift dizayni",
                    "ru": "Неоклассический карниз и подшивка потолка террасы",
                    "en": "Neoclassic Cornice & Terrace Ceiling Soffits"
                },
                "location": "Toshkent viloyati, Qibray",
                "material": "Tunikabond Dark Walnut + LED chiziqlar",
                "area": "120 metr",
                "time": "6 ish kuni",
                "image": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80"
            }
        ]
        save_json(PORTFOLIO_FILE, default_port)


def init_default_swatches():
    if not os.path.exists(SWATCHES_FILE):
        default_swatches = [
            {
                "id": "wood-oak",
                "category": "wood",
                "name": {
                    "uz": "Oltin Eman (Golden Oak)",
                    "ru": "Золотой Дуб (Golden Oak)",
                    "en": "Golden Oak Wood"
                },
                "code": "WOOD-801",
                "colorHex": "#A05A2C",
                "bgGradient": "linear-gradient(135deg, #b06a3b 0%, #7d3f18 100%)",
                "texture": "Yog'och teksturasi (Bo'rtma)",
                "finish": "Mat / Strukturaviy",
                "coating": "PVDF 3-qavat",
                "application": "Hovli uylari, karnizlar, darvoza atrofi, terassa shiftlari"
            },
            {
                "id": "wood-walnut",
                "category": "wood",
                "name": {
                    "uz": "To'q Yong'oq (Dark Walnut)",
                    "ru": "Темный Орех (Dark Walnut)",
                    "en": "Dark Walnut Wood"
                },
                "code": "WOOD-804",
                "colorHex": "#4A2E18",
                "bgGradient": "linear-gradient(135deg, #59381e 0%, #301a0a 100%)",
                "texture": "Chuqur yog'och tomirlari",
                "finish": "Mat / Tabiiy tekstura",
                "coating": "PVDF 3-qavat",
                "application": "Kottedj fasadlari, premium qoplama"
            },
            {
                "id": "met-anthracite",
                "category": "metallic",
                "name": {
                    "uz": "Antratsit Metallik (Sparkle)",
                    "ru": "Антрацит Металлик (Sparkle)",
                    "en": "Sparkling Anthracite Metallic"
                },
                "code": "MET-7021",
                "colorHex": "#2F353B",
                "bgGradient": "linear-gradient(135deg, #3d454d 0%, #1e2226 100%)",
                "texture": "Yengil metallik yaltiroqligi",
                "finish": "Yarim mat / Yaltiroq",
                "coating": "PVDF Metallik",
                "application": "High-Tech uylar, biznes markazlar"
            },
            {
                "id": "met-champagne",
                "category": "metallic",
                "name": {
                    "uz": "Shampan Oltini (Champagne Gold)",
                    "ru": "Шампань Золото (Champagne Gold)",
                    "en": "Champagne Metallic Gold"
                },
                "code": "MET-1035",
                "colorHex": "#C5A059",
                "bgGradient": "linear-gradient(135deg, #dfbe7b 0%, #a48039 100%)",
                "texture": "Oltinsimon nozik porlash",
                "finish": "Metallik yaltiroq",
                "coating": "PVDF Premium",
                "application": "Savdo binosi ustunlari, bezaklar"
            },
            {
                "id": "met-silver",
                "category": "metallic",
                "name": {
                    "uz": "Kumush Rang Metallik (Silver Metallic)",
                    "ru": "Серебристый Металлик (Silver)",
                    "en": "Architectural Silver Metallic"
                },
                "code": "RAL 9006",
                "colorHex": "#A5A9B4",
                "bgGradient": "linear-gradient(135deg, #c4c8d4 0%, #7e838f 100%)",
                "texture": "Klassik metallik",
                "finish": "Yarim yaltiroq",
                "coating": "PVDF / Poliester",
                "application": "Barcha turdagi tijoriy fasadlar"
            },
            {
                "id": "ral-graphite",
                "category": "ral",
                "name": {
                    "uz": "To'q Grafit (Graphite Gray)",
                    "ru": "Темный Графит (Graphite Gray)",
                    "en": "Graphite Gray"
                },
                "code": "RAL 7016",
                "colorHex": "#373F43",
                "bgGradient": "linear-gradient(135deg, #444d52 0%, #262c2f 100%)",
                "texture": "Silliq / Mat",
                "finish": "Super mat",
                "coating": "Poliester",
                "application": "Zamonaviy tomlar, karnizlar, fasadlar"
            },
            {
                "id": "ral-chocolate",
                "category": "ral",
                "name": {
                    "uz": "Shokolad Jigarrang (Chocolate Brown)",
                    "ru": "Шоколадный Коричневый (Chocolate)",
                    "en": "Chocolate Brown"
                },
                "code": "RAL 8017",
                "colorHex": "#45322E",
                "bgGradient": "linear-gradient(135deg, #57403b 0%, #2e1f1c 100%)",
                "texture": "Klassik jigarrang",
                "finish": "Yarim mat / Yaltiroq",
                "coating": "Poliester",
                "application": "Tom qoplamalari, karnizlar, darvozalar"
            },
            {
                "id": "ral-white",
                "category": "ral",
                "name": {
                    "uz": "Sof Oq (Signal White)",
                    "ru": "Сигнальный Белый (Signal White)",
                    "en": "Signal White"
                },
                "code": "RAL 9003",
                "colorHex": "#F4F4F4",
                "bgGradient": "linear-gradient(135deg, #ffffff 0%, #d8d8d8 100%)",
                "texture": "Silliq oyna effekti",
                "finish": "Yaltiroq / Mat",
                "coating": "Poliester / PVDF",
                "application": "Shiftlar, interyer, dorixonalar va klinikalar"
            },
            {
                "id": "special-mirror",
                "category": "special",
                "name": {
                    "uz": "Oyna Effekti (Mirror Silver)",
                    "ru": "Зеркальный Хром (Mirror Silver)",
                    "en": "Architectural Mirror Silver"
                },
                "code": "SPEC-MR01",
                "colorHex": "#E5E7EB",
                "bgGradient": "linear-gradient(135deg, #ffffff 0%, #9ca3af 50%, #ffffff 100%)",
                "texture": "100% Oyna yuzasi",
                "finish": "Super Yaltiroq Xrom",
                "coating": "Anodlangan qatlam",
                "application": "Fasad dekorlari, ichki dizayn, brend ustunlari"
            }
        ]
        save_json(SWATCHES_FILE, default_swatches)
        logger.info("Initialized default swatches (9 items)")


init_default_admins()
init_default_products()
init_default_portfolio()
init_default_swatches()


# CORS handler for cross-origin local requests
@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS,PATCH")
    return response


# --- AUTHENTICATION ENDPOINTS ---

@app.route("/api/auth/login", methods=["POST", "OPTIONS"])
def auth_login():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = request.get_json() or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Foydalanuvchi nomi va parol kiritilishi shart"}), 400

    admins = load_json(ADMINS_FILE, [])
    pwd_hash = hash_password(password)

    matched = None
    for a in admins:
        if a["username"].lower() == username.lower() and a["password_hash"] == pwd_hash:
            matched = a
            break

    if not matched:
        return jsonify({"error": "Foydalanuvchi nomi yoki parol noto'g'ri"}), 401

    token = secrets.token_hex(24)
    admin_info = {
        "id": matched["id"],
        "username": matched["username"],
        "fullName": matched["fullName"],
        "role": matched.get("role", "Admin"),
    }
    ACTIVE_TOKENS[token] = admin_info

    return jsonify({
        "success": True,
        "token": token,
        "user": admin_info
    }), 200


@app.route("/api/auth/register", methods=["POST", "OPTIONS"])
def auth_register():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = request.get_json() or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")
    full_name = data.get("fullName", "").strip() or username
    role = data.get("role", "Admin")

    if not username or not password:
        return jsonify({"error": "Foydalanuvchi nomi va parol kiritilishi shart"}), 400

    if len(password) < 6:
        return jsonify({"error": "Parol kamida 6 ta belgidan iborat bo'lishi kerak"}), 400

    admins = load_json(ADMINS_FILE, [])
    for a in admins:
        if a["username"].lower() == username.lower():
            return jsonify({"error": "Ushbu foydalanuvchi nomi allaqachon band"}), 409

    new_admin = {
        "id": f"admin-{len(admins) + 1}-{secrets.token_hex(3)}",
        "username": username,
        "fullName": full_name,
        "role": role,
        "password_hash": hash_password(password),
        "createdAt": datetime.now().isoformat()
    }
    admins.append(new_admin)
    save_json(ADMINS_FILE, admins)

    token = secrets.token_hex(24)
    admin_info = {
        "id": new_admin["id"],
        "username": new_admin["username"],
        "fullName": new_admin["fullName"],
        "role": new_admin["role"]
    }
    ACTIVE_TOKENS[token] = admin_info

    logger.info(f"New admin registered: {username}")
    return jsonify({
        "success": True,
        "token": token,
        "user": admin_info,
        "message": "Admin muvaffaqiyatli ro'yxatdan o'tdi"
    }), 201


@app.route("/api/auth/me", methods=["GET"])
def auth_me():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user = ACTIVE_TOKENS.get(token)
    if not user:
        # Fallback check from query
        token_q = request.args.get("token")
        user = ACTIVE_TOKENS.get(token_q)

    if not user:
        return jsonify({"authenticated": False}), 401

    return jsonify({"authenticated": True, "user": user}), 200


@app.route("/api/auth/admins", methods=["GET"])
def get_admins():
    admins = load_json(ADMINS_FILE, [])
    # Return without password hashes
    safe_admins = [
        {
            "id": a["id"],
            "username": a["username"],
            "fullName": a.get("fullName", a["username"]),
            "role": a.get("role", "Admin"),
            "createdAt": a.get("createdAt", "")
        }
        for a in admins
    ]
    return jsonify(safe_admins), 200


# --- LEADS ENDPOINTS ---

@app.route("/api/leads/", methods=["GET", "POST", "OPTIONS"])
def handle_leads():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    if request.method == "GET":
        leads = load_json(LEADS_FILE, [])
        return jsonify(leads), 200

    # POST new lead
    data = request.get_json() or {}
    phone = data.get("phone", "")

    if not phone or len(phone.strip()) < 9:
        return jsonify({"error": "Telefon raqami kiritilishi shart"}), 400

    leads = load_json(LEADS_FILE, [])
    raw_status = data.get("status")
    valid_status = raw_status if raw_status in ["new", "in_progress", "completed", "cancelled"] else "new"

    lead_record = {
        "id": f"lead-{len(leads) + 1}",
        "timestamp": datetime.now().isoformat(),
        **data,
        "status": valid_status,
    }
    leads.insert(0, lead_record)
    save_json(LEADS_FILE, leads)

    # Send telegram notification
    send_telegram_notification(data)

    return jsonify({
        "success": True,
        "message": "Ariza muvaffaqiyatli qabul qilindi",
        "lead": lead_record
    }), 201


@app.route("/api/leads/<lead_id>", methods=["PATCH", "DELETE", "OPTIONS"])
def modify_lead(lead_id):
    if request.method == "OPTIONS":
        return jsonify({}), 200

    leads = load_json(LEADS_FILE, [])

    if request.method == "DELETE":
        new_leads = [l for l in leads if str(l.get("id")) != str(lead_id)]
        save_json(LEADS_FILE, new_leads)
        return jsonify({"success": True, "message": "Ariza o'chirildi"}), 200

    if request.method == "PATCH":
        patch_data = request.get_json() or {}
        found = False
        for l in leads:
            if str(l.get("id")) == str(lead_id):
                l.update(patch_data)
                found = True
                break

        if not found:
            return jsonify({"error": "Ariza topilmadi"}), 404

        save_json(LEADS_FILE, leads)
        return jsonify({"success": True, "message": "Ariza holati yangilandi"}), 200


@app.route("/api/leads/export", methods=["GET"])
def export_leads():
    leads = load_json(LEADS_FILE, [])
    import io
    import csv
    from flask import Response
    
    output = io.StringIO()
    # Write UTF-8 BOM so Excel opens with proper encoding
    output.write('\ufeff')
    writer = csv.writer(output)
    writer.writerow(["ID", "Sana va Vaqt", "Holati", "Mijoz Ismi", "Telefon", "Mahsulot / Xizmat", "Xabar", "Bino Rasmi", "Manba"])
    
    for l in leads:
        writer.writerow([
            l.get("id", ""),
            str(l.get("timestamp", ""))[:19].replace("T", " "),
            l.get("status", ""),
            l.get("name", ""),
            l.get("phone", ""),
            l.get("service") or l.get("product") or "",
            l.get("message", ""),
            l.get("photoUrl", ""),
            l.get("source", "")
        ])
    
    filename = f"tunikabond_leads_{datetime.now().strftime('%Y%m%d_%H%M')}.csv"
    return Response(
        output.getvalue(),
        mimetype="text/csv; charset=utf-8",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# --- UPLOAD API ---

@app.route("/api/upload/", methods=["POST", "OPTIONS"])
def upload_file():
    if request.method == "OPTIONS":
        return jsonify({}), 200
        
    if "file" not in request.files:
        return jsonify({"error": "Fayl yuborilmadi"}), 400
        
    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({"error": "Fayl tanlanmadi"}), 400
        
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".svg", ".pdf"]:
        return jsonify({"error": "Faqat rasm yoki PDF fayllar qabul qilinadi"}), 400
        
    safe_name = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{secrets.token_hex(4)}{ext}"
    target_path = os.path.join(UPLOAD_FOLDER, safe_name)
    file.save(target_path)
    
    # Also mirror to dist/uploads so built static server finds it immediately
    dist_target = os.path.join(DIST_UPLOAD_FOLDER, safe_name)
    try:
        import shutil
        shutil.copy2(target_path, dist_target)
    except Exception as e:
        logger.error(f"Error copying upload to dist: {e}")
        
    return jsonify({
        "success": True, 
        "url": f"/uploads/{safe_name}",
        "filename": safe_name
    }), 200


@app.route("/uploads/<path:filename>")
def serve_uploads(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


def send_telegram_notification(lead_data):
    name = html.escape(str(lead_data.get("name") or "Noma'lum mijoz"))
    phone = str(lead_data.get("phone") or "-")
    clean_phone = "".join(filter(str.isdigit, phone))
    service = html.escape(str(lead_data.get("service") or lead_data.get("product") or "-"))
    source = html.escape(str(lead_data.get("source") or "Veb-sayt"))
    message = html.escape(str(lead_data.get("message") or ""))
    calc = lead_data.get("calcData")
    photo_url = lead_data.get("photoUrl", "")

    text = f"🔥 <b>YANGI ARIZA: Tunikabond Lider</b> 🔥\n\n"
    text += f"👤 <b>Mijoz:</b> {name}\n"
    text += f"📞 <b>Telefon:</b> <code>{html.escape(phone)}</code>\n"
    text += f"🛠 <b>Xizmat/Mahsulot:</b> {service}\n"
    text += f"👨‍💼 <b>Mas'ul Admin:</b> @Mukhammad_azez\n"

    if calc:
        text += f"\n📊 <b>Kalkulyator Hisobi:</b>\n"
        text += f" • Bino turi: {html.escape(str(calc.get('buildingType', '-')))}\n"
        text += f" • Maydoni: {html.escape(str(calc.get('area', '-')))} m²\n"
        text += f" • Material: {html.escape(str(calc.get('material', '-')))}\n"
        text += f" • Taxminiy summa: {html.escape(str(calc.get('cost', '-')))}\n"

    if message:
        text += f"💬 <b>Qo'shimcha izoh:</b> {message}\n"

    if photo_url:
        text += f"🖼 <b>Bino rasmi:</b> {photo_url}\n"

    text += f"📍 <b>Manba:</b> {source}\n"
    text += f"⏰ <b>Vaqt:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"

    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return False

    chat_ids = [cid.strip() for cid in TELEGRAM_CHAT_ID.split(",") if cid.strip()]
    if not chat_ids:
        return False

    reply_markup = {
        "inline_keyboard": [
            [
                {"text": "💬 Mijozga yozish", "url": f"https://t.me/+{clean_phone}"} if clean_phone else {"text": "👨‍💼 Mas'ul", "url": "https://t.me/Mukhammad_azez"},
                {"text": "👨‍💼 Admin: @Mukhammad_azez", "url": "https://t.me/Mukhammad_azez"}
            ],
            [
                {"text": "🌐 Saytga o'tish", "url": "https://tunikabondlider.uz"}
            ]
        ]
    }

    any_success = False
    for chat_id in chat_ids:
        sent = False
        # Try sending with Photo if local file exists
        if photo_url and photo_url.startswith("/uploads/"):
            fname = photo_url.replace("/uploads/", "")
            local_fpath = os.path.join(UPLOAD_FOLDER, fname)
            if os.path.exists(local_fpath):
                photo_url_api = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendPhoto"
                try:
                    with open(local_fpath, "rb") as f:
                        resp = requests.post(
                            photo_url_api, 
                            data={"chat_id": chat_id, "caption": text, "parse_mode": "HTML", "reply_markup": json.dumps(reply_markup)}, 
                            files={"photo": f}, 
                            timeout=10
                        )
                        if resp.status_code == 200:
                            sent = True
                            any_success = True
                except Exception as e:
                    logger.error(f"Telegram photo send error for {chat_id}: {e}")

        # Fallback to standard text message
        if not sent:
            url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
            try:
                resp = requests.post(
                    url, 
                    json={"chat_id": chat_id, "text": text, "parse_mode": "HTML", "reply_markup": reply_markup}, 
                    timeout=6
                )
                if resp.status_code == 200:
                    any_success = True
            except Exception as e:
                logger.error(f"Telegram send error for {chat_id}: {e}")

    return any_success


# --- PRODUCTS CRUD ENDPOINTS ---

@app.route("/api/products/", methods=["GET", "POST", "OPTIONS"])
def handle_products():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    products = load_json(PRODUCTS_FILE, [])

    if request.method == "GET":
        return jsonify(products), 200

    # POST new product
    data = request.get_json() or {}
    if not data.get("name"):
        return jsonify({"error": "Mahsulot nomi kiritilishi shart"}), 400

    new_prod = {
        "id": f"prod-{int(datetime.now().timestamp())}",
        **data
    }
    products.append(new_prod)
    save_json(PRODUCTS_FILE, products)
    return jsonify({"success": True, "product": new_prod}), 201


@app.route("/api/products/<prod_id>", methods=["PUT", "DELETE", "OPTIONS"])
def modify_product(prod_id):
    if request.method == "OPTIONS":
        return jsonify({}), 200

    products = load_json(PRODUCTS_FILE, [])

    if request.method == "DELETE":
        new_prods = [p for p in products if str(p.get("id")) != str(prod_id)]
        save_json(PRODUCTS_FILE, new_prods)
        return jsonify({"success": True, "message": "Mahsulot o'chirildi"}), 200

    if request.method == "PUT":
        data = request.get_json() or {}
        found = False
        for p in products:
            if str(p.get("id")) == str(prod_id):
                p.update(data)
                found = True
                break

        if not found:
            return jsonify({"error": "Mahsulot topilmadi"}), 404

        save_json(PRODUCTS_FILE, products)
        return jsonify({"success": True, "message": "Mahsulot yangilandi"}), 200


# --- PORTFOLIO CRUD ENDPOINTS ---

@app.route("/api/portfolio/", methods=["GET", "POST", "OPTIONS"])
def handle_portfolio():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    portfolio = load_json(PORTFOLIO_FILE, [])

    if request.method == "GET":
        return jsonify(portfolio), 200

    data = request.get_json() or {}
    new_item = {
        "id": f"port-{int(datetime.now().timestamp())}",
        **data
    }
    portfolio.append(new_item)
    save_json(PORTFOLIO_FILE, portfolio)
    return jsonify({"success": True, "item": new_item}), 201


@app.route("/api/portfolio/<item_id>", methods=["PUT", "DELETE", "OPTIONS"])
def modify_portfolio_item(item_id):
    if request.method == "OPTIONS":
        return jsonify({}), 200

    portfolio = load_json(PORTFOLIO_FILE, [])

    if request.method == "DELETE":
        new_port = [p for p in portfolio if str(p.get("id")) != str(item_id)]
        save_json(PORTFOLIO_FILE, new_port)
        return jsonify({"success": True, "message": "Loyiha o'chirildi"}), 200

    if request.method == "PUT":
        data = request.get_json() or {}
        found = False
        for p in portfolio:
            if str(p.get("id")) == str(item_id):
                p.update(data)
                found = True
                break

        if not found:
            return jsonify({"error": "Loyiha topilmadi"}), 404

        save_json(PORTFOLIO_FILE, portfolio)
        return jsonify({"success": True, "message": "Loyiha yangilandi"}), 200


# --- TEAM CRUD ENDPOINTS ---

@app.route("/api/team/", methods=["GET", "POST", "OPTIONS"])
def handle_team():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    team = load_json(TEAM_FILE, [])

    if request.method == "GET":
        return jsonify(team), 200

    data = request.get_json() or {}
    if not data.get("name"):
        return jsonify({"error": "Usta yoki xodim ismi kiritilishi shart"}), 400

    new_member = {
        "id": f"team-{int(datetime.now().timestamp())}",
        **data
    }
    team.append(new_member)
    save_json(TEAM_FILE, team)
    return jsonify({"success": True, "member": new_member}), 201


@app.route("/api/team/<member_id>", methods=["PUT", "DELETE", "OPTIONS"])
def modify_team_member(member_id):
    if request.method == "OPTIONS":
        return jsonify({}), 200

    team = load_json(TEAM_FILE, [])

    if request.method == "DELETE":
        new_team = [m for m in team if str(m.get("id")) != str(member_id)]
        save_json(TEAM_FILE, new_team)
        return jsonify({"success": True, "message": "Xodim o'chirildi"}), 200

    if request.method == "PUT":
        data = request.get_json() or {}
        found = False
        for m in team:
            if str(m.get("id")) == str(member_id):
                m.update(data)
                found = True
                break

        if not found:
            return jsonify({"error": "Xodim topilmadi"}), 404

        save_json(TEAM_FILE, team)
        return jsonify({"success": True, "message": "Xodim ma'lumotlari yangilandi"}), 200


# --- CALCULATOR SETTINGS ENDPOINT ---

DEFAULT_CALC_SETTINGS = {
    "materialPrices": {
        "tunikabond_standard": 115000,
        "tunikabond_premium": 135000,
        "alyukabond_standard": 155000,
        "alyukabond_fireproof": 235000,
        "profnastil": 75000
    },
    "installationRates": {
        "cottage": 65000,
        "commercial": 75000,
        "cornice": 50000,
        "roof": 45000
    }
}

@app.route("/api/calculator/settings", methods=["GET", "PUT", "OPTIONS"])
def handle_calculator_settings():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    if request.method == "GET":
        settings = load_json(CALC_FILE, DEFAULT_CALC_SETTINGS)
        return jsonify(settings), 200

    if request.method == "PUT":
        data = request.get_json() or {}
        save_json(CALC_FILE, data)
        return jsonify({"success": True, "settings": data}), 200


# --- SWATCHES (RANGLAR VA TEKSTURALAR) ENDPOINTS ---

@app.route("/api/swatches/", methods=["GET", "POST", "OPTIONS"])
def handle_swatches():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    swatches = load_json(SWATCHES_FILE, [])

    if request.method == "GET":
        return jsonify(swatches), 200

    data = request.get_json() or {}
    new_swatch = {
        "id": data.get("id") or f"swatch-{int(datetime.now().timestamp())}",
        **data
    }
    swatches.insert(0, new_swatch)
    save_json(SWATCHES_FILE, swatches)
    return jsonify({"success": True, "swatch": new_swatch}), 201


@app.route("/api/swatches/<swatch_id>", methods=["PUT", "DELETE", "OPTIONS"])
def modify_swatch(swatch_id):
    if request.method == "OPTIONS":
        return jsonify({}), 200

    swatches = load_json(SWATCHES_FILE, [])

    if request.method == "DELETE":
        new_swatches = [s for s in swatches if str(s.get("id")) != str(swatch_id)]
        save_json(SWATCHES_FILE, new_swatches)
        return jsonify({"success": True, "message": "Rang o'chirildi"}), 200

    if request.method == "PUT":
        data = request.get_json() or {}
        found = False
        for s in swatches:
            if str(s.get("id")) == str(swatch_id):
                s.update(data)
                found = True
                break

        if not found:
            return jsonify({"error": "Rang topilmadi"}), 404

        save_json(SWATCHES_FILE, swatches)
        return jsonify({"success": True, "message": "Rang yangilandi"}), 200


# --- STATS ENDPOINT ---

@app.route("/api/stats/", methods=["GET"])
def get_stats():
    leads = load_json(LEADS_FILE, [])
    products = load_json(PRODUCTS_FILE, [])
    portfolio = load_json(PORTFOLIO_FILE, [])
    admins = load_json(ADMINS_FILE, [])
    team = load_json(TEAM_FILE, [])
    swatches = load_json(SWATCHES_FILE, [])

    new_leads = len([l for l in leads if l.get("status") == "new"])

    return jsonify({
        "totalLeads": len(leads),
        "newLeads": new_leads,
        "totalProducts": len(products),
        "totalProjects": len(portfolio),
        "totalAdmins": len(admins),
        "totalTeam": len(team),
        "totalSwatches": len(swatches)
    }), 200


# --- SPA SERVING ---

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_spa(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    logger.info(f"Starting Tunikabond Lider Fullstack Server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
