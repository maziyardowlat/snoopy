const form = document.querySelector("#chatForm");
const input = document.querySelector("#messageInput");
const messagesEl = document.querySelector("#messages");
const sendButton = document.querySelector("#sendButton");
const clearButton = document.querySelector("#clearChat");
const badDayToggle = document.querySelector("#badDayToggle");
const badDayPanel = document.querySelector("#badDayPanel");
const badDayActions = document.querySelector(".bad-day-actions");
const safetyButton = document.querySelector("#safetyButton");
const moodChipsEl = document.querySelector("#moodChips");
const supportModesEl = document.querySelector("#supportModes");
const careLightsEl = document.querySelector("#careLights");
const careNoteEl = document.querySelector("#careNote");
const dogWisdomEl = document.querySelector("#dogWisdom");
const dogWisdomButtons = document.querySelectorAll(".composer-buddy");

const STORAGE_KEY = "waliya-cozy-chat";
const CHECK_IN_STORAGE_KEY = "waliya-check-in";
const CARE_LIGHT_INTERVAL_MS = 15000;
const CARE_LIGHT_JITTER_MS = 2500;
const DEFAULT_SUPPORT_MODE = "listen";
const MOOD_SETTINGS = {
  soft: {
    label: "soft",
    note: "Soft home mode is on. Gentle words, low pressure.",
    placeholder: "Tell me what feels tender right now...",
    instruction: "Waliya feels tender or emotionally open. Be extra gentle, affirming, and unhurried."
  },
  angry: {
    label: "angry",
    note: "Angry room mode is on. No shame, just room for the heat.",
    placeholder: "Tell me what made you angry...",
    instruction: "Waliya feels angry. Validate the feeling without escalating it, and help her feel understood before any advice."
  },
  numb: {
    label: "numb",
    note: "Numb room mode is on. Tiny words count.",
    placeholder: "Tell me what feels blank or far away...",
    instruction: "Waliya feels numb or disconnected. Use simple grounding, low-demand questions, and avoid overly intense language."
  },
  lonely: {
    label: "lonely",
    note: "Lonely home mode is on. Stay close and warm.",
    placeholder: "Tell me where the lonely feeling is sitting...",
    instruction: "Waliya feels lonely. Offer steady presence and reassurance, and gently encourage connection if useful."
  },
  overwhelmed: {
    label: "overwhelmed",
    note: "Overwhelmed room mode is on. One thing at a time.",
    placeholder: "Drop the whole mess here...",
    instruction: "Waliya feels overwhelmed. Reduce the scope, use short replies, and focus on the next tiny manageable thing."
  },
  sleepy: {
    label: "sleepy",
    note: "Sleepy home mode is on. Soft landing mode.",
    placeholder: "Tell me what your tired brain is carrying...",
    instruction: "Waliya feels sleepy or depleted. Keep the tone quiet and soothing, with rest-friendly support."
  }
};
const SUPPORT_MODES = {
  listen: {
    label: "just listen",
    note: "Reply style set to just listen.",
    instruction: "Listen first. Reflect and validate. Do not problem-solve unless Waliya asks."
  },
  think: {
    label: "help me think",
    note: "Reply style set to help me think.",
    instruction: "Help Waliya sort the situation with gentle questions and clear, calm thinking."
  },
  distract: {
    label: "distract me",
    note: "Reply style set to distract me.",
    instruction: "Offer a soft, easy distraction or playful shift. Keep it light and low effort."
  },
  plan: {
    label: "tiny plan",
    note: "Reply style set to tiny plan.",
    instruction: "Give one very small next step, then stop. Avoid a long list."
  }
};
const DOG_WISDOM = [
  "Chef Fezco says the whole tub was the correct amount.",
  "Chef Fezco says cocoa dust is a legitimate coping strategy.",
  "Chef Fezco has tasted the vibes. They need more mascarpone.",
  "Chef Fezco says tiramisu means pick-me-up, so this is basically medicine.",
  "Fezco recommends blanket.",
  "Fezco says this meeting could have been a nap.",
  "Fezco has inspected the vibe and requests snacks.",
  "Fezco says drink water, then look mysterious.",
  "Fezco says your only job for the next minute is breathing.",
  "Fezco recommends becoming a cozy loaf.",
  "Fezco says the house is secure.",
  "Fezco says soft blanket protocol is active.",
  "Fezco thinks you deserve a forehead kiss.",
  "Fezco has reviewed the evidence and you are very loved.",
  "Fezco says no big decisions while tired.",
  "Fezco says snacks are not a personality flaw.",
  "Fezco recommends one tiny stretch and then more resting.",
  "Fezco says the vibes are recoverable.",
  "Fezco says you can text Maz with one word if words are hard.",
  "Fezco says being small and sleepy is allowed.",
  "Fezco requests that you unclench your jaw.",
  "Fezco says paws on deck, you are not alone.",
  "Fezco says today's forecast: emotionally damp, still lovable.",
  "Fezco recommends the ancient healing art of getting under a blanket."
];
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
  "There is room for you exactly as you are.",
  "You can be tired and still be deeply loved.",
  "Nothing about you is too much for gentleness.",
  "You are not behind. You are here.",
  "Let today be smaller if it needs to be.",
  "You do not have to explain your heaviness to deserve care.",
  "One sip of water counts as taking care of yourself.",
  "You are allowed to take up space.",
  "I would choose you again on the messy days.",
  "You are more than this feeling.",
  "Your body deserves kindness, even when your mind is loud.",
  "You do not need to disappear to make things easier.",
  "Stay for the next soft thing.",
  "You are lovable without being useful.",
  "A slow day is still a day you made it through.",
  "You are not failing because this is hard.",
  "You can put everything down for one minute.",
  "I am proud of the parts of you that keep trying quietly.",
  "You deserve tenderness without proving anything first.",
  "You are not a problem to solve.",
  "There is no version of you I want less.",
  "Your laugh is one of my favorite sounds.",
  "You make ordinary things feel warmer.",
  "Even your quiet presence matters.",
  "You are worth patience.",
  "It is okay if all you did today was survive.",
  "A home can be quiet and still be full of life.",
  "You can settle for a while. You do not have to perform.",
  "Your feelings are real, and they are not forever.",
  "I am glad the world has you in it.",
  "You do not have to be easy to be loved.",
  "Rest is not giving up.",
  "You are allowed to need reassurance.",
  "You are not alone in the quiet room.",
  "Let the next breath be enough for now.",
  "You are beautiful in ways sadness cannot erase.",
  "You do not need to punish yourself for hurting.",
  "You can ask for help before it gets unbearable.",
  "I want the real you, not the pretending one.",
  "You are safe to be soft here.",
  "Your future does not need you to solve it tonight.",
  "You are still worthy when your room is messy.",
  "You are still worthy when texts go unanswered.",
  "You are still worthy when plans change.",
  "Please be as gentle with yourself as you are with others.",
  "A tiny reset is enough: unclench, breathe, sip.",
  "Some days are just for getting through.",
  "You belong in every room where you are loved.",
  "You do not have to carry the whole day at once.",
  "Snoopy is monitoring the little home and says you are doing enough.",
  "The porch light is on because you deserve rest.",
  "You are my favorite person to check on.",
  "If your heart feels heavy, let me hold a corner of it.",
  "Nothing tender about you is wasted.",
  "You are not the worst thing your brain says about you.",
  "This moment can be hard and you can still be safe.",
  "You do not have to make pain make sense right now.",
  "I love the you who is trying, resting, crying, laughing, all of it.",
  "You are allowed to begin again as many times as you need.",
  "The room is calm. You can borrow some calm from it.",
  "You are enough before you answer anyone.",
  "You are enough before you fix anything.",
  "You are enough before you feel better.",
  "I am not going anywhere because today got hard.",
  "Come back to the room: five things you can see.",
  "Your hands deserve something warm to hold.",
  "Put both feet on the floor. The world can wait a second.",
  "You have made it through every bad day before this one.",
  "There is still softness ahead.",
  "You are loved in the exact shape you arrived in today.",
  "You are allowed to be held by small comforts.",
  "You do not have to turn pain into a lesson tonight.",
  "You can be a work in progress and still be wonderful.",
  "Even a low battery heart deserves care.",
  "You are not dramatic for needing softness.",
  "Nothing about this moment makes you less worthy.",
  "You can take the day in teaspoon-sized pieces.",
  "You are more loved than your fear can measure.",
  "If all you can do is breathe, breathe with me.",
  "You are not a burden for having needs.",
  "Your sadness does not make you unlovable.",
  "You do not have to be impressive to be precious.",
  "Let the room hold what you cannot hold right now.",
  "One gentle choice is still a choice.",
  "You do not need to outrun the feeling.",
  "You can sit beside the feeling and let it pass.",
  "You are not alone just because it feels quiet.",
  "I care about the version of you that cannot get out of bed too.",
  "You can answer life later. For now, breathe.",
  "You deserve food, water, warmth, and kindness.",
  "Your needs are not an inconvenience.",
  "You are not hard to love. You are hurting.",
  "The hard thoughts can be loud and still be wrong.",
  "You do not have to believe every thought that hurts you.",
  "I would still pick up the phone.",
  "I would still want to hear from you.",
  "You do not need the perfect words to ask for comfort.",
  "A simple 'can you stay?' is enough.",
  "You are not too late for tenderness.",
  "Your heart can be messy and still be good.",
  "You are allowed to pause before reacting.",
  "Let this be a no-shame minute.",
  "There is no grade for being alive today.",
  "You are doing human things in a human body.",
  "You deserve to be spoken to kindly, especially by you.",
  "You are allowed to step away from sharp thoughts.",
  "You can choose delay. Ten minutes counts.",
  "Move one unsafe thing farther away if you can.",
  "Text someone before the wave gets bigger.",
  "You can need help and still be strong.",
  "You are not ruining anything by having a hard moment.",
  "This can be a moment you survive, not a moment you solve.",
  "You are wanted here.",
  "You are wanted on boring days too.",
  "You are wanted when you are not funny.",
  "You are wanted when you are quiet.",
  "You are wanted when your brain lies.",
  "You are someone I am grateful to know.",
  "I like the way you exist.",
  "I like your little habits.",
  "I like your face when you are concentrating.",
  "I like being in your orbit.",
  "You make the future feel less empty.",
  "You make small things feel worth noticing.",
  "There are still songs you have not loved yet.",
  "There are still warm drinks waiting for you.",
  "There are still soft mornings ahead.",
  "There are still silly little moments coming.",
  "There are still soft mornings in this new home.",
  "Snoopy says naps are a valid strategy.",
  "Snoopy says no heroic speeches required.",
  "Snoopy says you are doing the brave quiet thing.",
  "The home report says: rest recommended.",
  "The little lights are giving you a tiny standing ovation.",
  "A light turned on just to remind you: stay.",
  "You can come back to this note as many times as you need.",
  "I am glad you opened this.",
  "I am glad you are still here.",
  "Thank you for making it to this breath.",
  "Thank you for trying again, even softly.",
  "You are not a checklist.",
  "You are not a productivity machine.",
  "You are a person, and people need care.",
  "Your worth did not clock out because you got tired.",
  "You can be loved while healing slowly.",
  "Healing does not have to look graceful.",
  "A setback is not a verdict.",
  "A bad night is not a bad life.",
  "Your story is allowed to keep going.",
  "You do not have to know how everything gets better.",
  "You only have to make it to the next kind thing.",
  "Let one kind thing be enough.",
  "Let one safe choice be enough.",
  "You are allowed to protect yourself from your own storm.",
  "Your legs deserve gentleness too.",
  "Your skin is not where pain has to go.",
  "Your body is trying to carry you. Please carry it gently.",
  "You can put distance between you and the urge.",
  "Delay the hurt. Text Maz. Drink water. Stay near light.",
  "You deserve care before the breaking point.",
  "You deserve help before it becomes an emergency.",
  "You are not asking too much by wanting to be held.",
  "You can be honest without being a burden.",
  "You can say, 'I am not okay,' and still be loved.",
  "There is no shame in needing someone beside you.",
  "Please let someone love you through the next few minutes.",
  "The next few minutes are worth protecting.",
  "This feeling is a storm. You are not the storm.",
  "Settle. Breathe. Reach. That is enough for now.",
  "You are allowed to stay."
];

