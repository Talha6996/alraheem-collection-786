import { afterEach, describe, expect, it, vi } from "vitest";
import { askGeminiStoreGuide, findGuideCategory } from "./geminiStoreGuide";

describe("Gemini storefront guide", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("sends the key only as a server request header and returns the generated text", async () => {
    vi.stubEnv("GEMINI_API_KEY", "server-only-key");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ output_text: "Delivery is PKR 250." }) });
    vi.stubGlobal("fetch", fetchMock);

    await expect(askGeminiStoreGuide("What is your design philosophy?", [])).resolves.toBe("Delivery is PKR 250.");
    expect(fetchMock).toHaveBeenCalledWith("https://generativelanguage.googleapis.com/v1beta/interactions", expect.objectContaining({ headers: expect.objectContaining({ "x-goog-api-key": "server-only-key" }) }));
    const requestOptions = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(String(requestOptions.body)).not.toContain("server-only-key");
    expect(JSON.parse(String(requestOptions.body))).toMatchObject({ model: "gemini-3.6-flash" });
  });

  it("includes professional instructions and conversation context in the server request", async () => {
    vi.stubEnv("GEMINI_API_KEY", "server-only-key");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ output_text: "For Lahore, delivery is estimated at 2–4 working days." }) });
    vi.stubGlobal("fetch", fetchMock);

    await askGeminiStoreGuide("How should I choose?", [{ role: "user", content: "I am deciding between two options." }]);

    const requestOptions = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(requestOptions.body));
    expect(body.input).toContain("Answer the shopper's latest question directly and specifically");
    expect(body.input).toContain("I am deciding between two options.");
    expect(body.input).toContain("2–4 working days");
    expect(body.input).toContain("Never invent a price, discount, stock quantity");
  });

  it("answers verified routine questions instantly without calling the provider", async () => {
    vi.stubEnv("GEMINI_API_KEY", "server-only-key");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(askGeminiStoreGuide("How much is delivery?", [])).resolves.toContain("PKR 250");
    await expect(askGeminiStoreGuide("Can I order on WhatsApp?", [])).resolves.toContain("+92 336 1243334");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a helpful greeting when the provider is temporarily unavailable", async () => {
    vi.stubEnv("GEMINI_API_KEY", "server-only-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    await expect(askGeminiStoreGuide("hi", [])).resolves.toContain("Welcome to ALRAHEEM COLLECTION 786");
  });

  it("answers city-specific delivery questions safely during provider fallback", async () => {
    vi.stubEnv("GEMINI_API_KEY", "server-only-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    await expect(askGeminiStoreGuide("How long to Lahore and what is delivery fee?", [])).resolves.toContain("2–4 working days");
    await expect(askGeminiStoreGuide("How much is delivery?", [])).resolves.toContain("PKR 250");
  });

  it("answers payment questions without promising unverified payment methods", async () => {
    vi.stubEnv("GEMINI_API_KEY", "server-only-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    const answer = await askGeminiStoreGuide("Can I pay with JazzCash or card?", []);
    expect(answer).toContain("confirm with our team");
    expect(answer).toContain("+92 336 1243334");
  });

  it("guides product questions to the product page and WhatsApp without guessing", async () => {
    vi.stubEnv("GEMINI_API_KEY", "server-only-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    const answer = await askGeminiStoreGuide("Is the blue bridal set in stock and what size is it?", []);
    expect(answer).toContain("product page");
    expect(answer).toContain("WhatsApp");
  });

  it("maps natural category requests to verified collection handles", () => {
    expect(findGuideCategory("Show me some pretty jewellery")).toMatchObject({ name: "JEWELLERY", collectionHandle: "jewellery" });
    expect(findGuideCategory("Do you have party wear?")).toMatchObject({ name: "PARTY SET", collectionHandle: "party-set" });
    expect(findGuideCategory("I need a ladies suit")).toMatchObject({ name: "LADIES SUIT", collectionHandle: "ladies-suit" });
    expect(findGuideCategory("What payment methods do you accept?")).toBeUndefined();
  });

  it("reads text from Gemini's current interaction steps response", async () => {
    vi.stubEnv("GEMINI_API_KEY", "server-only-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ steps: [{ type: "thought" }, { type: "model_output", content: [{ type: "text", text: "Hello from the store guide." }] }] }),
    }));

    await expect(askGeminiStoreGuide("Describe the mood of the brand.", [])).resolves.toBe("Hello from the store guide.");
  });
});
