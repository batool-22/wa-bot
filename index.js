// index.js
const express = require("express");
const app = express();

// 1) Serve files from /public so Twilio can fetch your PDFs
//    (put your PDFs exactly as shown: public/Download-Atlantis-Menu.pdf, public/Download-Imperial-Club.pdf)
app.use(express.static("public"));

// Health check
app.get("/", (_req, res) => res.send("OK"));

// Twilio posts x-www-form-urlencoded to this path
app.use("/twilio-whatsapp", express.urlencoded({ extended: false }));

// --- helpers ---
function escapeXml(s) {
  return String(s ?? "").replace(
    /[<>&'"]/g,
    (c) =>
      ({
        "<": "&lt;",
        "&": "&amp;",
        ">": "&gt;",
        "'": "&apos;",
        '"': "&quot;",
      }[c])
  );
}

// Build absolute URL for a file in /public
function publicUrl(req, filename) {
  const base = process.env.RENDER_EXTERNAL_URL || `https://${req.headers.host}`;
  return `${base.replace(/\/$/, "")}/${filename}`;
}

// --- webhook ---
app.post("/twilio-whatsapp", (req, res) => {
  try {
    const raw = (req.body.Body || "").trim();
    const s = raw.toLowerCase();

    // PDF: Half Board / meals
    if (
      s.includes("half board") ||
      s.includes("الفطور") ||
      s.includes("العشاء") ||
      s.includes("العشا")
    ) {
      const pdfUrl = publicUrl(req, "Download-Atlantis-Menu.pdf");
      const twiml =
        `<?xml version="1.0" encoding="UTF-8"?>` +
        `<Response><Message>` +
        `<Body>📄 إليك قائمة الوجبات (Half Board) / Here is the meals (Half Board) PDF</Body>` +
        `<Media>${escapeXml(pdfUrl)}</Media>` +
        `</Message></Response>`;
      return res.status(200).type("text/xml; charset=utf-8").send(twiml);
    }

    // PDF: Imperial Club
    if (s.includes("imperial club") || s.includes("اللاونج")) {
      const pdfUrl = publicUrl(req, "Download-Imperial-Club.pdf");
      const twiml =
        `<?xml version="1.0" encoding="UTF-8"?>` +
        `<Response><Message>` +
        `<Body>🗺️ Here is the Atlantis Imperial Club PDF</Body>` +
        `<Media>${escapeXml(pdfUrl)}</Media>` +
        `</Message></Response>`;
      return res.status(200).type("text/xml; charset=utf-8").send(twiml);
    }

    // Text reply (always fall back to a default so it's never undefined)
    const maybe = reply(raw);
    const answer =
      typeof maybe === "string" && maybe.trim() ? maybe : defaultHelp();

    const twiml =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<Response><Message><Body>${escapeXml(
        answer
      )}</Body></Message></Response>`;
    return res.status(200).type("text/xml; charset=utf-8").send(twiml);
  } catch (e) {
    console.error("Webhook error:", e);
    return res.status(200).type("text/xml").send("<Response/>");
  }
});

function containsArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}
function reply(t) {
  const s = (t || "").toLowerCase().trim();
  if (containsArabic(s)) {
    return replyArabic(s);
  } else {
    return replyEnglish(s);
  }
}
// Chatbot reply logic
function replyEnglish(s) {
  // ---- 1) Specific restaurants FIRST (override generic 'dinner') ----
  if (s.includes("saffron")) {
    return (
      "🥢 *Saffron* (Asian Buffet)\n\n" +
      "• Sunday – Friday: Breakfast 07:00 – 11:30\n" +
      "• Saturday: Brunch 13:00 – 16:00\n" +
      "• Dinner: Sun – Fri 18:00 – 22:30, Sat 19:00 – 22:30"
    );
  }
  if (s.includes("kaleidoscope")) {
    return (
      "🍴 *Kaleidoscope* (International Buffet)\n\n" +
      "• Daily: Breakfast 07:00 – 11:30\n" +
      "• Dinner: Daily 18:00 – 22:30"
    );
  }
  if (s.includes("nobu")) {
    return (
      "🍣 *Nobu* (Japanese-Peruvian, by Chef Nobu Matsuhisa)\n" +
      "🕒 Dinner: Daily 18:00 – 01:00\n" +
      "(Family seating until 20:30, ages 13+ after 20:30)"
    );
  }
  if (s.includes("hakkasan")) {
    return (
      "🥡 *Hakkasan* (Modern Cantonese – Michelin-starred)\n" +
      "🕒 Dinner: Daily 18:00 – 01:00\n" +
      "(Family seating until 20:30, ages 10+ after 20:30)"
    );
  }
  if (s.includes("ossiano")) {
    return (
      "🐟 *Ossiano* (Underwater Fine Dining – Michelin-starred, Seafood)\n" +
      "🕒 Tuesday – Sunday: 18:00 – 01:00\n" +
      "(Ages 10+ only)"
    );
  }
  if (s.includes("seafire")) {
    return (
      "🥩 *Seafire Steakhouse & Bar* (Steakhouse)\n" +
      "🕒 Dinner: Daily 18:00 – 01:00\n" +
      "(Family seating until 20:30, ages 10+ after 20:30)"
    );
  }
  if (s.includes("bread street") || s.includes("gordon ramsay")) {
    return (
      "🥖 *Bread Street Kitchen & Bar by Gordon Ramsay* (Modern British/European)\n" +
      "🕒 Dinner: Daily 18:00 – 23:00 (open 12:00 – 00:00)"
    );
  }
  if (s.includes("ayamna")) {
    return "🇱🇧 *Ayamna* (Traditional Lebanese Cuisine)\n🕒 Dinner: Daily 18:00 – 01:00";
  }
  if (s.includes("en fuego")) {
    return (
      "🌮 *En Fuego* (Latin American / Mexican Social Dining)\n" +
      "🕒 Tue–Thu 17:00–01:00 • Fri 17:00–02:00 • Sat 19:00–02:00 • Sun 17:00–01:00"
    );
  }
  if (s.includes("wavehouse")) {
    return (
      "🍔 *Wavehouse* (Family dining + Arcade 🎳)\n" +
      "🕒 Dinner: Daily until 01:00 (open 12:00 – 01:00)"
    );
  }
  if (s.includes("asia republic")) {
    return "🥢 *Asia Republic* (Pan-Asian casual)\n🕒 Dinner: Daily 18:00 – 23:00";
  }

  // ---- 2) Greetings (use lowercase keywords) ----
  if (s.includes("hi") || s.includes("hello")) {
    return "👋 Welcome to *Atlantis Bot Assistance*! 🌊\nI’m here to help you with any questions or support you need.";
  }

  // ---- 3) Breakfast (use lowercase 'breakfast') ----
  if (s.includes("breakfast")) {
    return (
      "🍽️ *Atlantis Dining Options*\n\n" +
      "• *Saffron* (Asian Buffet)\n" +
      "  Sunday–Friday: Breakfast 07:00–11:30\n" +
      "  Saturday: Brunch 13:00–16:00\n\n" +
      "• *Kaleidoscope* (International Buffet)\n" +
      "  Daily: Breakfast 07:00–11:30"
    );
  }

  // ---- 4) Generic Dinner list ----
  if (s.includes("dinner")) {
    return (
      "🍽️ *Atlantis Dinner Options*\n\n" +
      "• *Nobu*: Daily 18:00–01:00 (13+ after 20:30)\n" +
      "• *Hakkasan*: Daily 18:00–01:00 (10+ after 20:30)\n" +
      "• *Ossiano*: Tue–Sun 18:00–01:00 (10+)\n" +
      "• *Seafire*: Daily 18:00–01:00 (10+ after 20:30)\n" +
      "• *Bread Street Kitchen*: 18:00–23:00 (open 12:00–00:00)\n" +
      "• *Ayamna*: Daily 18:00–01:00\n" +
      "• *En Fuego*: Tue–Thu 17:00–01:00, Fri 17:00–02:00, Sat 19:00–02:00, Sun 17:00–01:00\n" +
      "• *Saffron*: Sun–Fri 18:00–22:30, Sat 19:00–22:30\n" +
      "• *Kaleidoscope*: Daily 18:00–22:30\n" +
      "• *Wavehouse*: Dinner until 01:00 (open 12:00–01:00)\n" +
      "• *Asia Republic*: Daily 18:00–23:00"
    );
  }
  if (s.includes("restaurant") || s.includes("restaurants")) {
    return (
      "🍽️ *Atlantis Dubai Restaurants*\n\n" +
      "- Nobu\n- Hakkasan\n- Ossiano\n- Seafire Steakhouse & Bar\n- Bread Street Kitchen (Gordon Ramsay)\n" +
      "- Ayamna\n- En Fuego\n- Saffron\n- Kaleidoscope\n- Wavehouse\n- Asia Republic\n" +
      "- Shark Bites\n- Barracudas\n- The Edge\n- The Shore\n- TBJ (The Burger Joint)\n- Plato’s\n- Poseidon Café"
    );
  }

  // ---- 5) Aquaventure ----
  if (
    s.includes("aquaventure") ||
    s.includes("water park") ||
    s.includes("waterpark")
  ) {
    return (
      "🌊 *Aquaventure Waterpark*\n\n" +
      "• Opens daily: 09:30–18:30\n\n" +
      "🐠 *The Aquarium*: Closed until further notice.\n" +
      "🐟 *Hospital Fish Tale*: 10:00–18:00 (booking via concierge required)"
    );
  }

  // ---- 6) Pools ----
  if (
    s.includes("swimming pool") ||
    s.includes("pool") ||
    s.includes("swimming")
  ) {
    return (
      "🏊 *Swimming Pools*\n\n" +
      "• Main Pool: 08:00–20:00\n" +
      "• Family Pool: 09:30–18:30"
    );
  }

  // ---- 7) Kids Club ----
  if (s.includes("kids club") || s.includes("kids")) {
    return (
      "🧒 *Atlantis Kids Club*\n\n" +
      "📅 Open daily (Mon–Sun)\n\n" +
      "🕒 Sessions:\n" +
      "• Morning: 10:00–13:00\n" +
      "• Afternoon: 14:00–17:00\n" +
      "• Evening: 18:00–22:00\n\n" +
      "💳 Access:\n" +
      "• Standard rooms: 1 session per stay\n" +
      "• Imperial Club: 1 session per day\n" +
      "• Suites & Signature: 2 sessions per day\n" +
      "• Extra sessions: AED 160 each\n\n" +
      "🎉 Activities: cooking, arts & crafts, group games, imaginative play, gaming, 'underwater' films, and more."
    );
  }

  // ---- 8) Map ----
  if (s.includes("map") || s.includes("maps")) {
    return (
      "🗺️ *Atlantis Resort Map*\n\n" +
      "View/download:\n" +
      "https://www.atlantis.com/-/media/atlantis/dubai/atp/resort/pdfs/atp-aqv-map-july2022.pdf?utm_source=chatgpt.com"
    );
  }

  // ---- 9) Default help ----
  return (
    "Hi 👋 this is *Atlantis Bot Assistance*.\n" +
    "Try keywords like:\n" +
    "• breakfast / dinner\n" +
    "• aquaventure / pool / kids club / map\n" +
    "• or a restaurant name: saffron, kaleidoscope, nobu, hakkasan, ossiano, seafire, bread street, ayamna, en fuego, wavehouse, asia republic"
  );
}
function replyArabic(s) {
  if (s.includes("مرحبا")) {
    return "👋 أهلاً بك في *مساعد أتلانتس*! 🌊\nأنا هنا لمساعدتك والإجابة عن أسئلتك.";
  }

  if (s.includes("خريطة") || s.includes("خرائط")) {
    return "🗺️ *خريطة أتلانتس*:\nhttps://www.atlantis.com/-/media/atlantis/dubai/atp/resort/pdfs/atp-aqv-map-july2022.pdf";
  }
  if (s.includes("المسبح") || s.includes("مسبح")) {
    return "🏊 *المسابح في أتلانتس*\nالمسبح الرئيسي: 08:00–20:00\nالمسبح العائلي: 09:30–18:30";
  }
  if (s.includes("نادي الاطفال") || s.includes("الاطفال")) {
    return "🧒 *نادي الأطفال في أتلانتس*\nمفتوح يومياً\nالجلسات: 10:00–13:00 | 14:00–17:00 | 18:00–22:00.";
  }
  if (
    s.includes("الألعاب") ||
    s.includes("الالعاب") ||
    s.includes("الالعاب المائية")
  ) {
    return "🌊 *أكوافنتشر ووتربارك*: 09:30–18:30\n🐠 الأكواريوم مغلق حالياً\n🐟 تجربة Hospital Fish Tale: من 10:00–18:00 (تحتاج حجز)";
  }
  if (s.includes("مطعم") || s.includes("مطاعم")) {
    return "🍽️ *مطاعم أتلانتس دبي*: نوبو، هاكاسان، أوسيانو، سيفير، جوردون رامزي، أيمنه، إن فويغو، سافرون، كاليودوسكوب، ويف هاوس، آسيا ريبابلك، شارك بايتس، باراكوداس، ذا إيدج، ذا شور، تي بي جي (برجر جويِنت)، بلاتوز، بوسيدون كافيه.";
  }

  return "👋 هذا *مساعد أتلانتس*. اسألني عن الفطور، العشاء، المسابح، أكوافنتشر، نادي الأطفال، الخريطة أو المطاعم.";
}

// Utility: escape XML characters so TwiML is valid

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Twilio WhatsApp bot running on port ${PORT}`)
);
