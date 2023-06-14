import { Range, TextEditor } from "@cursorless/common";
import { range } from "lodash";
import { BorderStyle, DecoratedRange } from "./getDecorationRanges.types";
import { handleMultipleLines } from "./handleMultipleLines";

export function* generateDecorationsForRange(
  editor: TextEditor,
  tokenRange: Range,
): Iterable<DecoratedRange> {
  if (tokenRange.isSingleLine) {
    yield {
      range: tokenRange,
      style: {
        top: BorderStyle.solid,
        right: BorderStyle.solid,
        bottom: BorderStyle.solid,
        left: BorderStyle.solid,
      },
    };
    return;
  }

  const { document } = editor;
  const lineRanges = range(tokenRange.start.line, tokenRange.end.line + 1).map(
    (lineNumber) => document.lineAt(lineNumber).range,
  );
  lineRanges[0] = lineRanges[0].with(tokenRange.start);
  lineRanges[lineRanges.length - 1] = lineRanges[lineRanges.length - 1].with(
    undefined,
    tokenRange.end,
  );

  yield* handleMultipleLines(lineRanges);
}
