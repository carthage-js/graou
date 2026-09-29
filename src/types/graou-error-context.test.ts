import { describe, expect, test } from "@jest/globals";
import { GraouErrorContext } from "$project/types/graou-error-context";

describe("GraouErrorContext", () => {
  test("The labels must be always the same array instance to be hydratable on the error factory", () => {
    const context = new GraouErrorContext();
    const labels = context.getLabels();

    expect(labels).toEqual([]);

    context.addLabels("Demo");
    expect(context.getLabels()).toEqual(["Demo"]);
    expect(context.getLabels() === labels).toBeTruthy();

    context.addLabels("2");
    expect(context.getLabels()).toEqual(["Demo", "2"]);
    expect(context.getLabels() === labels).toBeTruthy();

    context.setLabels("reset");
    expect(context.getLabels()).toEqual(["reset"]);
    expect(context.getLabels() === labels).toBeTruthy();
  });

  test("The annotations must be always the same array instance to be hydratable on the error factory", () => {
    const context = new GraouErrorContext();
    const annotations = context.getAnnotations();

    expect(annotations).toEqual([]);

    context.addAnnotations({
      name: "a",
      value: 1,
    });
    expect(context.getAnnotations()).toEqual([
      {
        name: "a",
        value: 1,
      },
    ]);
    expect(context.getAnnotations() === annotations).toBeTruthy();

    context.addAnnotations({
      name: "b",
      value: 2,
    });
    expect(context.getAnnotations()).toEqual([
      {
        name: "a",
        value: 1,
      },
      {
        name: "b",
        value: 2,
      },
    ]);
    expect(context.getAnnotations() === annotations).toBeTruthy();

    context.setAnnotations({
      name: "b",
      value: "reset",
    });
    expect(context.getAnnotations()).toEqual([
      {
        name: "b",
        value: "reset",
      },
    ]);
    expect(context.getAnnotations() === annotations).toBeTruthy();
  });
});
