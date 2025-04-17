// const express = require("express");
const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Try to parse FIREBASE_SERVICE_ACCOUNT from .env or Railway config
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (error) {
  console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:", error.message);
  process.exit(1); // Exit the app if credentials are bad
}

// ✅ Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ✅ Middleware
app.use(bodyParser.json({ limit: "1mb" }));

// ✅ API: Send topic notification
app.post("/send-topic-notification", async (req, res) => {
  const { topic, title, body, data } = req.body;

  if (!topic || !title || !body) {
    return res.status(400).json({ error: "Missing required fields: topic, title, or body" });
  }

  const message = {
    notification: { title, body },
    data: {
      ...data,
      click_action: "FLUTTER_NOTIFICATION_CLICK", // Required for Flutter
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

// ✅ Root endpoint
app.get("/", (req, res) => {
  res.send("🚀 FCM Server is up and running!");
});

// ✅ Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV || "development"} on port ${PORT}`);
});
