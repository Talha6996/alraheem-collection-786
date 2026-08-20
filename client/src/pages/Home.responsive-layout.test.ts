import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("homepage responsive hero layout", () => {
  it("caps the desktop composition and gives the portrait image a mobile-safe frame", () => {
    expect(stylesheet).toContain("height: clamp(520px, calc(100svh - 185px), 680px)");
    expect(stylesheet).toContain("grid-template-columns: minmax(0, 1fr) clamp(420px, 32vw, 500px)");
    expect(stylesheet).toContain(".hero-visual { height: auto; min-height: 0; aspect-ratio: 4 / 5; }");
    expect(stylesheet).toContain(".hero-visual > img { object-position: center top; }");
  });
});
