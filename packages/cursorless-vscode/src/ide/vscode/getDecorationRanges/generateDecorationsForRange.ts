import { Range, TextEditor } from "@cursorless/common";
import { range } from "lodash";
import { DecoratedRange } from "./getDecorationRanges.types";

export function* generateDecorationsForRange(
  editor: TextEditor,
  tokenRange: Range,
): Iterable<DecoratedRange> {
  if (tokenRange.isSingleLine) {
    yield {
      range: tokenRange,
      style: {
        top: true,
        bottom: true,
        left: true,
        right: true,
      },
    };
    return;
  }

  const { document } = editor;
  const lineRanges = range(tokenRange.start.line, tokenRange.end.line + 1).map(
    (lineNumber) => document.lineAt(lineNumber).range,
  );
  lineRanges[0] = lineRanges[0].intersection(tokenRange)!;
  lineRanges[lineRanges.length - 1] =
    lineRanges[lineRanges.length - 1].intersection(tokenRange)!;

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

function* handleTwoLines(lineRanges: Range[]) {
  const [firstLine, secondLine] = lineRanges;
  const {
    start: { character: firstLineStart },
    end: { character: firstLineEnd },
  } = firstLine;
  const {
    start: { character: secondLineStart },
    end: { character: secondLineEnd },
  } = secondLine;

  if (firstLineStart >= secondLineEnd) {
    yield {
      range: firstLine,
      style: {
        top: true,
        bottom: true,
        left: true,
        right: false,
      },
    };

    yield {
      range: secondLine,
      style: {
        top: true,
        bottom: true,
        left: false,
        right: true,
      },
    };

    return;
  }

  yield {
    range:
      firstLineEnd <= secondLineEnd
        ? firstLine
        : firstLine.with(undefined, secondLine.end.with(firstLine.start.line)),
    style: {
      top: true,
      bottom: false,
      left: true,
      right: false,
    },
  };

  if (firstLineEnd > secondLineEnd) {
    yield {
      range: firstLine.with(secondLine.end.with(firstLine.start.line)),
      style: {
        top: true,
        bottom: true,
        left: false,
        right: false,
      },
    };
  }

  if (secondLineStart < firstLineStart) {
    yield {
      range: secondLine.with(
        undefined,
        firstLine.start.with(secondLine.start.line),
      ),
      style: {
        top: true,
        bottom: true,
        left: false,
        right: secondLineEnd <= firstLineStart,
      },
    };
  }

  if (secondLineEnd > firstLineStart) {
    yield {
      range:
        secondLineStart >= firstLineStart
          ? secondLine
          : secondLine.with(
              firstLine.start.with(secondLine.start.line),
              undefined,
            ),
      style: {
        top: false,
        bottom: true,
        left: false,
        right: true,
      },
    };
  }
}
