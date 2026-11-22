// Find the parts of the page that the chatbot needs to use.
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendButton = document.getElementById("sendBtn");
/* phase one */
const productGrid = document.getElementById("productGrid");
/* phase two */
const selectedProductsList = document.getElementById("selectedProductsList");
const selectedCount = document.getElementById("selectedCount");
const clearSelectionsBtn = document.getElementById("clearSelectionsBtn");
const selectionAnnouncement = document.getElementById("selectionAnnouncement");
const selectedProductsStorageKey = "lorealSelectedProducts";
// phase three
const productSearch = document.getElementById("productSearch");
const categoryFilter = document.getElementById("categoryFilter");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");
const productResultsCount = document.getElementById("productResultsCount");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const rtlToggleBtn = document.getElementById("rtlToggleBtn");
const webSearchToggle = document.getElementById("webSearchToggle");
//phase three end
// Phase four
const generateRoutineBtn = document.getElementById("generateRoutineBtn");
const routineStatus = document.getElementById("routineStatus");
// phase five
const chatStatus = document.getElementById("chatStatus");
// phase five end

function loadSelectedProducts() {
  try {
    const savedSelections = JSON.parse(
      localStorage.getItem(selectedProductsStorageKey),
    );

    if (!Array.isArray(savedSelections)) {
      return [];
    }

    const validProductNames = products
      .map((product) => product.name)
      .filter((name) => savedSelections.includes(name));

    return validProductNames;
  } catch (error) {
    return [];
  }
}

function saveSelectedProducts() {
  localStorage.setItem(
    selectedProductsStorageKey,
    JSON.stringify(selectedProductNames),
  );
}

function isProductSelected(productName) {
  return selectedProductNames.includes(productName);
}

function toggleProductSelection(productName) {
  if (isProductSelected(productName)) {
    selectedProductNames = selectedProductNames.filter(
      (name) => name !== productName,
    );
    selectionAnnouncement.textContent = `${productName} deselected.`;
  } else {
    selectedProductNames.push(productName);
    selectionAnnouncement.textContent = `${productName} selected.`;
  }

  saveSelectedProducts();
  updateSelectedProducts();
  updateProductCards();
}

function removeSelectedProduct(productName) {
  selectedProductNames = selectedProductNames.filter(
    (name) => name !== productName,
  );
  saveSelectedProducts();
  updateSelectedProducts();
  updateProductCards();
  selectionAnnouncement.textContent = `${productName} removed from selected products.`;
}

function updateProductCards() {
  const cards = productGrid.querySelectorAll(".product-card");

  cards.forEach((card) => {
    const productName = card.dataset.productName;
    const selected = isProductSelected(productName);

    card.classList.toggle("selected", selected);
    card.setAttribute("aria-pressed", selected.toString());
    card.setAttribute(
      "aria-label",
      `${selected ? "Deselect" : "Select"} ${productName}`,
    );

    const selectionLabel = card.querySelector(".selection-label");
    selectionLabel.textContent = selected ? "Selected" : "Select";
  });
}

