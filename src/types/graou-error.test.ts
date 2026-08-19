import { GraouError } from "./graou-error";

describe("graou-error", () => {
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
