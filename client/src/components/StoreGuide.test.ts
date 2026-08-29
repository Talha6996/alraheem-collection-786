import { describe, expect, it } from "vitest";
import { getInstantGuideReply } from "@/lib/storeGuideInstant";

describe("getInstantGuideReply", () => {
  it("answers greetings immediately", () => {
    const reply = getInstantGuideReply("hi");
    expect(reply?.content).toContain("Hello");
  });

  it("answers verified delivery questions immediately", () => {
    const reply = getInstantGuideReply("How much is delivery to Lahore?");
    expect(reply?.content).toContain("PKR 250");
    expect(reply?.content).toContain("3–6 working days");
  });

  it("returns the live category descriptor immediately", () => {
    const reply = getInstantGuideReply("show me jewellery");
    expect(reply?.category).toMatchObject({ name: "JEWELLERY", collectionHandle: "jewellery" });
    expect(reply?.content).toContain("live jewellery products");
  });

  it("leaves unusual questions for the professional AI route", () => {
    expect(getInstantGuideReply("Can you recommend something for a formal evening event?")).toBeNull();
  });
});