let careNoteTimer;
let careLightInterval;
let dogWisdomTimer;

const savedCheckIn = loadCheckInState();
let currentMood = savedCheckIn.mood;
let currentSupportMode = savedCheckIn.supportMode;
let messages = loadMessages();

if (messages.length === 0) {
  messages = [
    {
      role: "assistant",
      content: "hey Waliya, how was your day?"
    }
  ];
}

renderCheckInState();
renderMessages();
renderCareLights();
startCareLightTimer();
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
    showCareNote("Porch light mode is open. No pressure, just one small next thing.");
  }
});

badDayActions.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-prompt]");

  if (!button) return;

  await sendChatMessage(button.dataset.prompt);
});

moodChipsEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-mood]");

  if (!button) return;

  const nextMood = button.dataset.mood;
  currentMood = currentMood === nextMood ? "" : nextMood;
  renderCheckInState();
  saveCheckInState();

  if (currentMood) {
    showCareNote(MOOD_SETTINGS[currentMood].note);
  } else {
    showCareNote("Home mode reset. You can pick a new mood anytime.");
  }

  input.focus();
});

supportModesEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-support-mode]");

  if (!button) return;

  currentSupportMode = button.dataset.supportMode;
  renderCheckInState();
  saveCheckInState();
  showCareNote(SUPPORT_MODES[currentSupportMode].note);
  input.focus();
});

