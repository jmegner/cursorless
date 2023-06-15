import { FlashStyle, GeneralizedRange } from "@cursorless/common";
import { ExtensionContext } from "vscode";
import { VscodeBackgroundHighlight } from "./VscodeBackgroundHighlight";
import { VscodeDecorationStyle } from "./VscodeDecorationStyle";
import { VscodeOutlineHighlight } from "./VscodeOutlineHighlight";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";

export enum HighlightStyle {
  highlight0 = "highlight0",
  highlight1 = "highlight1",
  /**
   * Used for calibrating timing when recording a video
   */
  timingCalibration = "timingCalibration",
  scopeContent = "scopeContent",
  scopeDomain = "scopeDomain",
  scopeRemoval = "scopeRemoval",
}

export type VscodeStyle = FlashStyle | HighlightStyle;

export type OutlineStyle =
  | HighlightStyle.scopeContent
  | HighlightStyle.scopeDomain
  | HighlightStyle.scopeRemoval;

const backgroundStyles: VscodeStyle[] = (
  [
    HighlightStyle.highlight0,
    HighlightStyle.highlight1,
    HighlightStyle.timingCalibration,
  ] as VSCodeStyle[]
).concat(Object.values(FlashStyle));

const outlineStyles: OutlineStyle[] = [
  HighlightStyle.scopeContent,
  HighlightStyle.scopeDomain,
  HighlightStyle.scopeRemoval,
];

/**
 * Manages highlights for VSCode.  This class is also used by
 * {@link VscodeFlashHandler} for rendering the decorations used for flashes, but this
 * class doesn't handle the timing of the flashes.
 */
export default class VscodeHighlights {
  private highlightDecorations: Record<VscodeStyle, VscodeDecorationStyle>;

  constructor(extensionContext: ExtensionContext) {
    this.highlightDecorations = {
      ...Object.fromEntries(
        backgroundStyles.map((style) => [
          style,
          new VscodeBackgroundHighlight(style),
        ]),
      ),
      ...Object.fromEntries(
        outlineStyles.map((style) => [
          style,
          new VscodeOutlineHighlight(style),
        ]),
      ),
    } as Record<VscodeStyle, VscodeBackgroundHighlight>;

    extensionContext.subscriptions.push(
      ...Object.values(this.highlightDecorations),
    );
  }

  async setHighlightRanges(
    style: VscodeStyle,
    editor: VscodeTextEditorImpl,
    ranges: GeneralizedRange[],
  ) {
    this.highlightDecorations[style].setRanges(editor, ranges);
  }
}
