// Global variables
let chatMessages = document.getElementById("chatMessages");
let chatInput = document.getElementById("chatInput");
let sendBtn = document.getElementById("sendBtn");
let typingIndicator = document.getElementById("typingIndicator");
let sidebar = document.getElementById("sidebar");
let sidebarOverlay = document.getElementById("sidebarOverlay");
let chatContainer = document.getElementById("chatContainer");
let maximizeIcon = document.getElementById("maximizeIcon");
let isFullscreen = false;
let currentChatId = 1;
let chatCounter = 1;
let currentRenameChatId = null;
let uploadedFiles = new Map(); // Store uploaded files

// Chat data storage
let chats = {
  1: {
    id: 1,
    title: "Welcome Chat",
    messages: [],
    files: [],
  },
};

// Auto-resize textarea
chatInput.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = Math.min(this.scrollHeight, 100) + "px";
});

// Send message on Enter (but not Shift+Enter)
chatInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Send button click
sendBtn.addEventListener("click", sendMessage);

// Sidebar functions
function toggleSidebar() {
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    sidebar.classList.toggle("sidebar-open");
    sidebarOverlay.classList.toggle("show");
  } else {
    sidebar.classList.toggle("sidebar-hidden");
  }
}

// Close sidebar when clicking overlay
sidebarOverlay.addEventListener("click", function () {
  sidebar.classList.remove("sidebar-open");
  sidebarOverlay.classList.remove("show");
});

// Fullscreen toggle
function toggleFullscreen() {
  isFullscreen = !isFullscreen;

  if (isFullscreen) {
    chatContainer.classList.add("fullscreen");
    maximizeIcon.className = "fas fa-compress";
  } else {
    chatContainer.classList.remove("fullscreen");
    maximizeIcon.className = "fas fa-expand";
  }
}

// Chat management functions
function createNewChat() {
  chatCounter++;
  const newChatId = chatCounter;
  const newChatTitle = `New Chat ${newChatId}`;

  chats[newChatId] = {
    id: newChatId,
    title: newChatTitle,
    messages: [],
    files: [],
  };

  addChatToHistory(newChatId, newChatTitle);
  switchToChat(newChatId);

  // Close sidebar on mobile after creating new chat
  if (window.innerWidth <= 768) {
    sidebar.classList.remove("sidebar-open");
    sidebarOverlay.classList.remove("show");
  }
}

function addChatToHistory(chatId, title) {
  const chatHistory = document.getElementById("chatHistory");
  const chatItem = document.createElement("div");
  chatItem.className = "chat-item";
  chatItem.setAttribute("data-chat-id", chatId);
  chatItem.onclick = () => switchToChat(chatId);

  chatItem.innerHTML = `
                <i class="fas fa-comments"></i>
                <span class="chat-title">${title}</span>
                <div class="chat-actions">
                    <button class="chat-action-btn" onclick="event.stopPropagation(); renameChat(${chatId})" title="Rename">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="chat-action-btn" onclick="event.stopPropagation(); deleteChat(${chatId})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

  chatHistory.appendChild(chatItem);
}

function switchToChat(chatId) {
  // Update active chat in sidebar
  document.querySelectorAll(".chat-item").forEach((item) => {
    item.classList.remove("active");
  });

  const chatItem = document.querySelector(`[data-chat-id="${chatId}"]`);
  if (chatItem) {
    chatItem.classList.add("active");
  }

  currentChatId = chatId;
  loadChatMessages(chatId);
}

function loadChatMessages(chatId) {
  const chat = chats[chatId];
  if (!chat) return;

  // Clear current messages
  chatMessages.innerHTML = "";

  // Add welcome content for new chats or show upload section
  if (chat.messages.length === 0) {
    if (chatId === 1) {
      // Show original welcome for first chat
      showWelcomeContent();
    } else {
      // Show upload section for new chats
      showNewChatContent();
    }
  } else {
    // Load saved messages
    chat.messages.forEach((msg) => {
      addMessage(msg.content, msg.sender, false);
    });
  }

  // Always add typing indicator at the end
  const typingDiv = document.createElement("div");
  typingDiv.className = "typing-indicator";
  typingDiv.id = "typingIndicator";
  typingDiv.innerHTML = `
                <div class="typing-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            `;
  chatMessages.appendChild(typingDiv);

  // Update global reference
  typingIndicator = typingDiv;
}

