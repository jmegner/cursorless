import {
  Disposable,
  ScopeType,
  toCharacterRange,
  toLineRange,
} from "@cursorless/common";
import { Debouncer } from "./core/Debouncer";
import { ScopeHandlerFactory } from "./processTargets/modifiers/scopeHandlers/ScopeHandlerFactory";
import { ide } from "./singletons/ide.singleton";
import { VisualizationType } from "./VisualizationType";

interface VisualizationInfo {
  scopeType: ScopeType;
  visualizationType: VisualizationType;
}

export class ScopeVisualizer implements Disposable {
  setScopeType(
    scopeType: ScopeType | undefined,
    visualizationType: string | undefined,
  ) {
    if (scopeType === undefined || visualizationType === undefined) {
      this.visualizationInfo = undefined;
    } else {
      this.visualizationInfo = {
        scopeType,
        visualizationType: visualizationType as VisualizationType,
      };
    }

    this.debouncer.run();
  }

  private disposables: Disposable[] = [];
  private debouncer = new Debouncer(() => this.highlightScopes());
  private visualizationInfo: VisualizationInfo | undefined = undefined;

  constructor(private scopeHandlerFactory: ScopeHandlerFactory) {
    this.disposables.push(
      // An event that fires when a text document opens
      ide().onDidOpenTextDocument(this.debouncer.run),
      // An Event that fires when a text document closes
      ide().onDidCloseTextDocument(this.debouncer.run),
      // An Event which fires when the array of visible editors has changed.
      ide().onDidChangeVisibleTextEditors(this.debouncer.run),
      // An event that is emitted when a text document is changed. This usually happens when the contents changes but also when other things like the dirty-state changes.
      ide().onDidChangeTextDocument(this.debouncer.run),
      this.debouncer,
    );

    this.debouncer.run();
  }

  private highlightScopes() {
    ide().visibleTextEditors.forEach((editor) => {
      const { document } = editor;
      if (this.visualizationInfo === undefined) {
        ide().setHighlightRanges("scopeDomain", editor, []);
        ide().setHighlightRanges("scopeContent", editor, []);
        ide().setHighlightRanges("scopeRemoval", editor, []);
        return;
      }

      const { scopeType, visualizationType } = this.visualizationInfo;
      const scopeHandler = this.scopeHandlerFactory.create(
        scopeType,
        document.languageId,
      );

      const scopes = Array.from(
        scopeHandler?.generateScopes(editor, document.range.start, "forward", {
          includeDescendantScopes: true,
        }) ?? [],
      );

      const targets = scopes.flatMap((scope) => scope.getTargets(false));

      ide().setHighlightRanges(
        "scopeDomain",
        editor,
        scopes.map(({ domain }) => toCharacterRange(domain)),
      );

      switch (visualizationType) {
        case VisualizationType.content:
          ide().setHighlightRanges(
            "scopeContent",
            editor,
            targets.map((target) => toCharacterRange(target.contentRange)),
          );
          ide().setHighlightRanges("scopeRemoval", editor, []);
          break;
        case VisualizationType.removal:
          ide().setHighlightRanges(
            "scopeRemoval",
            editor,
            targets.map((target) =>
              target.isLine
                ? toLineRange(target.getRemovalHighlightRange())
                : toCharacterRange(target.getRemovalHighlightRange()),
            ),
          );
          ide().setHighlightRanges("scopeContent", editor, []);
          break;
      }
    });
  }

  dispose(): void {
    this.disposables.forEach(({ dispose }) => {
      try {
        dispose();
      } catch (e) {
        // do nothing
      }
    });

    ide().visibleTextEditors.forEach((editor) => {
      ide().setHighlightRanges("scopeDomain", editor, []);
      ide().setHighlightRanges("scopeContent", editor, []);
      ide().setHighlightRanges("scopeRemoval", editor, []);
    });
  }
}
