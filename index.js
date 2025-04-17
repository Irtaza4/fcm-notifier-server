const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 3000;

const serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(bodyParser.json());

// 🚨 API: Send topic notification
app.post("/send-topic-notification", async (req, res) => {
  const { topic, title, body, data } = req.body;

  if (!topic || !title || !body) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const message = {
    notification: { title, body },
    data: {
      ...data,
      click_action: "FLUTTER_NOTIFICATION_CLICK",
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

// Root endpoint for test
app.get("/", (req, res) => {
  res.send("🚀 FCM Server is up!");
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});  