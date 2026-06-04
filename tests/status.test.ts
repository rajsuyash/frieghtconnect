import { describe, it, expect } from "vitest";
import {
  canTransition,
  isPubliclyVisible,
  verifiedIsConsistent,
} from "@/lib/forwarders/status";

describe("forwarder status transitions", () => {
  it("allows draft → pending (submit)", () => {
    expect(canTransition("draft", "pending")).toBe(true);
  });
  it("allows pending → approved and pending → rejected", () => {
    expect(canTransition("pending", "approved")).toBe(true);
    expect(canTransition("pending", "rejected")).toBe(true);
  });
  it("allows approved → suspended and suspended → approved", () => {
    expect(canTransition("approved", "suspended")).toBe(true);
    expect(canTransition("suspended", "approved")).toBe(true);
  });
  it("forbids draft → approved (must be reviewed first)", () => {
    expect(canTransition("draft", "approved")).toBe(false);
  });
  it("forbids approving an already-approved profile", () => {
    expect(canTransition("approved", "approved")).toBe(false);
  });
});

describe("public visibility", () => {
  it("is visible only when approved", () => {
    expect(isPubliclyVisible("approved")).toBe(true);
    for (const s of ["draft", "pending", "rejected", "suspended"] as const) {
      expect(isPubliclyVisible(s)).toBe(false);
    }
  });
});

describe("verified invariant", () => {
  it("verified=true requires status=approved", () => {
    expect(verifiedIsConsistent("approved", true)).toBe(true);
    expect(verifiedIsConsistent("pending", true)).toBe(false);
    expect(verifiedIsConsistent("approved", false)).toBe(true);
    expect(verifiedIsConsistent("draft", false)).toBe(true);
  });
});