function showWelcomeContent() {
  const welcomeHTML = `
                <div class="welcome-section">
                    <h2>Welcome to KAY SPARK! 🎯</h2>
                    <p>Your intelligent assistant for skill gap analysis and career development. I'm here to help you identify skills gaps, recommend courses, and create personalized career roadmaps.</p>
                </div>

                <div class="capabilities-grid">
                    <div class="capability-card">
                        <div class="capability-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <h4>Skill Gap Analysis</h4>
                        <p>Identify missing skills for your target career based on trending job postings and market demand</p>
                    </div>
                    <div class="capability-card">
                        <div class="capability-icon">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <h4>Course Recommendations</h4>
                        <p>Get personalized learning path suggestions from Coursera, Udemy, and Skill India Digital</p>
                    </div>
                    <div class="capability-card">
                        <div class="capability-icon">
                            <i class="fas fa-route"></i>
                        </div>
                        <h4>Career Roadmaps</h4>
                        <p>Interactive career planning with step-by-step guidance and milestone tracking</p>
                    </div>
                    <div class="capability-card">
                        <div class="capability-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <h4>Resume Analysis</h4>
                        <p>Get detailed feedback on your resume effectiveness with improvement suggestions</p>
                    </div>
                </div>

                <div class="quick-questions">
                    <h3>✨ Quick Start Questions</h3>
                    <div class="question-chips">
                        <div class="question-chip" onclick="sendQuickQuestion('What skills do I need for data science career?')">
                            🔬 Data Science Skills
                        </div>
                        <div class="question-chip" onclick="sendQuickQuestion('Create a learning roadmap for web development')">
                            🌐 Web Development Path
                        </div>
                        <div class="question-chip" onclick="sendQuickQuestion('Analyze my resume for software engineer role')">
                            📄 Resume Analysis
                        </div>
                        <div class="question-chip" onclick="sendQuickQuestion('What are the trending tech skills in 2025?')">
                            🚀 Trending Skills
                        </div>
                        <div class="question-chip" onclick="sendQuickQuestion('How to transition from marketing to tech?')">
                            🔄 Career Transition
                        </div>
                        <div class="question-chip" onclick="sendQuickQuestion('Best certification courses for cloud computing')">
                            ☁️ Cloud Certifications
                        </div>
                    </div>
                </div>
            `;

  chatMessages.innerHTML = welcomeHTML;
}

function showNewChatContent() {
  const newChatHTML = `
                <div class="welcome-section">
                    <h2>New Chat Started! 🚀</h2>
                    <p>Ready to help you with your career development journey. Upload documents for analysis or ask me anything!</p>
                </div>

                <div class="upload-section">
                    <div class="upload-icon">
                        <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <div class="upload-title">Upload Documents for Analysis</div>
                    <div class="upload-description">
                        Upload your resume, job descriptions, or any career-related documents for personalized analysis and recommendations.
                    </div>
                    <div id="uploadedFilesList"></div>
                    <div>
                        <button class="upload-btn" onclick="triggerFileUpload()">
                            <i class="fas fa-plus"></i> Choose Files
                        </button>
                        <button class="skip-btn" onclick="skipUpload()">Skip for Now</button>
                    </div>
                </div>

                <div class="capabilities-grid">
                    <div class="capability-card">
                        <div class="capability-icon">
                            <i class="fas fa-file-pdf"></i>
                        </div>
                        <h4>Resume Analysis</h4>
                        <p>Upload your resume for detailed feedback, ATS optimization, and improvement suggestions</p>
                    </div>
                    <div class="capability-card">
                        <div class="capability-icon">
                            <i class="fas fa-briefcase"></i>
                        </div>
                        <h4>Job Description Match</h4>
                        <p>Compare your profile with job requirements and identify skill gaps to address</p>
                    </div>
                    <div class="capability-card">
                        <div class="capability-icon">
                            <i class="fas fa-chart-bar"></i>
                        </div>
                        <h4>Portfolio Review</h4>
                        <p>Get feedback on your portfolio projects and suggestions for improvement</p>
                    </div>
                    <div class="capability-card">
                        <div class="capability-icon">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <h4>Learning Path</h4>
                        <p>Receive customized course recommendations based on your uploaded documents</p>
                    </div>
                </div>
            `;

  chatMessages.innerHTML = newChatHTML;
}

