import { Range, TextEditor } from "@cursorless/common";
import { flatmap } from "itertools";
import {
  DecorationStyle,
  StyleParametersRanges,
} from "./getDecorationRanges.types";
import { getDifferentiatedRanges } from "./getDifferentiatedRanges";
import { generateDecorationsForRange } from "./generateDecorationsForRange";

export function getDecorationRanges(
  editor: TextEditor,
  ranges: Range[],
): StyleParametersRanges<DecorationStyle>[] {
  const decoratedRanges = Array.from(
    flatmap(ranges, (range) => generateDecorationsForRange(editor, range)),
  );

  return getDifferentiatedRanges(decoratedRanges, getBorderKey);
}

function getBorderKey({
  top,
  right,
  left,
  bottom,
  isWholeLine,
}: DecorationStyle) {
  return [top, right, left, bottom, isWholeLine ?? false];
}
