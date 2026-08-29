import { MessageFactory } from "$project/types/message-factory";

export const defaultMessageFactory: MessageFactory = (
  nodeModule: string,
  scope: string,
  code: string,
  subcode: string | null,
  reason: string | null,
) =>
  `[${nodeModule}:${scope}:${code}${typeof subcode === "string" ? ":" + subcode : ""}]${typeof reason === "string" ? ": " + reason : ""}`;
