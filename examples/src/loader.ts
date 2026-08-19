import graou, { GraouErrorFactory } from "@carthage-js/graou";
import fs from "fs";

// The idea is to create a loader that is error less.
// Use a error factory to hint where the code is used.
// More important the stacktrace could be painful to read on minified code.
function makeJsonLoader(errorFactory: GraouErrorFactory): (file: string) => any {
  return (file) => {
    try {
      return JSON.parse(fs.readFileSync(file, "utf-8"));
    } catch (cause: any) {
      throw errorFactory("Unable to load JSON data", { cause });
    }
  };
}

const errorsFactory = graou.makeModuleErrorsFactory({
  moduleName: "loader",
});

const errors = errorsFactory("LOADER", ["FUNCTION_A", "FUNCTION_B"]);

console.log("### On undefined file ###");
const loaderA = makeJsonLoader(errors.codes.FUNCTION_A.factory);
try {
  loaderA(`${__dirname}/undefined.json`);
} catch (err) {
  console.log(err);
}

console.log("### On bad syntax file ###");
const loaderB = makeJsonLoader(errors.codes.FUNCTION_B.factory);
try {
  loaderB(`${__dirname}/loader.malformed.json`);
} catch (err) {
  console.log(err);
}
