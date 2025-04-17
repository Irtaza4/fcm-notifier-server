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

app.post("/send-topic-notification", async (req, res) => {
  const { topic, title, body, data } = req.body;

  if (!topic || !title || !body) {
    return res.status(400).json({ error: "Missing topic, title or body" });
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
    console.log("✅ Successfully sent message:", response);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("🚀 Server is alive");
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
