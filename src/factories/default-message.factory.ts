import { MessageFactory } from "$project/types/message-factory";

export const defaultMessageFactory: MessageFactory = (
  nodeModule: string,
  scope: string,
  code: string,
  subcode: string | null,
  reason: string,
) =>
  `[${nodeModule}:${scope}:${code}${typeof subcode === "string" ? ":" + subcode : ""}]: ${reason}`;
