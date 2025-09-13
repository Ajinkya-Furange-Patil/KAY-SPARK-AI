// server.js

// 1. Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Serve static assets
app.use(express.static(path.join(__dirname, "public")));

// 4. Routes

// Landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Chat interface
app.get("/chat.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chat.html"));
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "KAY SPARK API",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Chat API using Hugging Face
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, maxTokens = 800, temperature = 0.7, mode } = req.body;
    const API_KEY = process.env.HUGGINGFACE_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: "Missing HUGGINGFACE_API_KEY" });
    }

    const API_MODEL = "openai/gpt-oss-120b";
    const hfResponse = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: API_MODEL,
          messages,
          max_tokens: maxTokens,
          temperature,
          stream: false,
        }),
      }
    );

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      throw new Error(`HF API error ${hfResponse.status}: ${errorText}`);
    }

    const data = await hfResponse.json();
    const generated = data.choices?.[0]?.message?.content;
    if (!generated) {
      throw new Error("No content in HF response");
    }

    res.json({
      response: generated,
      model: API_MODEL,
      timestamp: new Date().toISOString(),
      mode: mode || "education",
    });
  } catch (err) {
    console.error("Chat API error:", err);
    res
      .status(500)
      .json({ error: "Failed to generate response", message: err.message });
  }
});

// 5. Catch-all 404
app.use((req, res) => {
  res.status(404).json({
    error: "Page not found",
    message: "The requested resource does not exist",
    service: "KAY SPARK",
  });
});

// 6. Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: "Something went wrong on our end",
    service: "KAY SPARK",
  });
});

// 7. Start server
app.listen(PORT, () => {
  console.log(`🚀 KAY SPARK server running at http://localhost:${PORT}`);
  console.log(
    "📚 Educational AI Assistant ready to help with skill gap analysis"
  );
});
