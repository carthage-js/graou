import { describe, test, expect } from "@jest/globals";

import { defaultMessageFactory } from "./default-message.factory";

describe("defaultMessageFactory", () => {
  test("Basic usage", () => {
    expect(defaultMessageFactory("JEST", "TU", "BASIC_USAGE", null, "Coverage obliged")).toEqual(
      "[JEST:TU:BASIC_USAGE]: Coverage obliged",
    );
  });

  test("On subcode", () => {
    expect(
      defaultMessageFactory("JEST", "TU", "BASIC_USAGE", "SUBCODE", "Coverage obliged"),
    ).toEqual("[JEST:TU:BASIC_USAGE:SUBCODE]: Coverage obliged");
  });
});
