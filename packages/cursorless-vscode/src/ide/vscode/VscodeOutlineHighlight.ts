import {
  CharacterRange,
  CompositeKeyDefaultMap,
  GeneralizedRange,
  LineRange,
  Range,
  isLineRange,
  partition,
} from "@cursorless/common";
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
import { getDecorationRanges } from "./getDecorationRanges";
import { toVscodeRange } from "@cursorless/vscode-common";
import {
  BorderStyle,
  DecorationStyle,
  StyleParameters,
  StyleParametersRanges,
} from "./getDecorationRanges/getDecorationRanges.types";

/**
 * Manages VSCode decoration types for a highlight or flash style.
 */
export class VscodeOutlineHighlight implements VscodeDecorationStyle {
  private lineDecorationType: TextEditorDecorationType;
  private decorator: Decorator;

  constructor(style: VscodeStyle) {
    const options: DecorationRenderOptions = {
      backgroundColor: new ThemeColor(`cursorless.${style}Background`),
      borderColor: new ThemeColor(`cursorless.${style}Border`),
      borderStyle: "solid",
      borderWidth: "1px",
      borderRadius: "2px",
      rangeBehavior: DecorationRangeBehavior.ClosedClosed,
    };
    this.decorator = new Decorator(style);

    this.lineDecorationType = window.createTextEditorDecorationType({
      ...options,
      isWholeLine: true,
    });
  }

  setRanges(editor: VscodeTextEditorImpl, ranges: GeneralizedRange[]) {
    const [lineRanges, tokenRanges] = partition<LineRange, CharacterRange>(
      ranges,
      isLineRange,
    );

    const decorationRanges = getDecorationRanges(
      editor,
      tokenRanges.map(({ start, end }) => new Range(start, end)),
    );

    this.decorator.setDecorations(editor, decorationRanges);

    editor.vscodeEditor.setDecorations(
      this.lineDecorationType,
      lineRanges.map((range) => new vscode.Range(range.start, 0, range.end, 0)),
    );
  }

  dispose() {
    this.decorator.dispose();
    this.lineDecorationType.dispose();
  }
}

class Decorator {
  private decorationTypes: CompositeKeyDefaultMap<
    StyleParameters<DecorationStyle>,
    TextEditorDecorationType
  >;

  constructor(styleName: VscodeStyle) {
    this.decorationTypes = new CompositeKeyDefaultMap(
      ({ style }) => getDecorationStyle(styleName, style),
      ({ style: { top, right, bottom, left }, differentiationIndex }) => [
        top,
        right,
        bottom,
        left,
        differentiationIndex,
      ],
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
