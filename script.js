// Find the parts of the page that the chatbot needs to use.
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendButton = document.getElementById("sendBtn");

// The browser calls the Worker, so the OpenAI API key stays private in Cloudflare.
const workerUrl = "https://loreal-chatbot-worker.shelseadds.workers.dev";

// These instructions keep the chatbot focused on L'Oréal and beauty topics.
const systemPrompt = `
You are a helpful L'Oréal beauty assistant.

Only answer questions about L'Oréal products, skincare, haircare, makeup,
fragrances, beauty routines, and beauty recommendations.

If a question is unrelated to L'Oréal or beauty, politely explain that you
can only help with L'Oréal products and beauty-related topics.

Do not diagnose medical conditions. For serious skin, hair, or health concerns,
recommend speaking with a qualified medical professional.
`;

// Keep the conversation in memory while this page is open.
const conversationHistory = [
  {
    role: "system",
    content: systemPrompt,
  },
];

// Add a message to the chat window without treating user text as HTML.
function addMessage(text, messageType) {
  const message = document.createElement("p");
  message.className = `msg ${messageType}`;
  message.textContent = text;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return message;
}

// Show a welcome message when the page loads.
addMessage("Hello! How can I help you with L'Oréal products today?", "ai");

// Send the user's question to the Cloudflare Worker.
chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = userInput.value.trim();

  if (!message) {
    return;
  }

  addMessage(message, "user");
  conversationHistory.push({
    role: "user",
    content: message,
  });

  userInput.value = "";
  userInput.disabled = true;
  sendButton.disabled = true;
  const loadingMessage = addMessage("Thinking...", "ai");

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error(`Worker request failed with status ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error("The Worker returned an unexpected response.");
    }

    conversationHistory.push({
      role: "assistant",
      content: reply,
    });
    loadingMessage.textContent = reply;
  } catch (error) {
    console.error("Chatbot request failed:", error);

    // Remove the failed question so it is not sent again in later requests.
    conversationHistory.pop();
    loadingMessage.textContent =
      "Sorry, I could not connect right now. Please try again.";
  } finally {
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
  }
});
