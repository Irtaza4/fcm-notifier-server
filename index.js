// index.js

const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const app = express();
const PORT = process.env.PORT || 3000; // Use 3000 for local, Railway injects PORT automatically

// ✅ Load Firebase service account from local file (for Railway and local both)
let serviceAccount;
try {
  serviceAccount = require("./service-account.json");
  console.log("✅ Firebase credentials loaded successfully.");
} catch (error) {
  console.error("❌ Failed to load service-account.json:", error.message);
  process.exit(1); // Exit if credentials are invalid
}

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

// ✅ Health check endpoint
app.get("/test", (req, res) => {
  console.log("👀 /test hit");
  res.send("✅ Server is alive.");
});

// ✅ Topic notification endpoint with logging
app.post("/send-topic-notification", async (req, res) => {
  console.log("🔥 Incoming /send-topic-notification request:");
  console.log(JSON.stringify(req.body, null, 2));

  const { topic, title, body, data } = req.body;

  if (!topic || !title || !body) {
    console.warn("⚠️ Missing required fields in request body.");
    return res.status(400).json({ error: "Missing required fields: topic, title, or body" });
  }

  const message = {
    notification: { title, body },
    data: {
      ...data,
      click_action: "FLUTTER_NOTIFICATION_CLICK", // Required for foreground clicks
    },
    topic,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Notification sent to topic:", topic);
    console.log("📦 FCM Response:", response);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("❌ Failed to send FCM notification:", error.message);
    console.error("💥 Full error:", error);
    res.status(500).json({ error: error.message });
  }
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
