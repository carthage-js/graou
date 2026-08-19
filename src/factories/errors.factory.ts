import { GraouError } from "$project/types";
import { Errors } from "$project/types/errors";
import { InternalModuleOptions } from "$project/types/internal-module-options";

export function makeErrors<
  Code extends string,
  Subcode extends string,
  SubcodeBindToCode extends { [key in Code]?: Subcode[] },
>(
  moduleOptions: InternalModuleOptions,
  scope: string,
  codes: Code[],
  subcodes?: SubcodeBindToCode,
): Errors<Code, Subcode, SubcodeBindToCode> {
  const scopeClass = class extends GraouError {
    constructor(code: string, subcode: string | null, reason: string, options?: ErrorOptions) {
      super(
        moduleOptions.moduleName,
        scope,
        code,
        subcode,
        reason,
        moduleOptions.messageFactory(moduleOptions.moduleName, scope, code, subcode, reason),
        options,
      );
    }
  };

  const codesResult: any = {};
  codes.forEach((code) => {
    const codeClass = class extends scopeClass {
      constructor(subcode: string | null, reason: string, options?: ErrorOptions) {
        super(code, subcode, reason, options);
      }
    };

    const subcodesResult: any = Array.isArray(subcodes?.[code]) ? {} : null;
    if (subcodesResult) {
      subcodes![code]!.forEach((subcode) => {
        const subcodeClass = class extends codeClass {
          constructor(reason: string, options?: ErrorOptions) {
            super(subcode, reason, options);
          }
        };

        subcodesResult[subcode] = {
          name: subcode,
          $class: subcodeClass,
          factory: (reason: string, options?: ErrorOptions) => new subcodeClass(reason, options),
        };
      });
    }

    codesResult[code] = {
      name: code,
      $class: codeClass,
      ...(subcodesResult
        ? {
            subcodes: subcodesResult,
          }
        : {
            factory: (reason: string, options?: ErrorOptions) =>
              new codeClass(null, reason, options),
          }),
    };
  });

  return {
    scope: {
      name: scope,
      $class: scopeClass as typeof GraouError,
    },
    codes: codesResult,
  };
}
