# Gemini Storefront Guide Integration Reference

## Official API facts

Google’s current Gemini documentation recommends the **Interactions API** for new integrations. A server sends a `POST` request to `https://generativelanguage.googleapis.com/v1beta/interactions` with an `x-goog-api-key` header and JSON containing a model and user input. The documented API response exposes generated text as `output_text`. System instructions may be sent server-side to constrain the assistant’s role. [Google Gemini API text generation](https://ai.google.dev/gemini-api/docs/text-generation)

## Storefront implementation decision

The customer browser must never receive the Gemini key. The website will call a protected server procedure, which adds a short ALRAHEEM COLLECTION 786 system instruction and sends only the visitor’s chat message to Gemini. The server will return a concise answer intended to guide visitors through collections, product browsing, delivery information, payment options, and WhatsApp ordering.

## Boundaries

The guide will not promise stock, delivery timing, discounts, refunds, or order status unless the information is explicitly available in the website context. It will direct visitors to WhatsApp for requests that require a human.
