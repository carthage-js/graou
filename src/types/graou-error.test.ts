import { describe, test, expect } from "@jest/globals";
import { GraouError, graouErrorUidSymbol } from "./graou-error";

describe("graou-error", () => {
  describe("lookup", () => {
    const e3 = new Error("msg");
    const e2 = new GraouError("jest2", "tu", "2", "SUBCODE", "Err 2", "Err 2", { cause: e3 });
    Object.defineProperty(e2, graouErrorUidSymbol, {
      get: () => "TEST_UID",
    });
    const e1 = new GraouError("jest", "tu", "1", null, "Err 1", "Err 1", { cause: e2 });

    test("lookup by scope only", () => {
      expect(e1.lookup({ scope: "tu" })).toEqual(e1);
      expect(e2.lookup({ scope: "tu" })).toEqual(e2);
    });

    test("lookup by scope and uid", () => {
      expect(e1.lookup({ scope: "tu", uid: "TEST_UID" })).toEqual(e2);
      expect(e2.lookup({ scope: "tu", uid: "TEST_UID" })).toEqual(e2);
    });

    test("lookup by scope and nodeModule", () => {
      expect(e1.lookup({ nodeModule: "jest", scope: "tu" })).toEqual(e1);
      expect(e1.lookup({ nodeModule: "jest2", scope: "tu" })).toEqual(e2);
      expect(e2.lookup({ nodeModule: "jest", scope: "tu" })).toBeUndefined();
      expect(e2.lookup({ nodeModule: "jest2", scope: "tu" })).toEqual(e2);
    });

    test("lookup by scope and code", () => {
      expect(e1.lookup({ scope: "tu", code: "1" })).toEqual(e1);
      expect(e1.lookup({ scope: "tu", code: "2" })).toEqual(e2);
      expect(e1.lookup({ scope: "tu", code: "3" })).toBeUndefined();

      expect(e2.lookup({ scope: "tu", code: "1" })).toBeUndefined();
      expect(e2.lookup({ scope: "tu", code: "2" })).toEqual(e2);
      expect(e2.lookup({ scope: "tu", code: "3" })).toBeUndefined();
    });

    test("lookup by scope, code and uid", () => {
      expect(e1.lookup({ scope: "tu", code: "1", uid: "TEST_UID" })).toBeUndefined();
      expect(e1.lookup({ scope: "tu", code: "2", uid: "TEST_UID" })).toEqual(e2);
      expect(e1.lookup({ scope: "tu", code: "3", uid: "TEST_UID" })).toBeUndefined();

      expect(e2.lookup({ scope: "tu", code: "1", uid: "TEST_UID" })).toBeUndefined();
      expect(e2.lookup({ scope: "tu", code: "2", uid: "TEST_UID" })).toEqual(e2);
      expect(e2.lookup({ scope: "tu", code: "3", uid: "TEST_UID" })).toBeUndefined();
    });

    test("lookup by scope, code and subcode", () => {
      expect(e1.lookup({ scope: "tu", code: "1", subcode: "SUBCODE" })).toBeUndefined();
      expect(e1.lookup({ scope: "tu", code: "2", subcode: "SUBCODE" })).toEqual(e2);
      expect(e1.lookup({ scope: "tu", code: "3", subcode: "SUBCODE" })).toBeUndefined();

      expect(e2.lookup({ scope: "tu", code: "1", subcode: "SUBCODE" })).toBeUndefined();
      expect(e2.lookup({ scope: "tu", code: "2", subcode: "SUBCODE" })).toEqual(e2);
      expect(e2.lookup({ scope: "tu", code: "3", subcode: "SUBCODE" })).toBeUndefined();
    });
  });

  describe("toJson", () => {
    test("Basic usage", () => {
      const e3 = new Error("msg");
      const e2 = new GraouError("jest", "tu", "2", "SUBCODE", "Err 2", "Err 2", { cause: e3 });
      const e1 = new GraouError("jest", "tu", "1", null, "Err 1", "Err 1", { cause: e2 });

      expect(e1.toJSON()).toEqual({
        nodeModule: "jest",
        scope: "tu",
        code: "1",
        reason: "Err 1",
        cause: {
          nodeModule: "jest",
          scope: "tu",
          code: "2",
          reason: "Err 2",
          subcode: "SUBCODE",
          cause: "msg",
        },
      });
    });

    test("Don't display cause on unpredictable type", () => {
      const e1 = new GraouError("jest", "tu", "1", null, "Err 1", "Err 1", {
        cause: {
          sensitiveData: "BAD BAD BAD TO LOG",
        },
      });

      expect(e1.toJSON()).toEqual({
        nodeModule: "jest",
        scope: "tu",
        code: "1",
        reason: "Err 1",
      });
    });

    test("Return root json", () => {
      const e3 = new GraouError("jest", "tu", "3", null, "Err 3", "Err 3");
      const e2 = new GraouError("jest", "tu", "2", "SUBCODE", "Err 2", "Err 2", { cause: e3 });
      const e1 = new GraouError("jest", "tu", "1", null, "Err 1", "Err 1", { cause: e2 });

      expect(e1.toJSON(0)).toEqual({
        nodeModule: "jest",
        scope: "tu",
        code: "1",
        reason: "Err 1",
      });

      expect(e1.toJSON(-1)).toEqual({
        nodeModule: "jest",
        scope: "tu",
        code: "1",
        reason: "Err 1",
      });
    });

    test("Return a partial json", () => {
      const e3 = new GraouError("jest", "tu", "3", null, "Err 3", "Err 3");
      const e2 = new GraouError("jest", "tu", "2", "SUBCODE", "Err 2", "Err 2", { cause: e3 });
      const e1 = new GraouError("jest", "tu", "1", null, "Err 1", "Err 1", { cause: e2 });

      expect(e1.toJSON(1)).toEqual({
        nodeModule: "jest",
        scope: "tu",
        code: "1",
        reason: "Err 1",
        cause: {
          nodeModule: "jest",
          scope: "tu",
          code: "2",
          reason: "Err 2",
          subcode: "SUBCODE",
        },
      });
    });

    test("Avoid infinite loop", () => {
      const e3 = new GraouError("jest", "tu", "3", null, "Err 3", "Err 3");
      const e2 = new GraouError("jest", "tu", "2", "SUBCODE", "Err 2", "Err 2", { cause: e3 });
      const e1 = new GraouError("jest", "tu", "1", null, "Err 1", "Err 1", { cause: e2 });

      e3.cause = e1;

      expect(e1.toJSON(10)).toEqual({
        nodeModule: "jest",
        scope: "tu",
        code: "1",
        reason: "Err 1",
        cause: {
          nodeModule: "jest",
          scope: "tu",
          code: "2",
          reason: "Err 2",
          subcode: "SUBCODE",
          cause: {
            nodeModule: "jest",
            scope: "tu",
            code: "3",
            reason: "Err 3",
            cause: {
              recursive: true,
              referTo: 0,
            },
          },
        },
      });
    });
  });
});
