import { describe, test, expect, beforeEach, jest } from "@jest/globals";

import { makeModuleErrorsFactory } from "./module-errors.factory";

jest.mock("./errors.factory", () => ({
  makeErrors: jest.fn((internalOpts) => internalOpts),
}));

describe("makeModuleErrorsFactory", () => {
  test("Basic usage", () => {
    const factory = makeModuleErrorsFactory({
      moduleName: "JEST",
    });
    const internalOptions = factory("_", []) as any;
    expect(internalOptions.moduleName).toEqual("JEST");
    expect(
      internalOptions.messageFactory("JEST", "TU", "BASIC_USAGE", null, "Coverage obliged"),
    ).toEqual("[JEST:TU:BASIC_USAGE]: Coverage obliged");
  });

  test("Overload message factory", () => {
    const factory = makeModuleErrorsFactory({
      moduleName: "JEST",
      messageFactory: () => "Hello World !!!",
    });
    const internalOptions = factory("_", []) as any;
    expect(internalOptions.moduleName).toEqual("JEST");
    expect(
      internalOptions.messageFactory("JEST", "TU", "BASIC_USAGE", null, "Coverage obliged"),
    ).toEqual("Hello World !!!");
  });
});
