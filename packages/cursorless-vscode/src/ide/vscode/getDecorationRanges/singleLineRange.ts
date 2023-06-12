import { Range } from "@cursorless/common";

export function singleLineRange(
  line: number,
  start: number,
  end: number,
): Range {
  return new Range(line, start, line, end);
}
