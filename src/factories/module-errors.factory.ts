import { ModuleOptions } from "$project/types";
import { Errors } from "$project/types/errors";
import { InternalModuleOptions } from "$project/types/internal-module-options";
import { defaultMessageFactory } from "./default-message.factory";
import { makeErrors } from "./errors.factory";

export function makeModuleErrorsFactory(
  moduleOptions: ModuleOptions,
): <
  Code extends string,
  Subcode extends string,
  SubcodeBindToCode extends { [key in Code]?: Subcode[] },
>(
  scope: string,
  codes: Code[],
  subcodes?: SubcodeBindToCode,
) => Errors<Code, Subcode, SubcodeBindToCode> {
  const internalOptions: InternalModuleOptions = {
    ...moduleOptions,
    messageFactory: moduleOptions.messageFactory || defaultMessageFactory,
  };
  return <
    Code extends string,
    Subcode extends string,
    SubcodeBindToCode extends { [key in Code]?: Subcode[] },
  >(
    scope: string,
    codes: Code[],
    subcodes?: SubcodeBindToCode,
  ) => makeErrors<Code, Subcode, SubcodeBindToCode>(internalOptions, scope, codes, subcodes);
}
