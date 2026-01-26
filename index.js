const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static("public"));

// === CONFIG ===
const CONFIG = {
  AI_BASE_URL: "https://buildors.com/api/chat-text-bot",
  AI_TEXT_MODEL: "2",
  COMP: "15",
  API_KEY: "buildor_555210", // your actual API key
  SESSION_KEY: "222234"
};

app.get("/", (req, res) => {
  res.render("index.ejs");
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const sessionKey = req.body.session_key || CONFIG.SESSION_KEY;

    if (!userMessage || !userMessage.trim()) {
      return res.status(400).json({ reply: "Please enter a message." });
    }

    console.log("🚀 Sending message to Buildors API:", userMessage);

    // Use GET request with query parameters
    const url = `${CONFIG.AI_BASE_URL}?ai_text_model=${CONFIG.AI_TEXT_MODEL}&comp=${CONFIG.COMP}&query=${encodeURIComponent(userMessage)}&session_key=${sessionKey}&api_key=${CONFIG.API_KEY}`;

    const apiResponse = await axios.get(url);

    // Buildors returns: { response: "..." } or { result: "..." }
    const data = apiResponse.data;

    let aiReply =
      data.response ||
      data.result ||
      data.reply ||
      data.message ||
      data.text ||
      data.data?.text;

    if (!aiReply) {
      // fallback if API response format is unexpected
      aiReply = "I got your message, but the AI service returned an unexpected format.";
      console.warn("⚠️ API response unexpected:", data);
    }

    res.json({
      reply: aiReply.toString().trim(),
      session_key: sessionKey,
      success: true
    });

  } catch (error) {
    console.error("❌ Buildors API error:", error.message, error.response?.data);

    res.status(500).json({
      reply: "Sorry, AI service error. Please check your API key or try again.",
      error: error.message,
      api_response: error.response?.data || null
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
