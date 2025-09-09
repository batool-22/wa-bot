// index.js
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.get("/", (_req, res) => res.send("OK"));

// Twilio sends x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Twilio WhatsApp webhook endpoint
app.post("/twilio-whatsapp", (req, res) => {
  const from = req.body.From; // e.g. 'whatsapp:+9715XXXXXXX'
  const text = (req.body.Body || "").trim();

  // get chatbot reply
  const answer = reply(text);

  // Respond with TwiML (Twilio XML response)
  res
    .type("text/xml")
    .send(`<Response><Message>${escapeXml(answer)}</Message></Response>`);
});

// Chatbot reply logic
function reply(t) {
  const s = (t || "").toLowerCase().trim();

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
  if (s.includes("hi") || s.includes("hello") || s.includes("مرحبا")) {
    return "👋 Welcome to *Atlantis Bot Assistance*! 🌊\nI’m here to help you with any questions or support you need.";
  }

  // ---- 3) Breakfast (use lowercase 'breakfast') ----
  if (s.includes("breakfast") || s.includes("فطور")) {
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
  if (s.includes("dinner") || s.includes("عشاء") || s.includes("عشا")) {
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

  // ---- 5) Aquaventure ----
  if (
    s.includes("aquaventure") ||
    s.includes("water park") ||
    s.includes("waterpark") ||
    s.includes("الألعاب") ||
    s.includes("الالعاب") ||
    s.includes("الالعاب المائية")
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
    s.includes("swimming") ||
    s.includes("المسبح") ||
    s.includes("مسبح")
  ) {
    return (
      "🏊 *Swimming Pools*\n\n" +
      "• Main Pool: 08:00–20:00\n" +
      "• Family Pool: 09:30–18:30"
    );
  }

  // ---- 7) Kids Club ----
  if (
    s.includes("kids club") ||
    s.includes("kids") ||
    s.includes("نادي الاطفال") ||
    s.includes("الاطفال")
  ) {
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
  if (
    s.includes("map") ||
    s.includes("maps") ||
    s.includes("خريطة") ||
    s.includes("خرائط")
  ) {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Twilio WhatsApp bot running on port ${PORT}`)
);
