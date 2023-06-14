import { Range } from "@cursorless/common";
import { BorderStyle, DecoratedRange } from "./getDecorationRanges.types";

export function* handleLineDecorations(lineRanges: Range[]): Iterable<DecoratedRange> {
  const startLine = lineRanges[0].start.line;
  const endLine = lineRanges[lineRanges.length - 1].end.line;

  const lineCount = lineRanges.length;

  if (lineCount === 1) {
    yield {
      range: new Range(startLine, 0, startLine, 0),
      style: {
        top: BorderStyle.solid,
        right: BorderStyle.none,
        bottom: BorderStyle.solid,
        left: BorderStyle.none,
        isWholeLine: true,
      },
    };
    return;
  }

  yield {
    range: new Range(startLine, 0, startLine, 0),
    style: {
      top: BorderStyle.solid,
      right: BorderStyle.none,
      bottom: BorderStyle.none,
      left: BorderStyle.none,
      isWholeLine: true,
    },
  };

  if (lineCount > 2) {
    yield {
      range: new Range(startLine + 1, 0, endLine - 1, 0),
      style: {
        top: BorderStyle.none,
        right: BorderStyle.none,
        bottom: BorderStyle.none,
        left: BorderStyle.none,
        isWholeLine: true,
      },
    };
  }

  yield {
    range: new Range(endLine, 0, endLine, 0),
    style: {
      top: BorderStyle.none,
      right: BorderStyle.none,
      bottom: BorderStyle.solid,
      left: BorderStyle.none,
      isWholeLine: true,
    },
  };
}
