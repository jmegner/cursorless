import { GeneralizedRange } from "@cursorless/common";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";
import { Disposable } from "vscode";

export interface VscodeDecorationStyle extends Disposable {
  setRanges(editor: VscodeTextEditorImpl, ranges: GeneralizedRange[]): void;
}
