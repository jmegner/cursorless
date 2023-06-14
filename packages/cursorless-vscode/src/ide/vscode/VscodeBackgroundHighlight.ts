import {
  CharacterRange,
  GeneralizedRange,
  LineRange,
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
import type { VscodeStyle } from "./VscodeHighlights";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";
import { VscodeDecorationStyle } from "./VscodeDecorationStyle";

/**
 * Manages VSCode decoration types for a highlight or flash style.
 */
export class VscodeBackgroundHighlight implements VscodeDecorationStyle {
  private tokenDecorationType: TextEditorDecorationType;
  private lineDecorationType: TextEditorDecorationType;

  constructor(style: VscodeStyle) {
    const options: DecorationRenderOptions = {
      backgroundColor: new ThemeColor(`cursorless.${style}Background`),
      rangeBehavior: DecorationRangeBehavior.ClosedClosed,
    };

    this.tokenDecorationType = window.createTextEditorDecorationType(options);
    this.lineDecorationType = window.createTextEditorDecorationType({
      ...options,
      isWholeLine: true,
    });
  }

  setRanges(editor: VscodeTextEditorImpl, ranges: GeneralizedRange[]) {
    const [lineRanges, characterRanges] = partition<LineRange, CharacterRange>(
      ranges,
      isLineRange,
    );

    editor.vscodeEditor.setDecorations(
      this.tokenDecorationType,
      characterRanges.map(
        ({ start, end }) =>
          new vscode.Range(
            start.line,
            start.character,
            end.line,
            end.character,
          ),
      ),
    );

    editor.vscodeEditor.setDecorations(
      this.lineDecorationType,
      lineRanges.map((range) => new vscode.Range(range.start, 0, range.end, 0)),
    );
  }

  dispose() {
    this.tokenDecorationType.dispose();
    this.lineDecorationType.dispose();
  }
}
