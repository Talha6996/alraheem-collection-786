import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./Account.tsx", import.meta.url), "utf8");

describe("Account saved preferences", () => {
  it("hydrates editable fields from the profile and uses controlled inputs", () => {
    expect(source).toContain('setFullName(data.profile.full_name || "")');
    expect(source).toContain('setPhone(data.profile.phone || "")');
    expect(source).toContain('setCity(data.profile.city || "")');
    expect(source).toContain('setAddressLine(data.profile.address_line || "")');
    expect(source).toContain('value={fullName}');
    expect(source).toContain('value={phone}');
    expect(source).toContain('value={city}');
    expect(source).toContain('value={addressLine}');
    expect(source).not.toContain('defaultValue={profile.full_name');
  });
});
