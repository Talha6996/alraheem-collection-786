import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("StoreShell primary navigation", () => {
  it("keeps the header focused on Shop all, New arrivals, and Sale rather than rendering every category", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/StoreShell.tsx"), "utf8");
    expect(source).toContain('<nav className="main-nav main-nav--primary"');
    expect(source).toContain('<Link href="/shop">Shop all</Link>');
    expect(source).toContain('<Link href="/new-arrivals">New arrivals</Link>');
    expect(source).toContain('<Link href="/sale">Sale</Link>');
    expect(source).not.toContain("const navigation = STORE_CATEGORIES.map");
    expect(source).not.toContain("{navigation.map(");
  });
});
