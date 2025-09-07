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
  if (s.includes("hi") || s.includes("hello")) {
    return "👋 Welcome to *Atlantis Bot Assistance*! 🌊\nI’m here to help you with any questions or support you need.";
  }
  if (s.includes("restaurant") || s.includes("resturant")) {
    return (
      "🍽️ Here are some popular restaurants in Atlantis:\n\n" +
      "- Ossiano (Fine dining, underwater views)\n" +
      "- Wavehouse (Casual dining + bowling 🎳)\n" +
      "- Ayamna (Authentic Lebanese 🇱🇧)\n" +
      "- Saffron (Buffet with international dishes 🌍)\n" +
      "- Bread Street Kitchen (By Gordon Ramsay 👨‍🍳)"
    );
  }

  return (
    "Hi 👋 this is *Atlantis Bot Assistance*. You can ask me about:\n" +
    "- Fees 💰\n" +
    "- How to apply 📄\n" +
    "- Restaurants 🍽️\n" +
    "- Or request a human 👨‍💼"
  );
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
