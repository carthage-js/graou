"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graou_1 = __importDefault(require("@carthage-js/graou"));
const fs_1 = __importDefault(require("fs"));
// The idea is to create a loader that is error less.
// Use a error factory to hint where the code is used.
// More important the stacktrace could be painful to read on minified code.
function makeJsonLoader(errorFactory) {
    return (file) => {
        try {
            return JSON.parse(fs_1.default.readFileSync(file, "utf-8"));
        }
        catch (cause) {
            throw errorFactory("Unable to load JSON data", { cause });
        }
    };
}
const errorsFactory = graou_1.default.makeModuleErrorsFactory({
    moduleName: "loader",
});
const errors = errorsFactory("LOADER", ["FUNCTION_A", "FUNCTION_B"]);
console.log("### On undefined file ###");
const loaderA = makeJsonLoader(errors.codes.FUNCTION_A.factory);
try {
    loaderA(`${__dirname}/undefined.json`);
}
catch (err) {
    console.log(err);
}
console.log("### On bad syntax file ###");
const loaderB = makeJsonLoader(errors.codes.FUNCTION_B.factory);
try {
    loaderB(`${__dirname}/loader.malformed.json`);
}
catch (err) {
    console.log(err);
}