function updateSelectedProducts() {
  selectedProductsList.replaceChildren();

  const count = selectedProductNames.length;
  selectedCount.textContent =
    count === 1 ? "1 product selected" : `${count} products selected`;
  clearSelectionsBtn.disabled = count === 0;
  generateRoutineBtn.disabled = count === 0;

  if (count === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "selected-products-empty";
    emptyMessage.textContent =
      "Choose a product card to start building your routine.";
    selectedProductsList.appendChild(emptyMessage);
    return;
  }

  selectedProductNames.forEach((productName) => {
    const product = products.find((item) => item.name === productName);

    if (!product) {
      return;
    }

    const item = document.createElement("article");
    item.className = "selected-product-item";

    const itemText = document.createElement("div");

    const itemCategory = document.createElement("p");
    itemCategory.className = "selected-product-category";
    itemCategory.textContent = product.category;

    const itemName = document.createElement("h3");
    itemName.textContent = product.name;

    itemText.appendChild(itemCategory);
    itemText.appendChild(itemName);

    const removeButton = document.createElement("button");
    removeButton.className = "remove-selected-product";
    removeButton.type = "button";
    removeButton.setAttribute(
      "aria-label",
      `Remove ${product.name} from selected products`,
    );
    removeButton.textContent = "×";
    removeButton.addEventListener("click", () => {
      removeSelectedProduct(product.name);
    });

    item.appendChild(itemText);
    item.appendChild(removeButton);
    selectedProductsList.appendChild(item);
  });
}
// Phase two end
// Product information used to build the product grid.
const products = [
  {
    name: "Revitalift 1.5% Hyaluronic Acid Serum",
    brand: "L'Oréal Paris",
    category: "Skincare",
    description:
      "A hydrating serum with hyaluronic acid that helps skin look smoother and more refreshed.",
  },
  {
    name: "Revitalift Triple Power Anti-Aging Moisturizer",
    brand: "L'Oréal Paris",
    category: "Skincare",
    description:
      "A daily face moisturizer designed to improve the look of wrinkles, firmness, and radiance.",
  },
  {
    name: "Elvive Hyaluron Moisture Conditioner",
    brand: "L'Oréal Paris",
    category: "Haircare",
    description:
      "A moisturizing conditioner that helps keep dry hair feeling soft, supple, and shiny.",
  },
  {
    name: "Elvive Extraordinary Oil",
    brand: "L'Oréal Paris",
    category: "Haircare",
    description:
      "A lightweight hair oil that helps add softness and shine while smoothing the hair's appearance.",
  },
  {
    name: "Infallible 24H Fresh Wear Foundation",
    brand: "L'Oréal Paris",
    category: "Makeup",
    description:
      "A buildable liquid foundation with breathable coverage and a fresh, natural finish.",
  },
  {
    name: "Infallible Pro-Last Waterproof Lipstick",
    brand: "L'Oréal Paris",
    category: "Makeup",
    description:
      "A two-step lip color that provides long-lasting color and a comfortable finish.",
  },
  {
    name: "Bright Reveal SPF 50",
    brand: "L'Oréal Paris",
    category: "Skincare",
    description:
      "A daily broad-spectrum sunscreen that helps protect skin while supporting a more even look.",
  },
  {
    name: "Elnett Satin Extra Strong Hold Hairspray",
    brand: "L'Oréal Paris",
    category: "Haircare",
    description:
      "An extra strong hold hairspray that helps set styles while maintaining a soft, touchable finish.",
  },
];

// Store the selected product names so selections survive a page reload.
let selectedProductNames = loadSelectedProducts();

// Create the product cards and add expandable descriptions.
function displayProducts() {
  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.productName = product.name;
    // phase three
    card.dataset.category = product.category;
    card.dataset.searchText =
      `${product.name} ${product.brand} ${product.category} ${product.description}`.toLowerCase();
    //phase three end
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-pressed", "false");
    card.setAttribute("aria-label", `Select ${product.name}`);

    const cardContent = document.createElement("div");
    cardContent.className = "product-card-content";

    const category = document.createElement("p");
    category.className = "product-category";
    category.textContent = product.category;

    const selectionLabel = document.createElement("span");
    selectionLabel.className = "selection-label";
    selectionLabel.textContent = "Select";

    const brand = document.createElement("p");
    brand.className = "product-brand";
    brand.textContent = product.brand;

    const name = document.createElement("h3");
    name.className = "product-name";
    name.textContent = product.name;

    const description = document.createElement("details");
    description.className = "product-description";

    const descriptionButton = document.createElement("summary");
    descriptionButton.textContent = "View description";

    const descriptionText = document.createElement("p");
    descriptionText.textContent = product.description;

    description.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    // phase seven
    description.addEventListener("toggle", () => {
      descriptionButton.textContent = description.open
        ? "Hide description"
        : "View description";
    });
    // phase seven end
    description.appendChild(descriptionButton);
    description.appendChild(descriptionText);
    cardContent.appendChild(category);
    cardContent.appendChild(selectionLabel);
    cardContent.appendChild(brand);
    cardContent.appendChild(name);
    cardContent.appendChild(description);
    card.appendChild(cardContent);

    card.addEventListener("click", (event) => {
      if (!event.target.closest(".product-description")) {
        toggleProductSelection(product.name);
      }
    });

    card.addEventListener("keydown", (event) => {
      if (
        (event.key === "Enter" || event.key === " ") &&
        !event.target.closest(".product-description")
      ) {
        event.preventDefault();
        toggleProductSelection(product.name);
      }
    });

    productGrid.appendChild(card);
  });
}

