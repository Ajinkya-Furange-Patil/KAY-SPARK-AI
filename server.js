const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Root route to serve the landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route to serve the chat interface
app.get("/chat.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chat.html"));
});

// API endpoint for chat, using the Hugging Face model
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, maxTokens = 800, temperature = 0.7, mode } = req.body;
    const API_KEY = process.env.HUGGINGFACE_API_KEY;
    const API_MODEL = "openai/gpt-oss-20b:hyperbolic";

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: API_MODEL,
          messages: messages,
          max_tokens: maxTokens,
          temperature: temperature,
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Hugging Face API error: ${response.status} - ${errorData}`
      );
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      throw new Error("Invalid API response format or no text generated.");
    }

    res.json({
      response: generatedText,
      model: API_MODEL,
      timestamp: new Date().toISOString(),
      mode: mode || "education",
    });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      error: "Failed to generate response",
      message: error.message,
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "KAY SPARK API",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Helper function for system prompts
function getSystemPrompt(mode) {
  const basePrompt =
    "You are KAY SPARK, a helpful and knowledgeable assistant.";
  const tableInstruction =
    " When requested or when tabular format would be helpful, format your response using HTML tables with proper styling. Use tables for comparisons, schedules, lists, data organization, or any structured information.";

  const modePrompts = {
    education: `${basePrompt} You specialize in skill gap analysis, career development, and educational guidance. 

Your capabilities include:
- Skill Gap Analysis: Identify missing skills based on career goals and current abilities
- Course Recommendations: Suggest relevant online courses, certifications, and learning paths from platforms like Coursera, Udemy, Skill India Digital
- Career Roadmaps: Create personalized career development plans
- Resume Analysis: Provide feedback on resume effectiveness and improvements
- Market Insights: Share information about trending skills and job market demands

Format your responses with clear headings, bullet points, and highlight key terms. Use educational emojis and provide structured, actionable advice. Always be encouraging, practical, and focused on helping users advance their careers through targeted skill development.${tableInstruction}`,
  };

  return modePrompts[mode] || basePrompt;
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Page not found",
    message: "The requested resource does not exist",
    service: "KAY SPARK",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: "Something went wrong on our end",
    service: "KAY SPARK",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 KAY SPARK server running at http://localhost:${PORT}`);
  console.log(
    `📚 Educational AI Assistant ready to help with skill gap analysis`
  );
  console.log(`🔗 Access the application at: http://localhost:${PORT}`);
});
