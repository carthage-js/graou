import { Errors } from "./errors";

export type ErrorsFactory<
  Code extends string,
  Subcode extends string,
  SubcodeBindToCode extends { [key in Code]?: Subcode[] },
> = (
  scope: string,
  codes: Code[],
  subcodes?: SubcodeBindToCode,
) => Errors<Code, Subcode, SubcodeBindToCode>;
