const QRCode = require("qrcode");

const link = "https://wa.me/14155238886?text=join%20tin-pale"; // replace with your real join code
QRCode.toFile("sandbox-qr.png", link, { errorCorrectionLevel: "M" }, (err) => {
  if (err) throw err;
  console.log("QR saved to sandbox-qr.png ✅");
});
