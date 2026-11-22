// Copy this code into your Cloudflare Worker script

//phase six

const requestCounts = new Map();
const MAX_REQUESTS_PER_MINUTE = 10;
const MAX_MESSAGE_COUNT = 20;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_REQUEST_LENGTH = 30000;

const systemPrompt = `
You are a helpful L'Oréal beauty assistant.

Only answer questions about L'Oréal products, skincare, haircare, makeup,
fragrances, beauty routines, and beauty recommendations.

If a question is unrelated to L'Oréal or beauty, politely explain that you
can only help with L'Oréal products and beauty-related topics.

Do not diagnose medical conditions. For serious skin, hair, or health concerns,
recommend speaking with a qualified medical professional.

After a routine is generated, answer follow-up questions about that routine,
the selected products, and general beauty topics. Refer to earlier parts of
the conversation when helpful.
`;

export default {
  async fetch(request, env) {
    const requestOrigin = request.headers.get('Origin');
    const allowedOrigin = env.ALLOWED_ORIGIN?.trim();
    const responseOrigin = allowedOrigin || requestOrigin || '*';
    const corsHeaders = {
      'Access-Control-Allow-Origin': responseOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (allowedOrigin && requestOrigin && requestOrigin !== allowedOrigin) {
      return new Response(JSON.stringify({ error: 'This origin is not allowed.' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Only POST requests are supported.' }), {
        status: 405,
        headers: corsHeaders
      });
    }

    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'The OpenAI service is not configured.' }), {
        status: 500,
        headers: corsHeaders
      });
    }

    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength > MAX_REQUEST_LENGTH) {
      return new Response(JSON.stringify({ error: 'Request is too large.' }), {
        status: 413,
        headers: corsHeaders
      });
    }

    const clientAddress =
      request.headers.get('CF-Connecting-IP') ||
      request.headers.get('X-Forwarded-For') ||
      'unknown';
    const now = Date.now();
    const windowStart = now - 60000;
    const recentRequests = (requestCounts.get(clientAddress) || [])
      .filter((timestamp) => timestamp > windowStart);

    if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait a minute.' }), {
        status: 429,
        headers: {
          ...corsHeaders,
          'Retry-After': '60'
        }
      });
    }

    recentRequests.push(now);
    requestCounts.set(clientAddress, recentRequests);

    let userInput;
    try {
      userInput = await request.json();
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Request body must be valid JSON.' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (!userInput || !Array.isArray(userInput.messages) || userInput.messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Request body must include a non-empty messages array.' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (
      Object.prototype.hasOwnProperty.call(userInput, 'webSearch') &&
      typeof userInput.webSearch !== 'boolean'
    ) {
      return new Response(JSON.stringify({ error: 'webSearch must be true or false.' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (userInput.messages.length > MAX_MESSAGE_COUNT) {
      return new Response(JSON.stringify({ error: 'Conversation history is too long.' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (JSON.stringify(userInput).length > MAX_REQUEST_LENGTH) {
      return new Response(JSON.stringify({ error: 'Request is too large.' }), {
        status: 413,
        headers: corsHeaders
      });
    }

    const validRoles = ['system', 'user', 'assistant'];
    const messagesAreValid = userInput.messages.every((message) => (
      message &&
      validRoles.includes(message.role) &&
      typeof message.content === 'string' &&
      message.content.trim().length > 0 &&
      message.content.length <= MAX_MESSAGE_LENGTH
    ));

    if (!messagesAreValid) {
      return new Response(JSON.stringify({
        error: 'Each message must include a valid role and non-empty text content within the size limit.'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const messages = userInput.messages
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .slice(-MAX_MESSAGE_COUNT);

    if (messages.length === 0) {
      return new Response(JSON.stringify({
        error: 'Each message must include a valid role and non-empty text content.'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    let response;
    try {
      if (userInput.webSearch === true) {
        const responseInput = messages
          .filter((message) => message.role === 'user' || message.role === 'assistant')
          .map((message) => ({
            role: message.role,
            content: message.content
          }));

        response = await fetch('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4.1',
            instructions: systemPrompt,
            input: responseInput,
            tools: [{ type: 'web_search_preview' }],
            max_output_tokens: 600
          })
        });
      } else {
        const requestBody = {
          model: 'gpt-4.1',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            ...messages
          ],
          max_completion_tokens: 600,
        };

        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Could not connect to the OpenAI service.' }), {
        status: 502,
        headers: corsHeaders
      });
    }

    let data;
    try {
      data = await response.json();
    } catch (error) {
      return new Response(JSON.stringify({ error: 'The OpenAI service returned an invalid response.' }), {
        status: 502,
        headers: corsHeaders
      });
    }

    if (!response.ok) {
      const status = response.status >= 400 && response.status < 600
        ? response.status
        : 502;
      return new Response(JSON.stringify({
        error: 'The OpenAI service could not complete the request.',
        status: status
      }), {
        status: status,
        headers: corsHeaders
      });
    }

    if (userInput.webSearch === true) {
      const citations = [];
      const outputItems = Array.isArray(data.output) ? data.output : [];

      outputItems.forEach((outputItem) => {
        const contentItems = Array.isArray(outputItem.content)
          ? outputItem.content
          : [];

        contentItems.forEach((contentItem) => {
          const annotations = Array.isArray(contentItem.annotations)
            ? contentItem.annotations
            : [];

          annotations.forEach((annotation) => {
            if (
              annotation.type === 'url_citation' &&
              annotation.url &&
              !citations.some((citation) => citation.url === annotation.url)
            ) {
              citations.push({
                title: annotation.title || 'L\'Oréal or beauty source',
                url: annotation.url
              });
            }
          });
        });
      });

      return new Response(JSON.stringify({
        output_text: data.output_text || '',
        citations: citations
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: corsHeaders
    });
  // phase six end
  }
};