displayProducts();
updateSelectedProducts();
updateProductCards();
function filterProducts() {
  const normalizeText = (text) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };
  const searchText = normalizeText(productSearch.value.trim());
  const selectedCategory = categoryFilter.value;
  const cards = productGrid.querySelectorAll(".product-card");
  let visibleProductCount = 0;

  cards.forEach((card) => {
    const matchesSearch =
      searchText === "" ||
      card.dataset.searchText
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .includes(searchText);
    const matchesCategory =
      selectedCategory === "All" ||
      card.dataset.category === selectedCategory;
    const isVisible = matchesSearch && matchesCategory;

    card.hidden = !isVisible;

    if (isVisible) {
      visibleProductCount += 1;
    }
  });

  productResultsCount.textContent =
    visibleProductCount === 1
      ? "1 product found"
      : `${visibleProductCount} products found`;

  clearFiltersBtn.disabled =
    searchText === "" && selectedCategory === "All";
  clearSearchBtn.disabled = productSearch.value.trim() === "";
  updateEmptyResultsMessage(visibleProductCount);
}

function updateEmptyResultsMessage(visibleProductCount) {
  const existingMessage = productGrid.querySelector(".product-grid-empty");

  if (visibleProductCount > 0) {
    if (existingMessage) {
      existingMessage.remove();
    }
    return;
  }

  if (!existingMessage) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "product-grid-empty";
    emptyMessage.textContent =
      "No products match your search and category filters.";
    productGrid.appendChild(emptyMessage);
  }
}

productSearch.addEventListener("input", filterProducts);
categoryFilter.addEventListener("change", filterProducts);
clearFiltersBtn.addEventListener("click", () => {
  productSearch.value = "";
  categoryFilter.value = "All";
  filterProducts();
  productSearch.focus();
});

clearSearchBtn.addEventListener("click", () => {
  productSearch.value = "";
  filterProducts();
  productSearch.focus();
});

filterProducts();

function applyDirection(direction) {
  const isRtl = direction === "rtl";
  document.documentElement.setAttribute("dir", direction);
  document.documentElement.setAttribute("lang", isRtl ? "ar" : "en");
  rtlToggleBtn.setAttribute("aria-pressed", isRtl.toString());
  rtlToggleBtn.textContent = isRtl ? "English / LTR" : "العربية / RTL";
  localStorage.setItem("lorealPageDirection", direction);
}

rtlToggleBtn.addEventListener("click", () => {
  const currentDirection =
    document.documentElement.getAttribute("dir") === "rtl" ? "rtl" : "ltr";
  applyDirection(currentDirection === "rtl" ? "ltr" : "rtl");
});

applyDirection(localStorage.getItem("lorealPageDirection") === "rtl" ? "rtl" : "ltr");
// phase three end
clearSelectionsBtn.addEventListener("click", () => {
  selectedProductNames = [];
  saveSelectedProducts();
  updateSelectedProducts();
  updateProductCards();
  routineStatus.textContent = "";
  // phase five
  routineGenerated = false;
  chatStatus.textContent = "";
  userInput.placeholder = "Ask me about products or routines…";
  // phase five end
  selectionAnnouncement.textContent = "All selected products cleared.";
});
/* phase one end*/
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

