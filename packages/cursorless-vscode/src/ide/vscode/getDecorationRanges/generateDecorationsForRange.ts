import { Range, TextEditor } from "@cursorless/common";
import { range } from "lodash";
import { DecoratedRange } from "./getDecorationRanges.types";
import { FULL } from "./borderStyles";
import { handleTwoLines } from "./handleTwoLines";
import { handleThreeLines } from "./handleThreeLines";
import { handleManyLines } from "./handleManyLines";

export function* generateDecorationsForRange(
  editor: TextEditor,
  tokenRange: Range,
): Iterable<DecoratedRange> {
  if (tokenRange.isSingleLine) {
    yield {
      range: tokenRange,
      style: FULL,
    };
    return;
  }

  const { document } = editor;
  // TODO: We don't actually need anything other than first and last two lines
  const lineRanges = range(tokenRange.start.line, tokenRange.end.line + 1).map(
    (lineNumber) => document.lineAt(lineNumber).range,
  );
  lineRanges[0] = lineRanges[0].with(tokenRange.start);
  lineRanges[lineRanges.length - 1] = lineRanges[lineRanges.length - 1].with(
    undefined,
    tokenRange.end,
  );

  const lineCount = lineRanges.length;

  switch (lineCount) {
    case 2:
      yield* handleTwoLines(lineRanges);
      break;
    case 3:
      yield* handleThreeLines(lineRanges);
      break;
    default:
      yield* handleManyLines(lineRanges);
      break;
  }
}
