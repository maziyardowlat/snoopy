const form = document.querySelector("#chatForm");
const input = document.querySelector("#messageInput");
const messagesEl = document.querySelector("#messages");
const sendButton = document.querySelector("#sendButton");
const clearButton = document.querySelector("#clearChat");

const STORAGE_KEY = "waliya-cozy-chat";

let messages = loadMessages();

if (messages.length === 0) {
  messages = [
    {
      role: "assistant",
      content: "hey Waliya, how was your day?"
    }
  ];
}

renderMessages();
resizeInput();
input.focus();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) return;

  addMessage("user", text);
  input.value = "";
  resizeInput();

  const thinking = addMessage("assistant", "...");
  setLoading(true);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        messages: getApiMessages(thinking)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "The chat could not answer right now.");
    }

    thinking.content = data.reply || "I am here with you.";
    saveMessages();
    renderMessages();
  } catch (error) {
    thinking.content = error.message;
    saveMessages();
    renderMessages();
  } finally {
    setLoading(false);
  }
});

input.addEventListener("input", resizeInput);

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

clearButton.addEventListener("click", () => {
  messages = [
    {
      role: "assistant",
      content: "hey Waliya, how was your day?"
    }
  ];
  saveMessages();
  renderMessages();
  input.focus();
});

function addMessage(role, content) {
  const message = { role, content };
  messages.push(message);
  saveMessages();
  renderMessages();
  return message;
}

function renderMessages() {
  messagesEl.innerHTML = "";

  for (const message of messages) {
    const wrapper = document.createElement("article");
    wrapper.className = `message ${message.role}`;

    const name = document.createElement("strong");
    name.textContent = message.role === "user" ? "Waliya" : "Little corner";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = message.content;

    wrapper.append(name, bubble);
    messagesEl.append(wrapper);
  }

  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function resizeInput() {
  input.style.height = "auto";
  input.style.height = `${input.scrollHeight}px`;
}

function setLoading(isLoading) {
  sendButton.disabled = isLoading;
  sendButton.textContent = isLoading ? "..." : "Send";
}

function getApiMessages(pendingMessage) {
  return messages.filter((message, index) => {
    const isPending = message === pendingMessage;
    const isOpeningGreeting =
      index === 0 && message.role === "assistant" && message.content === "hey Waliya, how was your day?";

    return !isPending && !isOpeningGreeting;
  });
}

function loadMessages() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveMessages() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-24)));
}
