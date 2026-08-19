export type MessageFactory = (
  nodeModule: string,
  scope: string,
  code: string,
  subcode: string | null,
  reason: string,
) => string;