function renameChat(chatId) {
  currentRenameChatId = chatId;
  const chat = chats[chatId];
  const renameInput = document.getElementById("renameInput");

  renameInput.value = chat.title;
  document.getElementById("renameModal").style.display = "flex";
  renameInput.focus();
}

function closeRenameModal() {
  document.getElementById("renameModal").style.display = "none";
  currentRenameChatId = null;
}

function confirmRename() {
  const newTitle = document.getElementById("renameInput").value.trim();
  if (!newTitle || !currentRenameChatId) return;

  chats[currentRenameChatId].title = newTitle;

  const chatItem = document.querySelector(
    `[data-chat-id="${currentRenameChatId}"] .chat-title`
  );
  if (chatItem) {
    chatItem.textContent = newTitle;
  }

  closeRenameModal();
}

function deleteChat(chatId) {
  if (Object.keys(chats).length <= 1) {
    alert("Cannot delete the last chat!");
    return;
  }

  if (confirm("Are you sure you want to delete this chat?")) {
    delete chats[chatId];

    const chatItem = document.querySelector(`[data-chat-id="${chatId}"]`);
    if (chatItem) {
      chatItem.remove();
    }

    // If deleted chat was current, switch to first available chat
    if (currentChatId === chatId) {
      const firstChatId = parseInt(Object.keys(chats)[0]);
      switchToChat(firstChatId);
    }
  }
}

function sendQuickQuestion(question) {
  chatInput.value = question;
  sendMessage();
}

// File upload functions
function triggerFileUpload() {
  document.getElementById("documentUpload").click();
}

function handleFileUpload(event) {
  const files = event.target.files;
  const chat = chats[currentChatId];

  for (let file of files) {
    // Store file reference
    chat.files.push({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    });

    // Create upload indicator
    showFileUploadIndicator(file);
  }

  // Process files for analysis
  if (files.length > 0) {
    analyzeUploadedFiles(files);
  }
}

