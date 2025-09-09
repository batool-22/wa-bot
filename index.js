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
  const s = (t || "").toLowerCase();
  if (s.includes("hi") || s.includes("hello") || s.includes("مرحبا")) {
    return "👋 Welcome to *Atlantis Bot Assistance*! 🌊\nI’m here to help you with any questions or support you need.";
  }
  if (s.includes("Breakfast") || s.includes("فطور")) {
    return (
      "🍽️ *Atlantis Dining Options*\n\n" +
      "• *Saffron* (Asian Buffet)\n" +
      "  Sunday – Friday: Breakfast 07:00 – 11:30\n" +
      "  Saturday: Brunch 13:00 – 16:00\n\n" +
      "• *Kaleidoscope* (International Buffet)\n" +
      "  Daily: Breakfast 07:00 – 11:30"
    );
  }
  if (s.includes("dinner") || s.includes("عشاء") || s.includes("عشا")) {
    return (
      "🍽️ *Atlantis Dinner Options*\n\n" +
      "• *Nobu* (Japanese-Peruvian, by Chef Nobu Matsuhisa)\n" +
      "  🕒 Dinner: Daily 18:00 – 01:00\n" +
      "  (Family seating until 20:30, ages 13+ after 20:30)\n\n" +
      "• *Hakkasan* (Modern Cantonese – Michelin-starred)\n" +
      "  🕒 Dinner: Daily 18:00 – 01:00\n" +
      "  (Family seating until 20:30, ages 10+ after 20:30)\n\n" +
      "• *Ossiano* (Underwater Fine Dining – Michelin-starred, Seafood)\n" +
      "  🕒 Tuesday – Sunday: 18:00 – 01:00\n" +
      "  (Ages 10+ only)\n\n" +
      "• *Seafire Steakhouse & Bar* (Steakhouse)\n" +
      "  🕒 Dinner: Daily 18:00 – 01:00\n" +
      "  (Family seating until 20:30, ages 10+ after 20:30)\n\n" +
      "• *Bread Street Kitchen & Bar* by Gordon Ramsay (Modern British/European)\n" +
      "  🕒 Dinner: Daily 18:00 – 23:00 (open 12:00 – 00:00)\n\n" +
      "• *Ayamna* (Traditional Lebanese 🇱🇧)\n" +
      "  🕒 Dinner: Daily 18:00 – 01:00\n\n" +
      "• *En Fuego* (Latin American / Mexican Social Dining)\n" +
      "  🕒 Tue – Thu: 17:00 – 01:00\n" +
      "  🕒 Fri: 17:00 – 02:00\n" +
      "  🕒 Sat: 19:00 – 02:00\n" +
      "  🕒 Sun: 17:00 – 01:00\n\n" +
      "• *Saffron* (Asian Buffet)\n" +
      "  🕒 Dinner: Sun – Fri 18:00 – 22:30\n" +
      "  🕒 Sat: 19:00 – 22:30\n\n" +
      "• *Kaleidoscope* (International Buffet)\n" +
      "  🕒 Dinner: Daily 18:00 – 22:30\n\n" +
      "• *Wavehouse* (Family dining + Arcade 🎳)\n" +
      "  🕒 Dinner: Daily until 01:00 (open 12:00 – 01:00)\n\n" +
      "• *Asia Republic* (Pan-Asian casual)\n" +
      "  🕒 Dinner: Daily 18:00 – 23:00"
    );
  }
  if (
    s.includes("aquaventure") ||
    s.includes("water park") ||
    s.includes("waterpark") ||
    s.includes("الألعاب") ||
    s.includes("الالعاب") ||
    s.includes("الالعاب المائية")
  ) {
    return (
      "🌊 *Aquaventure Waterpark Information*\n\n" +
      "• Opens daily from *09:30 – 18:30*\n\n" +
      "🐠 *The Aquarium*: Currently closed until further notice.\n\n" +
      "🐟 *Hospital Fish Tale*: Available as a similar experience.\n" +
      "   🕒 Opening hours: 10:00 – 18:00\n" +
      "   📌 Booking required via concierge."
    );
  }
  if (
    s.includes("swimming pool") ||
    s.includes("pool") ||
    s.includes("swimming") ||
    s.includes("المسبح") ||
    s.includes("مسبح")
  ) {
    return (
      "🏊 *Swimming Pools Information*\n\n" +
      "• *Main Swimming Pool*: Opens daily from *08:00 – 20:00* 🕗\n" +
      "• *Family Pool*: Opens daily from *09:30 – 18:30* 🕤"
    );
  }
  if (
    s.includes("kids club") ||
    s.includes("kids") ||
    s.includes("نادي الاطفال") ||
    s.includes("الاطفال")
  ) {
    return (
      "🧒 *Atlantis Kids Club Information*\n\n" +
      "📅 *Operating Days*: Open every day of the year (Mon – Sun)\n\n" +
      "🕒 *Session Times*:\n" +
      "• Morning: 10:00 – 13:00\n" +
      "• Afternoon: 14:00 – 17:00\n" +
      "• Evening: 18:00 – 22:00\n\n" +
      "💳 *Access & Pricing*:\n" +
      "• Resort guests:\n" +
      "   - Standard rooms: 1 session per stay included\n" +
      "   - Imperial Club rooms: 1 session per day included\n" +
      "   - Suites & Signature Suites: 2 sessions per day included\n" +
      "• Additional sessions: AED 160 per session\n\n" +
      "🎉 *What it offers*:\n" +
      "A variety of structured and creative activities such as:\n" +
      "- Cooking, arts & crafts, group games\n" +
      "- Imaginative play (e.g., 'be a pirate', 'mad scientist')\n" +
      "- Gaming, 'underwater' film experiences, and more."
    );
  }
  if (
    s.includes("map") ||
    s.includes("maps") ||
    s.includes("خريطة") ||
    s.includes("خرائط")
  ) {
    return (
      "🗺️ *Atlantis Resort Map*\n\n" +
      "You can view or download the full map here:\n" +
      "https://www.atlantis.com/-/media/atlantis/dubai/atp/resort/pdfs/atp-aqv-map-july2022.pdf?utm_source=chatgpt.com"
    );
  } // === Breakfast Restaurants ===
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

  // === Dinner Restaurants ===
  if (s.includes("nobu")) {
    return (
      "🍣 *Nobu* (Japanese-Peruvian, by Chef Nobu Matsuhisa)\n\n" +
      "🕒 Dinner: Daily 18:00 – 01:00\n" +
      "(Family seating until 20:30, ages 13+ after 20:30)"
    );
  }

  if (s.includes("hakkasan")) {
    return (
      "🥡 *Hakkasan* (Modern Cantonese – Michelin-starred)\n\n" +
      "🕒 Dinner: Daily 18:00 – 01:00\n" +
      "(Family seating until 20:30, ages 10+ after 20:30)"
    );
  }

  if (s.includes("ossiano")) {
    return (
      "🐟 *Ossiano* (Underwater Fine Dining – Michelin-starred, Seafood)\n\n" +
      "🕒 Tuesday – Sunday: 18:00 – 01:00\n" +
      "(Ages 10+ only)"
    );
  }

  if (s.includes("seafire")) {
    return (
      "🥩 *Seafire Steakhouse & Bar* (Steakhouse)\n\n" +
      "🕒 Dinner: Daily 18:00 – 01:00\n" +
      "(Family seating until 20:30, ages 10+ after 20:30)"
    );
  }

  if (s.includes("bread street") || s.includes("gordon ramsay")) {
    return (
      "🥖 *Bread Street Kitchen & Bar by Gordon Ramsay* (Modern British/European)\n\n" +
      "🕒 Dinner: Daily 18:00 – 23:00\n" +
      "(Restaurant open from 12:00 – 00:00)"
    );
  }

  if (s.includes("ayamna")) {
    return (
      "🇱🇧 *Ayamna* (Traditional Lebanese Cuisine)\n\n" +
      "🕒 Dinner: Daily 18:00 – 01:00"
    );
  }

  if (s.includes("en fuego")) {
    return (
      "🌮 *En Fuego* (Latin American / Mexican Social Dining)\n\n" +
      "🕒 Tue – Thu: 17:00 – 01:00\n" +
      "🕒 Fri: 17:00 – 02:00\n" +
      "🕒 Sat: 19:00 – 02:00\n" +
      "🕒 Sun: 17:00 – 01:00"
    );
  }

  if (s.includes("wavehouse")) {
    return (
      "🍔 *Wavehouse* (Family dining + Burgers, Pizza, Arcade 🎳)\n\n" +
      "🕒 Dinner: Daily until 01:00\n" +
      "(Open 12:00 – 01:00)"
    );
  }

  if (s.includes("asia republic")) {
    return (
      "🥢 *Asia Republic* (Pan-Asian casual dining)\n\n" +
      "🕒 Dinner: Daily 18:00 – 23:00"
    );
  }
}

// Utility: escape XML characters so TwiML is valid
function escapeXml(s) {
  return String(s).replace(
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Twilio WhatsApp bot running on port ${PORT}`)
);
