import graou, { ErrorHelper } from "@carthage-js/graou";
import fs from "fs";
import fsPromises from "fs/promises";

// The idea is to create a loader that is error less.
// Use a error factory to hint where the code is used.
// More important the stacktrace could be painful to read on minified code.
function makeJsonLoader(errorHelper: ErrorHelper): (file: string) => any {
  return (file) => {
    try {
      return JSON.parse(fs.readFileSync(file, "utf-8"));
    } catch (cause: any) {
      throw errorHelper.factory("Unable to load JSON data", { cause });
    }
  };
}

function makeJsonAsyncLoader(errorHelper: ErrorHelper): (file: string) => Promise<any> {
  return (file) =>
    errorHelper.with({ reason: "Unable to load JSON data" }).trap(async () =>
      JSON.parse(
        await fsPromises.readFile(file, {
          encoding: "utf-8",
        }),
      ),
    );
}

const errorsFactory = graou.makeModuleErrorsFactory({
  moduleName: "loader",
});

const errors = errorsFactory("LOADER", ["FUNCTION_A", "FUNCTION_B"]);

console.log("### On undefined file ###");
const loaderA = makeJsonLoader(errors.codes.FUNCTION_A);
try {
  loaderA(`${__dirname}/undefined.json`);
} catch (err) {
  console.log(err);
}

console.log("### On bad syntax file ###");
const loaderB = makeJsonLoader(errors.codes.FUNCTION_B);
try {
  loaderB(`${__dirname}/loader.malformed.json`);
} catch (err) {
  console.log(err);
}

console.log("### Work on async loader ###");
const loaderBAsync = makeJsonAsyncLoader(errors.codes.FUNCTION_B);
loaderBAsync(`${__dirname}/loader.malformed.json`).catch(console.log);
