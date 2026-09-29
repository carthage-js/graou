import graou, { GraouError, GraouErrorContext } from "@carthage-js/graou";

const errorsFactory = graou.makeModuleErrorsFactory({
  moduleName: "DecoratedClass",
});

@graou.decorators.AutoErrors(errorsFactory)
class Test {
  private _graouErrorContext!: GraouErrorContext;

  a() {
    this._graouErrorContext.addLabels("Label on error a");
    this.b();
  }

  b() {
    this._graouErrorContext.addLabels("Label on error b");
    throw new Error("Failed from B");
  }
}

const instance = new Test();
console.log("### Call method A & B ###");
try {
  instance.a();
} catch (err) {
  if (err instanceof GraouError) {
    console.error(err.toJSON());
  }
}

console.log("### Recall method A & B to proof that the magic context is unique ###");
try {
  instance.a();
} catch (err) {
  if (err instanceof GraouError) {
    console.error(err.toJSON());
  }
}
