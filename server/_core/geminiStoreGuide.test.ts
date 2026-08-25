import { afterEach, describe, expect, it, vi } from "vitest";
import { askGeminiStoreGuide } from "./geminiStoreGuide";

describe("Gemini storefront guide", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("sends the key only as a server request header and returns the generated text", async () => {
    vi.stubEnv("GEMINI_API_KEY", "server-only-key");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ output_text: "Delivery is PKR 250." }) });
    vi.stubGlobal("fetch", fetchMock);

    await expect(askGeminiStoreGuide("How much is delivery?", [])).resolves.toBe("Delivery is PKR 250.");
    expect(fetchMock).toHaveBeenCalledWith("https://generativelanguage.googleapis.com/v1beta/interactions", expect.objectContaining({ headers: expect.objectContaining({ "x-goog-api-key": "server-only-key" }) }));
    const requestOptions = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(String(requestOptions.body)).not.toContain("server-only-key");
  });
});
