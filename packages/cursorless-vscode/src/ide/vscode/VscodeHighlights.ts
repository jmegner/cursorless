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
}

export type VscodeStyle = FlashStyle | HighlightStyle;

const backgroundStyles: VscodeStyle[] = [
  HighlightStyle.highlight0,
  HighlightStyle.highlight1,
  HighlightStyle.timingCalibration,
].concat(Object.values(HighlightStyle));

const outlineStyles = [HighlightStyle.scopeContent, HighlightStyle.scopeDomain];

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
