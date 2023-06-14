import {
  CharacterRange,
  CompositeKeyDefaultMap,
  GeneralizedRange,
  LineRange,
  Range,
  isLineRange,
  partition,
} from "@cursorless/common";
import { toVscodeRange } from "@cursorless/vscode-common";
import { chain, flatmap } from "itertools";
import * as vscode from "vscode";
import {
  DecorationRangeBehavior,
  DecorationRenderOptions,
  TextEditorDecorationType,
  ThemeColor,
  window,
} from "vscode";
import { VscodeDecorationStyle } from "./VscodeDecorationStyle";
import { HighlightStyle, VscodeStyle } from "./VscodeHighlights";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";
import { generateDecorationsForCharacterRange } from "./getDecorationRanges/generateDecorationsForCharacterRange";
import { generateDecorationsForLineRange } from "./getDecorationRanges/generateDecorationsForLineRange";
import {
  BorderStyle,
  DecorationStyle,
  StyleParameters,
  StyleParametersRanges,
} from "./getDecorationRanges/getDecorationRanges.types";
import { getDifferentiatedRanges } from "./getDecorationRanges/getDifferentiatedRanges";

/**
 * Manages VSCode decoration types for a highlight or flash style.
 */
export class VscodeOutlineHighlight implements VscodeDecorationStyle {
  private decorator: Decorator;

  constructor(style: VscodeStyle) {
    this.decorator = new Decorator(style);
  }

  setRanges(editor: VscodeTextEditorImpl, ranges: GeneralizedRange[]) {
    const [lineRanges, characterRanges] = partition<LineRange, CharacterRange>(
      ranges,
      isLineRange,
    );

    const decoratedRanges = Array.from(
      chain(
        flatmap(characterRanges, ({ start, end }) =>
          generateDecorationsForCharacterRange(editor, new Range(start, end)),
        ),
        flatmap(lineRanges, ({ start, end }) =>
          generateDecorationsForLineRange(start, end),
        ),
      ),
    );

    this.decorator.setDecorations(
      editor,
      getDifferentiatedRanges(decoratedRanges, getBorderKey),
    );
  }

  dispose() {
    this.decorator.dispose();
  }
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

class Decorator {
  private decorationTypes: CompositeKeyDefaultMap<
    StyleParameters<DecorationStyle>,
    TextEditorDecorationType
  >;

  constructor(styleName: VscodeStyle) {
    this.decorationTypes = new CompositeKeyDefaultMap(
      ({ style }) => getDecorationStyle(styleName, style),
      ({
        style: { top, right, bottom, left, isWholeLine },
        differentiationIndex,
      }) => [top, right, bottom, left, isWholeLine, differentiationIndex],
    );
  }

  setDecorations(
    editor: VscodeTextEditorImpl,
    decoratedRanges: StyleParametersRanges<DecorationStyle>[],
  ) {
    const untouchedDecorationTypes = new Set(this.decorationTypes.values());

    decoratedRanges.forEach(({ styleParameters, ranges }) => {
      const decorationType = this.decorationTypes.get(styleParameters);

      editor.vscodeEditor.setDecorations(
        decorationType,
        ranges.map(toVscodeRange),
      );

      untouchedDecorationTypes.delete(decorationType);
    });

    untouchedDecorationTypes.forEach((decorationType) => {
      editor.vscodeEditor.setDecorations(decorationType, []);
    });
  }

  dispose() {
    Array.from(this.decorationTypes.values()).forEach((decorationType) => {
      decorationType.dispose();
    });
  }
}

function getDecorationStyle(
  style: VscodeStyle,
  borders: DecorationStyle,
): vscode.TextEditorDecorationType {
  const options: DecorationRenderOptions = {
    backgroundColor: new ThemeColor(`cursorless.${style}Background`),
    borderColor: getBorderColor(borders),
    borderStyle: getBorderStyle(style, borders),
    borderWidth: "1px",
    borderRadius: getBorderRadius(borders),
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
    isWholeLine: borders.isWholeLine,
  };

  return window.createTextEditorDecorationType(options);
}

function getBorderStyle(style: VscodeStyle, borders: DecorationStyle): string {
  return [
    getSingleBorderStyle(style, borders.top),
    getSingleBorderStyle(style, borders.right),
    getSingleBorderStyle(style, borders.bottom),
    getSingleBorderStyle(style, borders.left),
  ].join(" ");
}

function getSingleBorderStyle(style: VscodeStyle, borderStyle: BorderStyle) {
  if (borderStyle !== BorderStyle.solid) {
    return borderStyle;
  }

  return style === HighlightStyle.scopeContent ? "none" : "solid";
}

function getBorderColor(borders: DecorationStyle): string {
  return [
    borders.top === BorderStyle.solid ? solidColor : porousColor,
    borders.right === BorderStyle.solid ? solidColor : porousColor,
    borders.bottom === BorderStyle.solid ? solidColor : porousColor,
    borders.left === BorderStyle.solid ? solidColor : porousColor,
  ].join(" ");
}

const porousColor = "rgba(235, 222, 236, 0.23)";
const solidColor = "#ebdeec84";

function getBorderRadius(borders: DecorationStyle): string {
  return [
    borders.top === BorderStyle.solid && borders.left === BorderStyle.solid
      ? "2px"
      : "0px",
    borders.top === BorderStyle.solid && borders.right === BorderStyle.solid
      ? "2px"
      : "0px",
    borders.bottom === BorderStyle.solid && borders.right === BorderStyle.solid
      ? "2px"
      : "0px",
    borders.bottom === BorderStyle.solid && borders.left === BorderStyle.solid
      ? "2px"
      : "0px",
  ].join(" ");
}
