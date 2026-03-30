import { describe, expect, it } from "vitest";

import {
  isAboutActionToken,
  stripAboutCopyTokens,
  type AboutCopyToken,
} from "./aboutCopyTokens";

describe("stripAboutCopyTokens", () => {
  it("replaces a single company token with display text", () => {
    expect(stripAboutCopyTokens("Worked at {coinbase}.")).toBe("Worked at Coinbase.");
  });

  it("replaces multiple distinct tokens in one string", () => {
    expect(
      stripAboutCopyTokens("{walmart} and {zalando}"),
    ).toBe("Walmart and Zalando");
  });

  it("replaces action tokens", () => {
    expect(stripAboutCopyTokens("I like to {write} and {photograph}.")).toBe(
      "I like to write and photograph.",
    );
  });

  it("leaves text without tokens unchanged", () => {
    expect(stripAboutCopyTokens("Plain copy.")).toBe("Plain copy.");
  });
});

describe("isAboutActionToken", () => {
  it("returns true only for write and photograph", () => {
    expect(isAboutActionToken("write")).toBe(true);
    expect(isAboutActionToken("photograph")).toBe(true);
  });

  it("returns false for company tokens", () => {
    const company: AboutCopyToken = "coinbase";
    expect(isAboutActionToken(company)).toBe(false);
  });
});