function showFileUploadIndicator(file) {
  const uploadedFilesList = document.getElementById("uploadedFilesList");
  if (uploadedFilesList) {
    const fileDiv = document.createElement("div");
    fileDiv.className = "uploaded-file";
    fileDiv.innerHTML = `
                    <i class="fas fa-file-alt"></i>
                    ${file.name} (${formatFileSize(file.size)})
                    <button class="remove-file" onclick="removeFile('${
                      file.name
                    }')">
                        <i class="fas fa-times"></i>
                    </button>
                `;
    uploadedFilesList.appendChild(fileDiv);
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function removeFile(fileName) {
  const chat = chats[currentChatId];
  chat.files = chat.files.filter((file) => file.name !== fileName);

  // Remove from UI
  const uploadedFilesList = document.getElementById("uploadedFilesList");
  if (uploadedFilesList) {
    const fileElements = uploadedFilesList.querySelectorAll(".uploaded-file");
    fileElements.forEach((element) => {
      if (element.textContent.includes(fileName)) {
        element.remove();
      }
    });
  }
}

function analyzeUploadedFiles(files) {
  // Simulate file analysis
  const fileAnalysis = Array.from(files)
    .map((file) => {
      return `📄 **${file.name}** (${formatFileSize(file.size)})`;
    })
    .join("\n");

  const analysisMessage = `I've received your files:\n\n${fileAnalysis}\n\nI'm ready to analyze these documents! I can help you with:\n\n• **Resume Review** - ATS optimization and improvement suggestions\n• **Skill Gap Analysis** - Compare your skills with job requirements\n• **Career Recommendations** - Personalized learning paths\n• **Portfolio Feedback** - Suggestions for project improvements\n\nWhat would you like me to focus on first?`;

  // Add the analysis message
  setTimeout(() => {
    addMessage(analysisMessage, "ai", true);
  }, 1000);
}

function skipUpload() {
  // Remove upload section and show normal chat interface
  const uploadSection = document.querySelector(".upload-section");
  if (uploadSection) {
    uploadSection.style.display = "none";
  }

  addMessage(
    "I'm ready to help you with your career development! Feel free to ask me about skills, courses, career paths, or anything else related to your professional growth.",
    "ai",
    true
  );
}

async function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  // Add user message
  addMessage(message, "user", true);
  chatInput.value = "";
  chatInput.style.height = "auto";

  // Show typing indicator
  showTyping();

  // Disable send button
  sendBtn.disabled = true;

  try {
    const chat = chats[currentChatId];
    const contextMessage =
      chat.files.length > 0
        ? `Context: I have uploaded ${
            chat.files.length
          } document(s): ${chat.files
            .map((f) => f.name)
            .join(", ")}. User question: ${message}`
        : message;

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are KAY SPARK, a highly skilled educational AI assistant specializing in skill gap analysis and career development. 

Your core expertise includes:

🎯 SKILL GAP ANALYSIS:
- Identify missing skills based on career goals and current abilities
- Compare skills against job market requirements
- Provide gap analysis reports with actionable insights
- Analyze trending job postings and skill demands

📚 COURSE RECOMMENDATIONS:
- Suggest relevant online courses from platforms like Coursera, Udemy, Skill India Digital, edX, Pluralsight
- Recommend certifications aligned with career goals
- Create structured learning paths with timelines
- Provide budget-friendly alternatives and free resources

🗺️ CAREER ROADMAPS:
- Design step-by-step career progression plans
- Set realistic milestones and timelines
- Identify transitional skills for career changes
- Map skills to specific job roles and industries

📄 RESUME & DOCUMENT ANALYSIS:
- Analyze resume effectiveness for specific roles
- Suggest improvements in content, format, and keywords
- Recommend skills highlighting strategies
- Guide LinkedIn profile optimization
- Review portfolios and project documentation

🔍 MARKET INSIGHTS:
- Share current job market trends
- Provide salary insights and growth projections
- Identify emerging skills and technologies
- Compare different career paths

Format your responses with:
- Clear headings and bullet points
- Practical, actionable advice
- Specific course/certification recommendations with links when possible
- Step-by-step guidance
- Motivational and encouraging tone
- Use relevant emojis to enhance readability
- When presenting tabular data, use Markdown table format with proper | separators

Always be thorough, practical, and focused on helping users advance their careers through strategic skill development.`,
          },
          {
            role: "user",
            content: contextMessage,
          },
        ],
        maxTokens: 1000,
        temperature: 0.7,
        mode: "education",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Hide typing indicator
    hideTyping();

    // Add AI response
    addMessage(data.response, "ai", true);
  } catch (error) {
    console.error("Error:", error);
    hideTyping();
    addMessage(
      "I apologize, but I'm having trouble connecting right now. Please check your internet connection and try again in a moment. 🔄",
      "ai",
      true
    );
  } finally {
    // Re-enable send button
    sendBtn.disabled = false;
  }
}

function addMessage(content, sender, saveToChat = true) {
  // Remove welcome content when first message is sent
  if (sender === "user") {
    const welcomeSection = document.querySelector(".welcome-section");
    const uploadSection = document.querySelector(".upload-section");
    const capabilitiesGrid = document.querySelector(".capabilities-grid");
    const quickQuestions = document.querySelector(".quick-questions");

    if (welcomeSection) welcomeSection.remove();
    if (uploadSection) uploadSection.remove();
    if (capabilitiesGrid) capabilitiesGrid.remove();
    if (quickQuestions) quickQuestions.remove();
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}`;

  const messageContent = document.createElement("div");
  messageContent.className = "message-content";

  // Format the content (convert markdown-like formatting)
  const formattedContent = formatMessage(content);
  messageContent.innerHTML = formattedContent;

  messageDiv.appendChild(messageContent);

  // Find typing indicator and insert before it
  const currentTypingIndicator = document.getElementById("typingIndicator");
  if (
    currentTypingIndicator &&
    currentTypingIndicator.parentNode === chatMessages
  ) {
    chatMessages.insertBefore(messageDiv, currentTypingIndicator);
  } else {
    // If typing indicator not found, append to end
    chatMessages.appendChild(messageDiv);
  }

  // Save to chat history
  if (saveToChat) {
    chats[currentChatId].messages.push({
      content: content,
      sender: sender,
      timestamp: new Date(),
    });

    // Update chat title based on first user message
    if (
      sender === "user" &&
      chats[currentChatId].messages.filter((m) => m.sender === "user")
        .length === 1
    ) {
      const newTitle =
        content.substring(0, 30) + (content.length > 30 ? "..." : "");
      chats[currentChatId].title = newTitle;

      const chatItem = document.querySelector(
        `[data-chat-id="${currentChatId}"] .chat-title`
      );
      if (chatItem) {
        chatItem.textContent = newTitle;
      }
    }
  }

  // Scroll to bottom smoothly
  chatMessages.scrollTo({
    top: chatMessages.scrollHeight,
    behavior: "smooth",
  });
}

function formatMessage(content) {
  // Convert "## Heading" to <h2>
  content = content.replace(
    /^##\s(.+)$/gm,
    '<h2 style="color:#667eea; font-size:1rem; margin:1rem 0;">$1</h2>'
  );

  // Convert "> quote" to <blockquote>
  content = content.replace(
    /^>\s(.+)$/gm,
    '<blockquote style="border-left:3px solid #667eea; margin:0.8rem 0; padding-left:1rem; color:#4a5568;">$1</blockquote>'
  );

  // Convert markdown tables first
  content = convertMarkdownTables(content);

  // Apply other formatting
  return content
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(
      /`([^`]+)`/g,
      '<code style="background:rgba(102,126,234,0.1);padding:2px 4px;border-radius:3px;font-family:monospace;font-size:0.75rem;">$1</code>'
    )
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/^(.+)$/g, "<p>$1</p>")
    .replace(/- ([^\n]+)/g, "• $1")
    .replace(/(\d+)\.\s([^\n]+)/g, "<strong>$1.</strong> $2")
    .replace(/(#{1,6})\s*([^\n]+)/g, (m, hashes, text) => {
      const level = hashes.length;
      const color = level === 1 ? "#667eea" : "#64748b";
      const fontSize = level === 1 ? "0.95rem" : "0.85rem";
      return `<h${level} style="color:${color};margin:0.8rem 0 0.4rem 0;font-weight:600;font-size:${fontSize};">${text}</h${level}>`;
    });
}

function convertMarkdownTables(content) {
  const lines = content.split("\n");
  let result = [];
  let inTable = false;
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.includes("|") && !line.startsWith(">")) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }

      if (!/^[\|\-\s:]+$/.test(line)) {
        tableRows.push(line);
      }
    } else {
      if (inTable) {
        if (tableRows.length > 0) {
          result.push(convertTableRowsToHTML(tableRows));
        }
        inTable = false;
        tableRows = [];
      }
      result.push(line);
    }
  }

  if (inTable && tableRows.length > 0) {
    result.push(convertTableRowsToHTML(tableRows));
  }

  return result.join("\n");
}

function convertTableRowsToHTML(rows) {
  if (rows.length === 0) return "";

  let html = "<div class='table-responsive'><table>";
  let isFirstRow = true;

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i]
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell !== "");

    if (cells.length === 0) continue;

    if (isFirstRow) {
      html += "<thead><tr>";
      for (const cell of cells) {
        html += `<th>${cell}</th>`;
      }
      html += "</tr></thead><tbody>";
      isFirstRow = false;
    } else {
      html += "<tr>";
      for (const cell of cells) {
        html += `<td>${cell}</td>`;
      }
      html += "</tr>";
    }
  }

  html += "</tbody></table></div>";
  return html;
}

function showTyping() {
  if (typingIndicator) {
    typingIndicator.style.display = "flex";
    chatMessages.scrollTo({
      top: chatMessages.scrollHeight,
      behavior: "smooth",
    });
  }
}

function hideTyping() {
  if (typingIndicator) {
    typingIndicator.style.display = "none";
  }
}

// Focus on input when page loads
window.addEventListener("load", () => {
  chatInput.focus();
});

// Handle window resize
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    sidebar.classList.remove("sidebar-open");
    sidebarOverlay.classList.remove("show");
  }
});

// Handle ESC key for modals and fullscreen
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    if (document.getElementById("renameModal").style.display === "flex") {
      closeRenameModal();
    } else if (isFullscreen) {
      toggleFullscreen();
    } else if (
      window.innerWidth <= 768 &&
      sidebar.classList.contains("sidebar-open")
    ) {
      sidebar.classList.remove("sidebar-open");
      sidebarOverlay.classList.remove("show");
    }
  }
});

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  // Auto-hide sidebar on mobile
  if (window.innerWidth <= 768) {
    sidebar.classList.add("sidebar-hidden");
  }

  // Initialize typing indicator reference
  typingIndicator = document.getElementById("typingIndicator");
});
