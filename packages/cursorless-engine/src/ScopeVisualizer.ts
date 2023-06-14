import { Disposable, ScopeType, toCharacterRange } from "@cursorless/common";
import { Debouncer } from "./core/Debouncer";
import { ScopeHandlerFactory } from "./processTargets/modifiers/scopeHandlers/ScopeHandlerFactory";
import { ide } from "./singletons/ide.singleton";

export class ScopeVisualizer implements Disposable {
  private disposables: Disposable[] = [];
  private debouncer = new Debouncer(() => this.highlightScopes());

  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    private scopeType: ScopeType,
  ) {
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
      const scopeHandler = this.scopeHandlerFactory.create(
        this.scopeType,
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
      ide().setHighlightRanges(
        "scopeContent",
        editor,
        targets.map((target) => toCharacterRange(target.contentRange)),
      );
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
      ide().setHighlightRanges("scopeContent", editor, []);
    });
  }
}
