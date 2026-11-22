# Project 8: L'Oréal Chatbot

L’Oréal is exploring the power of AI, and your job is to showcase what's possible. Your task is to build a chatbot that helps users discover and understand L’Oréal’s extensive range of products—makeup, skincare, haircare, and fragrances—as well as provide personalized routines and recommendations.

## 🚀 Launch via GitHub Codespaces

1. In the GitHub repo, click the **Code** button and select **Open with Codespaces → New codespace**.
2. Once your codespace is ready, open the `index.html` file via the live preview.

## ☁️ Cloudflare Note

When deploying through Cloudflare, make sure your API request body (in `script.js`) includes a `messages` array and handle the response by extracting `data.choices[0].message.content`.

Enjoy building your L’Oréal beauty assistant! 💄


## Phases Implemented 

Phase 1: Product discovery
Goal: Build the product browsing experience.

Add product data to the project
Add a responsive product grid
Display product image, name, brand, and category
Add product descriptions using cards or a modal
Make product cards interactive
Check: Users can browse and view product details.


Phase 2: Selection and saved state
Goal: Let users build a selected-products list.

Add click-to-select and click-to-deselect behavior
Highlight selected product cards
Create the Selected Products section
Add individual remove buttons
Add a Clear All button
Save selections in localStorage
Restore selections after page reload
Check: Selections remain visible after refresh and can be removed individually or all at once.


Phase 3: Search and filtering
Goal: Help users find products more easily.

Add a product search field
Filter products by name or keyword
Add category filtering
Combine search and category filters
Add an empty-results state
Keep selection state intact while filtering
Check: Search and category filters work together without losing selected products.


Phase 4: Personalized routine generation
Goal: Generate a routine from selected products.

Add the Generate Routine button
Disable it when nothing is selected
Collect only selected product JSON
Send product name, brand, category, and description to the Worker
Update the Worker prompt for routine creation
Display the generated routine in the chat window
Prevent overlapping requests
Show a loading state and error state
Check: Clicking the button produces a routine based exclusively on the selected products.


Phase 5: Chat follow-ups
Goal: Continue discussing the generated routine.

Retain the complete chat conversation history
Send follow-up questions through the existing chat form
Keep responses focused on the routine and beauty topics
Return the AI response to the chat window
Add accessible live updates for chat responses
Improve loading and connection-error states
Check: Users can ask for routine adjustments and receive contextual answers.


Phase 6: Worker reliability and security
Goal: Harden the existing Worker.

Validate incoming JSON and messages
Keep the system prompt controlled by the Worker
Return clear HTTP error statuses
Limit request size and message count
Add rate limiting
Restrict or validate allowed origins
Preserve OpenAI upstream error information
Optionally switch to gpt-4.1 if required
Check: Invalid requests are rejected safely and abusive or accidental repeated usage is limited.


Phase 7: Refinement and accessibility
Goal: Polish the complete experience.

Apply the L’Oréal red and gold branding
Improve product-card states and animations
Make the selected-products panel clearer
Improve mobile layout
Add keyboard support
Add screen-reader announcements
Improve focus and hover states
Replace placeholder footer content if still needed
Check color contrast and narrow-screen behavior
Check: The experience is usable with a keyboard and looks consistent on mobile and desktop.


Phase 8A: RTL language support
Add a language-direction toggle
Apply dir="rtl" to the page or relevant sections
Adjust text alignment and controls
Verify the product grid and selected-products panel
Verify chat message alignment and form controls

Phase 8B: Product search enhancements
This could be merged into Phase 3, but extra-credit tracking can treat it separately.
Add keyword matching
Preserve category filtering
Improve matching for accents or partial words
Add a clear-search button


Phase 8C: Web search
Update or replace the Worker integration
Configure a model or tool that supports web search
Return links and citations in generated answers
Display citations clearly in the chat
Add safeguards for current and L’Oréal-related information