After a routine is generated, answer follow-up questions about that routine,
the selected products, and general skincare, haircare, makeup, and fragrance
topics. Keep each answer relevant to beauty and refer to earlier parts of the
conversation when helpful.
`;

// Keep the conversation in memory while this page is open.
const conversationHistory = [
  {
    role: "system",
    content: systemPrompt,
  },
];
let routineRequestInProgress = false;
// phase five
let chatRequestInProgress = false;
let routineGenerated = false;
// phase five end

// Add a message to the chat window without treating user text as HTML.
function addMessage(text, messageType) {
  const message = document.createElement("p");
  message.className = `msg ${messageType}`;
  message.textContent = text;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return message;
}

function addCitations(messageElement, citations) {
  if (!citations.length) {
    return;
  }

  const citationList = document.createElement("div");
  citationList.className = "chat-citations";

  const citationTitle = document.createElement("strong");
  citationTitle.textContent = "Sources";
  citationList.appendChild(citationTitle);

  citations.forEach((citation, index) => {
    if (!citation.url) {
      return;
    }

    const citationLink = document.createElement("a");
    citationLink.href = citation.url;
    citationLink.target = "_blank";
    citationLink.rel = "noopener noreferrer";
    citationLink.textContent = citation.title || `Source ${index + 1}`;
    citationList.appendChild(citationLink);
  });

  chatWindow.appendChild(citationList);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Show a welcome message when the page loads.
addMessage("Hello! How can I help you with L'Oréal products today?", "ai");
// phase 4

// Collect only the selected products and send them as JSON.
function getSelectedProductData() {
  return selectedProductNames
    .map((productName) => {
      return products.find((product) => product.name === productName);
    })
    .filter((product) => product)
    .map((product) => {
      return {
        name: product.name,
        brand: product.brand,
        category: product.category,
        description: product.description,
      };
    });
}

// Keep chat and routine actions from sending requests at the same time.
function setChatBusy(isBusy) {
  userInput.disabled = isBusy;
  sendButton.disabled = isBusy;
  generateRoutineBtn.disabled =
    isBusy || selectedProductNames.length === 0;
  // phase seven
  chatWindow.setAttribute("aria-busy", isBusy.toString());
  sendButton.setAttribute(
    "aria-label",
    isBusy ? "Please wait for the response" : "Send message",
  );
  // phase seven end
  if (!isBusy) {
    userInput.focus();
  }
}
// phase six
async function requestWorker(messages, useWebSearch = false) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
        webSearch: useWebSearch,
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error || `Worker request failed with status ${response.status}`);
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      data?.output_text;

    if (!reply) {
      throw new Error("The Worker returned an unexpected response.");
    }

    return {
      reply: reply,
      citations: Array.isArray(data?.citations) ? data.citations : [],
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
// phase six end
generateRoutineBtn.addEventListener("click", async () => {
  // phase five
  if (
    routineRequestInProgress ||
    chatRequestInProgress ||
    selectedProductNames.length === 0
  ) {
    // phase five end
    return;
  }

  const selectedProductData = getSelectedProductData();
  const routinePrompt =
    "Create a clear, personalized beauty routine using only the following " +
    "selected L'Oréal products. Organize the routine by morning and evening " +
    "when relevant, explain the suggested order, and add a brief sunscreen " +
    "reminder for daytime skincare. Do not add products that are not in this " +
    "list.\n\nSelected products JSON:\n" +
    JSON.stringify(selectedProductData);

  routineRequestInProgress = true;
  setChatBusy(true);
  routineStatus.textContent = "Generating your personalized routine...";
  const loadingMessage = addMessage(
    "Creating a routine from your selected products...",
    "ai",
  );
  addMessage("Generate a routine for my selected products.", "user");
  conversationHistory.push({
    role: "user",
    content: routinePrompt,
  });

  try {
    const { reply, citations } = await requestWorker(
      conversationHistory,
      webSearchToggle.checked,
    );

    conversationHistory.push({
      role: "assistant",
      content: reply,
    });
    loadingMessage.textContent = reply;
    addCitations(loadingMessage, citations);
    // phase five
    routineGenerated = true;
    routineStatus.textContent = "Your personalized routine is ready.";
    chatStatus.textContent =
      "You can now ask follow-up questions about this routine.";
    userInput.placeholder =
      "Ask a follow-up about your routine or beauty routine...";
  // phase five end
  } catch (error) {
    console.error("Routine generation failed:", error);
    conversationHistory.pop();
    loadingMessage.textContent = `Sorry, ${error.message}`;
    routineStatus.textContent = "The routine could not be generated.";
  } finally {
    routineRequestInProgress = false;
    setChatBusy(false);
  }
});
// Phase 4 end

// Send the user's question to the Cloudflare Worker.
chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (routineRequestInProgress || chatRequestInProgress) {
    return;
  }
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
  chatRequestInProgress = true;
  setChatBusy(true);
  chatStatus.textContent = "Thinking...";
  const loadingMessage = addMessage("Thinking...", "ai");

  try {
    const { reply, citations } = await requestWorker(
      conversationHistory,
      webSearchToggle.checked,
    );

    conversationHistory.push({
      role: "assistant",
      content: reply,
    });
    loadingMessage.textContent = reply;
    addCitations(loadingMessage, citations);
    chatStatus.textContent = routineGenerated
      ? "Follow-up answer received."
      : "Answer received.";
  } catch (error) {
    console.error("Chatbot request failed:", error);

    // Remove the failed question so it is not sent again in later requests.
    conversationHistory.pop();
    loadingMessage.textContent = `Sorry, ${error.message}`;
    chatStatus.textContent = "The follow-up could not be sent.";
  } finally {
    chatRequestInProgress = false;
    setChatBusy(false);
  }
});
