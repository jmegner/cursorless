import { Position, Range, TextEditor } from "@cursorless/common";
import { range } from "lodash";
import { BorderStyle, DecoratedRange } from "./getDecorationRanges.types";
import { handleMultipleLines } from "./handleMultipleLines";
import { handleLineDecorations } from "./handleLineDecorations";

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

  const startType = getEndingType(lineRanges[0], tokenRange.start);
  const endType = getEndingType(
    lineRanges[lineRanges.length - 1],
    tokenRange.end,
  );

  const rangeMode = getRangeMode(startType, endType);

  if (rangeMode.type === "line") {
    yield* handleLineDecorations(
      lineRanges.slice(
        rangeMode.startOffset,
        rangeMode.endOffset === 0 ? undefined : rangeMode.endOffset,
      ),
    );
    return;
  }

  lineRanges[0] = lineRanges[0].with(tokenRange.start);
  lineRanges[lineRanges.length - 1] = lineRanges[lineRanges.length - 1].with(
    undefined,
    tokenRange.end,
  );

  yield* handleMultipleLines(lineRanges);
}

interface TokenMode {
  type: "token";
}

interface LineMode {
  type: "line";
  startOffset: number;
  endOffset: number;
}

type RangeMode = TokenMode | LineMode;

function getRangeMode(startType: EndingType, endType: EndingType): RangeMode {
  if (startType === EndingType.middle || endType === EndingType.middle) {
    return { type: "token" };
  }

  switch (startType) {
    case EndingType.empty:
      switch (endType) {
        case EndingType.empty:
        case EndingType.lineEnd:
          return { type: "line", startOffset: 1, endOffset: 0 };
        case EndingType.lineStart:
          return { type: "line", startOffset: 0, endOffset: -1 };
      }
      break;
    case EndingType.lineStart:
      switch (endType) {
        case EndingType.empty:
        case EndingType.lineStart:
          return { type: "line", startOffset: 0, endOffset: -1 };
        case EndingType.lineEnd:
          return { type: "token" };
      }
      break;
    case EndingType.lineEnd:
      switch (endType) {
        case EndingType.empty:
        case EndingType.lineEnd:
          return { type: "line", startOffset: 1, endOffset: 0 };
        case EndingType.lineStart:
          return { type: "token" };
      }
  }
}

function getEndingType(lineRange: Range, position: Position): EndingType {
  if (lineRange.isEmpty) {
    return EndingType.empty;
  }

  if (position.character === lineRange.start.character) {
    return EndingType.lineStart;
  }

  if (position.character === lineRange.end.character) {
    return EndingType.lineEnd;
  }

  return EndingType.middle;
}

enum EndingType {
  empty = "empty",
  lineStart = "lineStart",
  lineEnd = "lineEnd",
  middle = "middle",
}
