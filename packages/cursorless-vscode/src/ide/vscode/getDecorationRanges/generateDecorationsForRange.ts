import { Range, TextEditor } from "@cursorless/common";
import { range } from "lodash";
import { Borders, DecoratedRange } from "./getDecorationRanges.types";

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
      break;
    case 4:
      break;
    default:
      break;
  }
}

function* handleTwoLines(lineRanges: Range[]): Iterable<DecoratedRange> {
  const [firstLine, secondLine] = lineRanges;
  const {
    start: { character: firstLineStart, line: firstLineNumber },
    end: { character: firstLineEnd },
  } = firstLine;
  const {
    start: { character: secondLineStart, line: secondLineNumber },
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

  if (secondLineStart < firstLineStart) {
    yield {
      range: singleLineRange(secondLineNumber, secondLineStart, firstLineStart),
      style: TOP_BOTTOM,
    };
  }

  yield {
    range: singleLineRange(
      secondLineNumber,
      Math.max(firstLineStart, secondLineStart),
      secondLineEnd,
    ),
    style: BOTTOM_RIGHT,
  };
}

const TOP_LEFT: Borders = {
  top: true,
  left: true,
  right: false,
  bottom: false,
};

const TOP_BOTTOM: Borders = {
  top: true,
  bottom: true,
  left: false,
  right: false,
};

const BOTTOM_RIGHT: Borders = {
  bottom: true,
  right: true,
  top: false,
  left: false,
};

const TOP_BOTTOM_LEFT: Borders = {
  top: true,
  bottom: true,
  left: true,
  right: false,
};

const TOP_BOTTOM_RIGHT: Borders = {
  top: true,
  bottom: true,
  right: true,
  left: false,
};

const FULL: Borders = {
  top: true,
  right: true,
  bottom: true,
  left: true,
};

function singleLineRange(line: number, start: number, end: number): Range {
  return new Range(line, start, line, end);
}
