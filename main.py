import os
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
import requests

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("TunikabondLider")

app = Flask(__name__, static_folder="dist")

# Configuration (defaults to the company channel bot with env fallback)
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8160493029:AAHA2wWKlaSR__UTzByJtLt24rWXtsxV3c4")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "-1003209002534")
LEADS_FILE = "leads.json"


def save_lead_to_db(lead_data):
    """Save lead to local JSON storage for backup and recovery."""
    leads = []
    if os.path.exists(LEADS_FILE):
        try:
            with open(LEADS_FILE, "r", encoding="utf-8") as f:
                leads = json.load(f)
        except Exception as e:
            logger.error(f"Error reading leads file: {e}")
            leads = []

    lead_record = {
        "id": len(leads) + 1,
        "timestamp": datetime.now().isoformat(),
        **lead_data,
    }
    leads.append(lead_record)

    try:
        with open(LEADS_FILE, "w", encoding="utf-8") as f:
            json.dump(leads, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.error(f"Error saving lead: {e}")

    return lead_record


def send_to_telegram(lead_data):
    """Format and send message to Telegram securely from backend."""
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
        text += f"\n📊 *Kalkulyator Hisob-kitobi:*\n"
        text += f" • Bino turi: {calc.get('buildingType', '-')}\n"
        text += f" • Maydoni: {calc.get('area', '-')} m²\n"
        text += f" • Material: {calc.get('material', '-')}\n"
        text += f" • Hisoblangan narx: {calc.get('cost', '-')}\n"

    if message:
        text += f"💬 *Qo'shimcha izoh:* {message}\n"

    text += f"📍 *Manba:* {source}\n"
    text += f"⏰ *Vaqt:* {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"

    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        logger.warning("Telegram bot credentials not configured.")
        return False

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": "Markdown",
    }

    try:
        res = requests.post(url, json=payload, timeout=8)
        if res.status_code == 200:
            logger.info("Telegram notification sent successfully.")
            return True
        else:
            logger.error(f"Telegram API error {res.status_code}: {res.text}")
            return False
    except Exception as e:
        logger.error(f"Telegram connection error: {e}")
        return False


@app.route("/api/leads/", methods=["POST"])
def create_lead():
    """Endpoint for receiving client requests and routing to Telegram."""
    data = request.get_json() or {}
    phone = data.get("phone", "")

    if not phone or len(phone.strip()) < 9:
        return jsonify({"error": "Telefon raqami kiritilishi shart"}), 400

    lead = save_lead_to_db(data)
    telegram_success = send_to_telegram(data)

    return jsonify({
        "success": True,
        "message": "Ariza muvaffaqiyatli qabul qilindi",
        "lead_id": lead["id"],
        "telegram_sent": telegram_success
    }), 201


@app.route("/api/health/", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "app": "Tunikabond Lider API v2.0"}), 200


# Static SPA routing
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_spa(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    logger.info(f"Starting Tunikabond Lider server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