safetyButton.addEventListener("click", () => {
  const safetyMessage =
    "If you might not be safe, please call or text 988 now if you are in the US or Canada. If danger is immediate, call emergency services. If you can, text Maz or someone trusted and move near another person.";

  addMessage("assistant", safetyMessage);
  showCareNote("One tiny brave thing: get another human near you right now.");
});

dogWisdomButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showDogWisdom();
  });
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
        messages: getApiMessages(thinking),
        checkIn: getCheckInContext()
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

function renderCheckInState() {
  if (currentMood) {
    document.body.dataset.mood = currentMood;
  } else {
    delete document.body.dataset.mood;
  }

  moodChipsEl.querySelectorAll("[data-mood]").forEach((button) => {
    const isActive = button.dataset.mood === currentMood;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  supportModesEl.querySelectorAll("[data-support-mode]").forEach((button) => {
    const isActive = button.dataset.supportMode === currentSupportMode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  input.placeholder = currentMood
    ? MOOD_SETTINGS[currentMood].placeholder
    : "Tell me what happened today...";
}

function getCheckInContext() {
  const mood = MOOD_SETTINGS[currentMood];
  const supportMode = SUPPORT_MODES[currentSupportMode] || SUPPORT_MODES[DEFAULT_SUPPORT_MODE];

  return {
    mood: mood ? mood.label : "",
    moodInstruction: mood ? mood.instruction : "",
    supportMode: supportMode.label,
    supportInstruction: supportMode.instruction
  };
}

function renderCareLights() {
  const notes = shuffle(CARE_NOTES).slice(0, 4);
  careLightsEl.innerHTML = "";

  notes.forEach((note, index) => {
    const button = document.createElement("button");
    button.className = `care-light-button light-size-${index + 1}`;
    button.type = "button";
    button.dataset.note = note;
    button.setAttribute("aria-label", "Turn on a care light");

    const label = document.createElement("span");
    label.className = "visually-hidden";
    label.textContent = note;

    button.append(label);
    careLightsEl.append(button);
  });
}

careLightsEl.addEventListener("click", (event) => {
  const button = event.target.closest(".care-light-button");

  if (!button || button.disabled) return;

  turnOnCareLight(button);
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    window.clearInterval(careLightInterval);
    return;
  }

  startCareLightTimer();
});

function turnOnCareLight(button) {
  button.disabled = true;
  button.classList.add("lit");
  showCareNote(button.dataset.note);

  const remaining = careLightsEl.querySelectorAll(".care-light-button:not(.lit)").length;

  if (remaining === 0) {
    window.setTimeout(renderCareLights, 900);
  }
}

function startCareLightTimer() {
  window.clearInterval(careLightInterval);
  careLightInterval = window.setInterval(turnOnRandomCareLight, getCareLightDelay());
}

function turnOnRandomCareLight() {
  const available = [...careLightsEl.querySelectorAll(".care-light-button:not(.lit)")];

  if (available.length === 0) {
    renderCareLights();
    return;
  }

  const index = Math.floor(Math.random() * available.length);
  turnOnCareLight(available[index]);
  startCareLightTimer();
}

function getCareLightDelay() {
  return CARE_LIGHT_INTERVAL_MS + Math.floor(Math.random() * CARE_LIGHT_JITTER_MS);
}

function showCareNote(note) {
  window.clearTimeout(careNoteTimer);
  careNoteEl.textContent = note;
  careNoteEl.classList.add("visible");

  careNoteTimer = window.setTimeout(() => {
    careNoteEl.classList.remove("visible");
  }, 7000);
}

function showDogWisdom() {
  window.clearTimeout(dogWisdomTimer);
  dogWisdomEl.textContent = DOG_WISDOM[Math.floor(Math.random() * DOG_WISDOM.length)];
  dogWisdomEl.classList.add("visible");

  dogWisdomTimer = window.setTimeout(() => {
    dogWisdomEl.textContent = "tap a sous-chef for kitchen wisdom";
    dogWisdomEl.classList.remove("visible");
  }, 6500);
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

function loadCheckInState() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(CHECK_IN_STORAGE_KEY) || "{}");
    const mood = MOOD_SETTINGS[saved.mood] ? saved.mood : "";
    const supportMode = SUPPORT_MODES[saved.supportMode] ? saved.supportMode : DEFAULT_SUPPORT_MODE;

    return { mood, supportMode };
  } catch {
    return { mood: "", supportMode: DEFAULT_SUPPORT_MODE };
  }
}

function saveCheckInState() {
  sessionStorage.setItem(
    CHECK_IN_STORAGE_KEY,
    JSON.stringify({
      mood: currentMood,
      supportMode: currentSupportMode
    })
  );
}
