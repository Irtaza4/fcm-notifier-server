// index.js

const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

// ✅ Load service account credentials from local file
const serviceAccount = require("./service-account.json");

const app = express();
const PORT = process.env.PORT || 3000; // Railway injects this env var

// ✅ Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin initialized.");
} catch (error) {
  console.error("❌ Firebase Admin initialization failed:", error.message);
  process.exit(1);
}

// ✅ Middleware
app.use(bodyParser.json({ limit: "1mb" }));

// ✅ API: Send topic-based FCM notification
app.post("/send-topic-notification", async (req, res) => {
  const { topic, title, body, data } = req.body;

  if (!topic || !title || !body) {
    console.warn("⚠️ Missing required fields in request body.");
    return res.status(400).json({ error: "Missing required fields: topic, title, or body" });
  }

  const message = {
    notification: { title, body },
    data: {
      ...data,
      click_action: "FLUTTER_NOTIFICATION_CLICK", // For Flutter foreground clicks
    },
    topic,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Notification sent to topic:", topic);
    console.log("📝 Response:", response);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("❌ Failed to send FCM notification:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Health check
app.get("/", (req, res) => {
  res.send("🚀 FCM Notification Server is running.");
});

// ✅ 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Ready to send notifications via POST /send-topic-notification`);
});
