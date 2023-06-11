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
export class VscodeOutlineHighlight implements VscodeDecorationStyle {
  private tokenDecorationType1: TextEditorDecorationType;
  private tokenDecorationType2: TextEditorDecorationType;
  private lineDecorationType: TextEditorDecorationType;

  constructor(style: VscodeStyle) {
    const options: DecorationRenderOptions = {
      backgroundColor: new ThemeColor(`cursorless.${style}Background`),
      borderColor: new ThemeColor(`cursorless.${style}Border`),
      borderStyle: "solid",
      borderWidth: "1px",
      borderRadius: "2px",
      rangeBehavior: DecorationRangeBehavior.ClosedClosed,
    };

    this.tokenDecorationType1 = window.createTextEditorDecorationType(options);
    this.tokenDecorationType2 = window.createTextEditorDecorationType(options);
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
    const sortedTokenRanges = tokenRanges
      .map(
        ({ start, end }) =>
          new vscode.Range(
            start.line,
            start.character,
            end.line,
            end.character,
          ),
      )
      .sort((a, b) => a.start.compareTo(b.start));

    editor.vscodeEditor.setDecorations(
      this.tokenDecorationType1,
      sortedTokenRanges.filter((_, i) => i % 2 === 0),
    );

    editor.vscodeEditor.setDecorations(
      this.tokenDecorationType2,
      sortedTokenRanges.filter((_, i) => i % 2 === 1),
    );

    editor.vscodeEditor.setDecorations(
      this.lineDecorationType,
      lineRanges.map((range) => new vscode.Range(range.start, 0, range.end, 0)),
    );
  }

  dispose() {
    this.tokenDecorationType1.dispose();
    this.tokenDecorationType2.dispose();
    this.lineDecorationType.dispose();
  }
}
