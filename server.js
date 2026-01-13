require("dotenv").config();
const express = require("express");
const cors = require("cors");

const {
  RtcTokenBuilder,
  RtcRole,
  ChatTokenBuilder
} = require("agora-access-token");

const app = express();
app.use(cors());
app.use(express.json());

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

if (!APP_ID || !APP_CERTIFICATE) {
  console.error("Missing AGORA_APP_ID or AGORA_APP_CERTIFICATE");
  process.exit(1);
}

/**
 * ===============================
 * RTC TOKEN (غرف صوتية / فيديو)
 * ===============================
 * GET /api/agora/rtc-token
 * params:
 *  - channel (required)
 *  - uid (number, optional, default 0)
 *  - role (publisher | subscriber)
 *  - expire (seconds, default 3600)
 */
app.get("/api/agora/rtc-token", (req, res) => {
  const channelName = req.query.channel;
  const uid = parseInt(req.query.uid || "0", 10);
  const expire = parseInt(req.query.expire || "3600", 10);

  const role =
    req.query.role === "subscriber"
      ? RtcRole.SUBSCRIBER
      : RtcRole.PUBLISHER;

  if (!channelName) {
    return res.status(400).json({ error: "channel is required" });
  }

  const now = Math.floor(Date.now() / 1000);
  const privilegeExpireTs = now + expire;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpireTs
  );

  return res.json({ token });
});

/**
 * ===============================
 * CHAT TOKEN (Agora Chat)
 * ===============================
 * GET /api/agora/chat-token
 * params:
 *  - userId (required)
 *  - expire (seconds, default 3600)
 */
app.get("/api/agora/chat-token", (req, res) => {
  const userId = req.query.userId;
  const expire = parseInt(req.query.expire || "3600", 10);

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const now = Math.floor(Date.now() / 1000);
  const privilegeExpireTs = now + expire;

  const token = ChatTokenBuilder.buildUserToken(
    APP_ID,
    APP_CERTIFICATE,
    userId,
    privilegeExpireTs
  );

  return res.json({ token });
});

// اختبار سريع
app.get("/", (req, res) => {
  res.send("Agora Token Server is running ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
