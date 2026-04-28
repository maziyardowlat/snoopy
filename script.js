const form = document.querySelector("#chatForm");
const input = document.querySelector("#messageInput");
const messagesEl = document.querySelector("#messages");
const sendButton = document.querySelector("#sendButton");
const clearButton = document.querySelector("#clearChat");
const badDayToggle = document.querySelector("#badDayToggle");
const badDayPanel = document.querySelector("#badDayPanel");
const badDayActions = document.querySelector(".bad-day-actions");
const safetyButton = document.querySelector("#safetyButton");
const careBubblesEl = document.querySelector("#careBubbles");
const careNoteEl = document.querySelector("#careNote");

const STORAGE_KEY = "waliya-cozy-chat";
const CARE_BUBBLE_INTERVAL_MS = 15000;
const CARE_BUBBLE_JITTER_MS = 2500;
const CARE_NOTES = [
  "You do not have to be bright to be loved.",
  "I love you on quiet days too.",
  "You are allowed to rest before everything is fixed.",
  "Tiny steps count. Even breathing counts.",
  "I am really glad you exist.",
  "You do not have to earn gentleness.",
  "Bad brain weather is still weather. It passes.",
  "Snoopy and I are on your side.",
  "You are not a burden to me.",
  "Come back to one small thing: water, blanket, breath.",
  "You are beautiful, even when you cannot feel it.",
  "You are still you on the hard days, and I still choose you.",
  "No performance needed here. Just be.",
  "Your softness is not a weakness.",
  "A hard hour does not get to decide your whole story.",
  "There is room for you exactly as you are."
];

let careNoteTimer;
let careBubbleInterval;

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
renderCareBubbles();
startCareBubbleTimer();
resizeInput();
input.focus();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) return;

  await sendChatMessage(text);
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

badDayToggle.addEventListener("click", () => {
  const shouldOpen = badDayPanel.hidden;
  badDayPanel.hidden = !shouldOpen;
  badDayToggle.setAttribute("aria-expanded", String(shouldOpen));

  if (shouldOpen) {
    showCareNote("Low tide mode is open. No pressure, just one small next thing.");
  }
});

badDayActions.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-prompt]");

  if (!button) return;

  await sendChatMessage(button.dataset.prompt);
});

safetyButton.addEventListener("click", () => {
  const safetyMessage =
    "If you might not be safe, please call or text 988 now if you are in the US or Canada. If danger is immediate, call emergency services. If you can, text Maz or someone trusted and move near another person.";

  addMessage("assistant", safetyMessage);
  showCareNote("One tiny brave thing: get another human near you right now.");
});

async function sendChatMessage(text) {
  if (sendButton.disabled) return;

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
}

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

function renderCareBubbles() {
  const notes = shuffle(CARE_NOTES).slice(0, 4);
  careBubblesEl.innerHTML = "";

  notes.forEach((note, index) => {
    const button = document.createElement("button");
    button.className = `care-bubble-button bubble-size-${index + 1}`;
    button.type = "button";
    button.dataset.note = note;
    button.setAttribute("aria-label", "Open a care bubble");

    const label = document.createElement("span");
    label.className = "visually-hidden";
    label.textContent = note;

    button.append(label);
    careBubblesEl.append(button);
  });
}

careBubblesEl.addEventListener("click", (event) => {
  const button = event.target.closest(".care-bubble-button");

  if (!button || button.disabled) return;

  popCareBubble(button);
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    window.clearInterval(careBubbleInterval);
    return;
  }

  startCareBubbleTimer();
});

function popCareBubble(button) {
  button.disabled = true;
  button.classList.add("popped");
  showCareNote(button.dataset.note);

  const remaining = careBubblesEl.querySelectorAll(".care-bubble-button:not(.popped)").length;

  if (remaining === 0) {
    window.setTimeout(renderCareBubbles, 900);
  }
}

function startCareBubbleTimer() {
  window.clearInterval(careBubbleInterval);
  careBubbleInterval = window.setInterval(popRandomCareBubble, getCareBubbleDelay());
}

function popRandomCareBubble() {
  const available = [...careBubblesEl.querySelectorAll(".care-bubble-button:not(.popped)")];

  if (available.length === 0) {
    renderCareBubbles();
    return;
  }

  const index = Math.floor(Math.random() * available.length);
  popCareBubble(available[index]);
  startCareBubbleTimer();
}

function getCareBubbleDelay() {
  return CARE_BUBBLE_INTERVAL_MS + Math.floor(Math.random() * CARE_BUBBLE_JITTER_MS);
}

function showCareNote(note) {
  window.clearTimeout(careNoteTimer);
  careNoteEl.textContent = note;
  careNoteEl.classList.add("visible");

  careNoteTimer = window.setTimeout(() => {
    careNoteEl.classList.remove("visible");
  }, 7000);
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
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
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveMessages() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-24)));
}
