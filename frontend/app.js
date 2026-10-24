```javascript
"use strict";

// ============================================
// HallHelper AI — Chat Interface
// ============================================

const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const chatMessages = document.querySelector("#chat-messages");
const sendButton = document.querySelector("#send-btn");

const history = [];

let isSending = false;
let lastUserMessage = "";

// ============================================
// Utility Functions
// ============================================

function scrollToBottom() {
  chatMessages.scrollTo({
    top: chatMessages.scrollHeight,
    behavior: "smooth"
  });
}

function setButtonLoading(loading) {
  if (!sendButton || !chatInput) return;

  sendButton.disabled = loading;
  chatInput.disabled = loading;

  if (loading) {
    sendButton.textContent = "Thinking...";
    sendButton.setAttribute("aria-label", "Waiting for AI response");
  } else {
    sendButton.innerHTML = 'Send <span>➤</span>';
    sendButton.setAttribute("aria-label", "Send message");
  }
}

function createButton(label, className, onClick) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = className;
  button.textContent = label;

  button.addEventListener("click", onClick);

  return button;
}

// ============================================
// Copy Answer
// ============================================

async function copyText(text, button) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");

      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";

      document.body.appendChild(textarea);
      textarea.select();

      const copied = document.execCommand("copy");
      textarea.remove();

      if (!copied) {
        throw new Error("Copy failed");
      }
    }

    const originalText = button.textContent;

    button.textContent = "✓ Copied!";

    setTimeout(() => {
      button.textContent = originalText;
    }, 1500);

  } catch (error) {
    console.error("Copy error:", error);
    button.textContent = "Copy failed";

    setTimeout(() => {
      button.textContent = "📋 Copy";
    }, 1500);
  }
}

// ============================================
// Message Action Buttons
// ============================================

function addMessageActions(row, bubble, userMessage = "") {
  const oldActions = row.querySelector(".message-actions");

  if (oldActions) {
    oldActions.remove();
  }

  const actions = document.createElement("div");
  actions.className = "message-actions";

  const copyButton = createButton(
    "📋 Copy",
    "message-action-btn",
    () => copyText(bubble.textContent, copyButton)
  );

  const shareButton = createButton(
    "📤 Share",
    "message-action-btn",
    async () => {
      const text = bubble.textContent;

      if (navigator.share) {
        try {
          await navigator.share({
            title: "HallHelper AI Answer",
            text: text
          });
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error("Share error:", error);
            await copyText(text, shareButton);
          }
        }
      } else {
        await copyText(text, shareButton);
      }
    }
  );

  actions.append(copyButton, shareButton);

  if (userMessage) {
    const regenerateButton = createButton(
      "🔄 Regenerate",
      "message-action-btn",
      () => regenerateAnswer(userMessage, row, bubble)
    );

    actions.appendChild(regenerateButton);
  }

  row.appendChild(actions);
}

// ============================================
// Add Chat Message
// ============================================

function addMessage(text, role, extraClass = "") {
  const row = document.createElement("div");

  row.className =
    "message " +
    (role === "user" ? "user-message" : "bot-message");

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = role === "user" ? "✿" : "♡";
  avatar.setAttribute("aria-hidden", "true");

  const bubble = document.createElement("div");
  bubble.className = `bubble ${extraClass}`.trim();
  bubble.textContent = text;

  row.append(avatar, bubble);
  chatMessages.appendChild(row);

  scrollToBottom();

  return {
    row,
    bubble
  };
}

// ============================================
// Request AI Backend
// ============================================

async function requestAI(message, conversationHistory) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 90000);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        message: message,
        history: conversationHistory
      }),

      signal: controller.signal
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error(
        "The server returned an invalid response. Please try again."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.error || `Request failed (${response.status}).`
      );
    }

    if (
      !data ||
      typeof data.reply !== "string" ||
      !data.reply.trim()
    ) {
      throw new Error(
        "The AI returned an empty answer. Please try again."
      );
    }

    return data.reply.trim();

  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "The AI took too long to respond. Please try again."
      );
    }

    if (error instanceof TypeError) {
      throw new Error(
        "Cannot connect to HallHelper. Check the server and try again."
      );
    }

    throw error;

  } finally {
    clearTimeout(timeout);
  }
}

// ============================================
// Update Conversation History
// ============================================

function saveConversation(message, reply) {
  history.push(
    {
      role: "user",
      content: message
    },
    {
      role: "assistant",
      content: reply
    }
  );

  // Keep the last 12 messages.
  if (history.length > 12) {
    history.splice(0, history.length - 12);
  }
}

// ============================================
// Send Message
// ============================================

async function sendMessage(message) {
  const cleanMessage = message.trim();

  if (!cleanMessage || isSending) {
    return;
  }

  isSending = true;
  lastUserMessage = cleanMessage;

  addMessage(cleanMessage, "user");

  chatInput.value = "";
  setButtonLoading(true);

  const loadingMessage = addMessage(
    "Thinking of a helpful answer... 🌸",
    "assistant",
    "typing"
  );

  try {
    const reply = await requestAI(cleanMessage, history);

    loadingMessage.bubble.textContent = reply;
    loadingMessage.bubble.classList.remove("typing");

    addMessageActions(
      loadingMessage.row,
      loadingMessage.bubble,
      cleanMessage
    );

    saveConversation(cleanMessage, reply);

  } catch (error) {
    console.error("HallHelper AI error:", error);

    loadingMessage.bubble.classList.remove("typing");
    loadingMessage.bubble.textContent =
      `🌸 ${error.message || "Something went wrong. Please try again."}`;

  } finally {
    isSending = false;

    setButtonLoading(false);
    chatInput.focus();
    scrollToBottom();
  }
}

// ============================================
// Regenerate Answer
// ============================================

async function regenerateAnswer(message, oldRow, oldBubble) {
  if (isSending || !message || !oldRow || !oldBubble) {
    return;
  }

  isSending = true;
  setButtonLoading(true);

  // Disable existing action buttons while generating.
  const oldActions = oldRow.querySelector(".message-actions");

  if (oldActions) {
    oldActions.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
    });
  }

  // Show loading in the same answer bubble.
  const previousText = oldBubble.textContent;

  oldBubble.textContent = "Generating another answer... 🌸";
  oldBubble.classList.add("typing");

  try {
    // Exclude the last question-answer pair from the context.
    const previousHistory = history.slice(0, -2);

    const reply = await requestAI(message, previousHistory);

    oldBubble.textContent = reply;
    oldBubble.classList.remove("typing");

    // Replace old action buttons with fresh ones.
    addMessageActions(oldRow, oldBubble, message);

    // Update the previous answer in conversation history.
    if (
      history.length >= 2 &&
      history[history.length - 2].role === "user" &&
      history[history.length - 2].content === message &&
      history[history.length - 1].role === "assistant"
    ) {
      history[history.length - 1].content = reply;
    }

  } catch (error) {
    console.error("HallHelper regenerate error:", error);

    // Restore the previous answer if regeneration fails.
    oldBubble.textContent = previousText;
    oldBubble.classList.remove("typing");

    if (oldActions) {
      oldActions.querySelectorAll("button").forEach((button) => {
        button.disabled = false;
      });
    }

    const errorMessage = document.createElement("div");
    errorMessage.className = "regenerate-error";
    errorMessage.textContent =
      error.message || "Could not generate another answer.";

    oldRow.appendChild(errorMessage);

    setTimeout(() => {
      errorMessage.remove();
    }, 4000);

  } finally {
    isSending = false;

    setButtonLoading(false);
    chatInput.focus();
    scrollToBottom();
  }
}

// ============================================
// Form Submission
// ============================================

if (chatForm && chatInput && chatMessages && sendButton) {
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(chatInput.value);
  });
} else {
  console.error(
    "HallHelper: Chat elements were not found. Check your HTML IDs."
  );
}

// ============================================
// Suggested Prompts
// ============================================

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    const prompt = button.dataset.prompt;
    const chatSection = document.querySelector("#chat-section");

    chatSection?.scrollIntoView({
      behavior: "smooth"
    });

    setTimeout(() => {
      if (!chatInput || !prompt) return;

      chatInput.value = prompt;
      chatInput.focus();
    }, 250);
  });
});

// ============================================
// Start Chat Button
// ============================================

document.querySelector("#start-chat")?.addEventListener("click", () => {
  document.querySelector("#chat-section")?.scrollIntoView({
    behavior: "smooth"
  });

  setTimeout(() => {
    chatInput?.focus();
  }, 350);
});

// ============================================
// Navigation and Scroll
// ============================================

document.querySelectorAll("[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.scroll;

    const target =
      targetId === "top"
        ? document.querySelector("#top")
        : document.getElementById(targetId);

    target?.scrollIntoView({
      behavior: "smooth"
    });
  });
});
```
