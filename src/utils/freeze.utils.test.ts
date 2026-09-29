import { describe, expect, test } from "@jest/globals";
import { deepFreeze } from "$project/utils/freeze.utils";

describe("deepFreeze", () => {
  test("I shouldn't be able to alter a prop on an object", () => {
    const result = deepFreeze({ a: 0 });
    expect(() => (result.a = 1000)).toThrow("read only");
  });

  test("I shouldn't be able to alter an item on an array", () => {
    const result = deepFreeze([0, 1, 2]);
    expect(() => (result[0] = 100)).toThrow("read only");
  });

  test("I shouldn't be able to remove an item on an array", () => {
    const result = deepFreeze([0, 1, 2]);
    expect(() => result.pop()).toThrow("Cannot delete");
  });

  test("I shouldn't be able to add an item on an array", () => {
    const result = deepFreeze([0, 1, 2]);
    expect(() => result.push(3)).toThrow("Cannot add");
  });

  test("A nested object is also frozen", () => {
    const result = deepFreeze({
      a: {
        b: [0, 1, 2],
      },
    });
    expect(() => (result.a.b[0] = 100)).toThrow("read only");
  });
});
