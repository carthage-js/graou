import graou from "@carthage-js/graou";

const errorsFactory = graou.makeModuleErrorsFactory({
  moduleName: "async",
});

const errors = errorsFactory("ASYNC_SCOPE", ["ERROR_A", "ERROR_B", "ERROR_C"]);

function throwOn(options: {
  value: number;
  inc?: number;
  cmp?: (left: number, right: number) => boolean;
}): (current: number) => Promise<number> {
  const cmp = options.cmp || ((left, right) => left === right);
  return async (current) => {
    if (cmp(current, options.value)) {
      throw new Error(`Fatal on ${current}`);
    }

    return current + (options.inc ?? 0);
  };
}

function demo(
  testValues: [number, number, number] | null = null,
  options: {
    value?: number;
    inc?: number;
    cmp?: (left: number, right: number) => boolean;
  } = {},
  symbol?: symbol,
): Promise<number> {
  if (!testValues) {
    testValues = [0, 1, 2];
  }
  return Promise.resolve(options.value ?? 0)
    .then(throwOn({ ...options, value: testValues[0] }))
    .catch(errors.codes.ERROR_A.with({ symbol }).$throw<number>)
    .then(throwOn({ ...options, value: testValues[1] }))
    .catch(errors.codes.ERROR_B.with({ symbol }).$throw<number>)
    .then(throwOn({ ...options, value: testValues[2] }))
    .catch(errors.codes.ERROR_C.with({ symbol }).$throw<number>);
}

async function main() {
  console.log("### Basic usage => decorate everything ###");
  for (const i of [0, 1, 2]) {
    console.log(`=> On ${i}`);
    await demo(null, { value: i }).catch(console.log);
    console.log(`\n`);
  }

  console.log("### Use a symbol to avoid decorate a catch ###");
  for (const i of [0, 1, 2]) {
    console.log(`=> On ${i}`);
    await demo(null, { value: i }, Symbol.for("my demo")).catch(console.log);
    console.log(`\n`);
  }
}

main();
