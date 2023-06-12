import { Range } from "@cursorless/common";
import { DecoratedRange } from "./getDecorationRanges.types";
import {
  TOP_BOTTOM_LEFT,
  TOP_BOTTOM_RIGHT,
  TOP_LEFT,
  TOP_BOTTOM,
  BOTTOM_RIGHT,
} from "./borderStyles";
import { singleLineRange } from "./singleLineRange";

export function* handleTwoLines(lineRanges: Range[]): Iterable<DecoratedRange> {
  const [firstLine, secondLine] = lineRanges;
  const {
    start: { character: firstLineStart, line: firstLineNumber },
    end: { character: firstLineEnd },
  } = firstLine;
  const {
    start: { line: secondLineNumber },
    end: { character: secondLineEnd },
  } = secondLine;

  if (firstLineStart >= secondLineEnd) {
    yield {
      range: firstLine,
      style: TOP_BOTTOM_LEFT,
    };

    yield {
      range: secondLine,
      style: TOP_BOTTOM_RIGHT,
    };

    return;
  }

  yield {
    range: singleLineRange(
      firstLineNumber,
      firstLineStart,
      Math.min(firstLineEnd, secondLineEnd),
    ),
    style: TOP_LEFT,
  };

  if (firstLineEnd > secondLineEnd) {
    yield {
      range: singleLineRange(firstLineNumber, secondLineEnd, firstLineEnd),
      style: TOP_BOTTOM,
    };
  }

  if (firstLineStart > 0) {
    yield {
      range: singleLineRange(secondLineNumber, 0, firstLineStart),
      style: TOP_BOTTOM,
    };
  }

  yield {
    range: singleLineRange(secondLineNumber, firstLineStart, secondLineEnd),
    style: BOTTOM_RIGHT,
  };
}
