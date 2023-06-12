import { Range } from "@cursorless/common";
import { DecoratedRange } from "./getDecorationRanges.types";
import { BOTTOM, BOTTOM_RIGHT, NONE, TOP, TOP_LEFT } from "./borderStyles";
import { singleLineRange } from "./singleLineRange";

export function* handleManyLines(
  lineRanges: Range[],
): Iterable<DecoratedRange> {
  const [firstLine, secondLine, ...lastLines] = lineRanges;
  const secondLastLine = lastLines[lastLines.length - 2];
  const lastLine = lastLines[lastLines.length - 1];
  const {
    start: { character: firstLineStart },
  } = firstLine;
  const {
    start: { line: secondLineNumber },
  } = secondLine;
  const {
    start: { line: secondLastLineNumber },
    end: { character: secondLastLineEnd },
  } = secondLastLine;
  const {
    end: { character: lastLineEnd },
  } = lastLine;

  yield {
    range: firstLine,
    style: TOP_LEFT,
  };

  if (firstLineStart > 0) {
    yield {
      range: singleLineRange(secondLineNumber, 0, firstLineStart),
      style: TOP,
    };
  }

  yield {
    range: new Range(
      secondLineNumber,
      firstLineStart,
      secondLastLineNumber,
      Math.min(secondLastLineEnd, lastLineEnd),
    ),
    style: NONE,
  };

  if (secondLastLineEnd > lastLineEnd) {
    yield {
      range: singleLineRange(
        secondLastLineNumber,
        lastLineEnd,
        secondLastLineEnd,
      ),
      style: BOTTOM,
    };
  }

  yield {
    range: lastLine,
    style: BOTTOM_RIGHT,
  };
}
