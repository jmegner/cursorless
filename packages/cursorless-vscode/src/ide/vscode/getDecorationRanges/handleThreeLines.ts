import { Range } from "@cursorless/common";
import { Borders, DecoratedRange } from "./getDecorationRanges.types";
import { TOP_LEFT, BOTTOM_RIGHT, TOP } from "./borderStyles";
import { singleLineRange } from "./singleLineRange";

export function* handleThreeLines(
  lineRanges: Range[],
): Iterable<DecoratedRange> {
  const [firstLine, secondLine, thirdLine] = lineRanges;
  const {
    start: { character: firstLineStart },
  } = firstLine;
  const {
    start: { line: secondLineNumber },
    end: { character: secondLineEnd },
  } = secondLine;
  const {
    end: { character: thirdLineEnd },
  } = thirdLine;

  yield {
    range: firstLine,
    style: TOP_LEFT,
  };

  yield* handleSecondLine(
    secondLineNumber,
    firstLineStart,
    secondLineEnd,
    thirdLineEnd,
  );

  yield {
    range: thirdLine,
    style: BOTTOM_RIGHT,
  };
}

function* handleSecondLine(
  secondLineNumber: number,
  firstLineStart: number,
  secondLineEnd: number,
  thirdLineEnd: number,
): Iterable<DecoratedRange> {
  let currentDecoration: Borders = TOP;
  let currentOffset = 0;

  const events: Event[] = [
    {
      offset: firstLineStart,
      type: EventType.firstLineStart,
    },
    {
      offset: secondLineEnd,
      type: EventType.secondLineEnd,
    },
    {
      offset: thirdLineEnd,
      type: EventType.thirdLineEnd,
    },
  ];

  events.sort((a, b) => a.offset - b.offset);

  for (const { offset, type } of events) {
    if (offset > currentOffset) {
      yield {
        range: singleLineRange(secondLineNumber, currentOffset, offset),
        style: currentDecoration,
      };
    }

    switch (type) {
      case EventType.firstLineStart:
        currentDecoration = { ...currentDecoration, top: false };
        break;
      case EventType.secondLineEnd:
        return;
      case EventType.thirdLineEnd:
        currentDecoration = { ...currentDecoration, bottom: true };
        break;
    }

    currentOffset = offset;
  }
}

interface Event {
  offset: number;
  type: EventType;
}

enum EventType {
  firstLineStart,
  secondLineEnd,
  thirdLineEnd,
}
