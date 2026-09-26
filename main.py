import os
import json
import logging
import hashlib
import secrets
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
import requests

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("TunikabondLider")

app = Flask(__name__, static_folder="dist")

DATA_DIR = os.path.join(os.path.dirname(__file__), "server_data")
os.makedirs(DATA_DIR, exist_ok=True)

ADMINS_FILE = os.path.join(DATA_DIR, "admins.json")
LEADS_FILE = os.path.join(DATA_DIR, "leads.json")
PRODUCTS_FILE = os.path.join(DATA_DIR, "products.json")
PORTFOLIO_FILE = os.path.join(DATA_DIR, "portfolio.json")

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8160493029:AAHA2wWKlaSR__UTzByJtLt24rWXtsxV3c4")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "-1003209002534")

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


init_default_admins()
init_default_products()
init_default_portfolio()


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
    lead_record = {
        "id": f"lead-{len(leads) + 1}",
        "timestamp": datetime.now().isoformat(),
        "status": "new",  # new | in_progress | completed | cancelled
        **data,
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


def send_telegram_notification(lead_data):
    name = lead_data.get("name", "Noma'lum mijoz")
    phone = lead_data.get("phone", "-")
    service = lead_data.get("service", "-")
    source = lead_data.get("source", "Veb-sayt")
    message = lead_data.get("message", "")
    calc = lead_data.get("calcData")

    text = f"🔥 *YANGI BUYURTMA: Tunikabond Lider* 🔥\n\n"
    text += f"👤 *Mijoz:* {name}\n"
    text += f"📞 *Telefon:* `{phone}`\n"
    text += f"🛠 *Xizmat:* {service}\n"
    text += f"👨‍💼 *Mas'ul Admin:* @Muhammadazez\n"

    if calc:
        text += f"\n📊 *Kalkulyator Hisobi:*\n"
        text += f" • Bino turi: {calc.get('buildingType', '-')}\n"
        text += f" • Maydoni: {calc.get('area', '-')} m²\n"
        text += f" • Material: {calc.get('material', '-')}\n"
        text += f" • Narx: {calc.get('cost', '-')}\n"

    if message:
        text += f"💬 *Qo'shimcha izoh:* {message}\n"

    text += f"📍 *Manba:* {source}\n"
    text += f"⏰ *Vaqt:* {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"

    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return False

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    try:
        requests.post(url, json={"chat_id": TELEGRAM_CHAT_ID, "text": text, "parse_mode": "Markdown"}, timeout=6)
        return True
    except Exception as e:
        logger.error(f"Telegram send error: {e}")
        return False


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


# --- STATS ENDPOINT ---

@app.route("/api/stats/", methods=["GET"])
def get_stats():
    leads = load_json(LEADS_FILE, [])
    products = load_json(PRODUCTS_FILE, [])
    portfolio = load_json(PORTFOLIO_FILE, [])
    admins = load_json(ADMINS_FILE, [])

    new_leads = len([l for l in leads if l.get("status") == "new"])

    return jsonify({
        "totalLeads": len(leads),
        "newLeads": new_leads,
        "totalProducts": len(products),
        "totalProjects": len(portfolio),
        "totalAdmins": len(admins)
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
