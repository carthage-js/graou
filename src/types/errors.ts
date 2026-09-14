import { GraouError } from "./graou-error";
import { ErrorHelper } from "./error-helper";
import { GraouErrorLookup } from "./grou-error.lookup";

export interface Errors<
  Code extends string,
  Subcode extends string,
  SubcodeBindToCode extends { [key in Code]?: Subcode[] },
> {
  scope: Readonly<{
    name: string;
    $class: typeof GraouError;
    lookup: GraouErrorLookup;
  }>;
  codes: Readonly<{
    [code in Code]: Readonly<
      {
        name: string;
        $class: typeof GraouError;
        lookup: (errorOrLambda: any) => GraouError | undefined;
      } & ErrorHelper &
        (SubcodeBindToCode[code] extends (infer Subcode extends string)[]
          ? {
              subcodes: {
                [subcode in Subcode]: {
                  name: string;
                  $class: typeof GraouError;
                } & ErrorHelper;
              };
            }
          : {})
    >;
  }>;
}
