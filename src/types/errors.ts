import { GraouErrorFactory } from "./graou-error.factory";
import { GraouError } from "./graou-error";

export interface Errors<
  Code extends string,
  Subcode extends string,
  SubcodeBindToCode extends { [key in Code]?: Subcode[] },
> {
  scope: Readonly<{
    name: string;
    $class: typeof GraouError;
  }>;
  codes: Readonly<{
    [code in Code]: Readonly<
      {
        name: string;
        $class: typeof GraouError;
      } & (SubcodeBindToCode[code] extends (infer Subcode extends string)[]
        ? {
            subcodes: {
              [subcode in Subcode]: {
                name: string;
                $class: typeof GraouError;
                factory: GraouErrorFactory;
              };
            };
          }
        : {
            factory: GraouErrorFactory;
          })
    >;
  }>;
}
