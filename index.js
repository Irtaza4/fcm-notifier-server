require("dotenv").config(); // Loads .env (optional if using Railway)

const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Load Firebase credentials from environment variable
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (error) {
  console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:", error.message);
  process.exit(1); // Exit if the credentials are not valid
}

// ✅ Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ✅ Middleware
app.use(bodyParser.json({ limit: "1mb" }));

// ✅ API: Send topic-based FCM notification
app.post("/send-topic-notification", async (req, res) => {
  const { topic, title, body, data } = req.body;

  if (!topic || !title || !body) {
    return res.status(400).json({ error: "Missing required fields: topic, title, or body" });
  }

  const message = {
    notification: { title, body },
    data: {
      ...data,
      click_action: "FLUTTER_NOTIFICATION_CLICK", // Important for Flutter
    },
    topic,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Message sent:", response);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("🚀 FCM Server is running!");
});

// ✅ 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
