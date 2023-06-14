import {
  Command,
  CommandServerApi,
  Hats,
  IDE,
  ScopeType,
} from "@cursorless/common";
import { StoredTargetMap, TestCaseRecorder, TreeSitter } from ".";
import { ScopeVisualizer } from "./ScopeVisualizer";
import { Debug } from "./core/Debug";
import { HatTokenMapImpl } from "./core/HatTokenMapImpl";
import { Snippets } from "./core/Snippets";
import { ensureCommandShape } from "./core/commandVersionUpgrades/ensureCommandShape";
import { RangeUpdater } from "./core/updateSelections/RangeUpdater";
import { LanguageDefinitions } from "./languages/LanguageDefinitions";
import { ScopeHandlerFactoryImpl } from "./processTargets/modifiers/scopeHandlers";
import { runCommand } from "./runCommand";
import { injectIde } from "./singletons/ide.singleton";
import { StartStop } from "./StartStop";
import { VisualizationType } from "./VisualizationType";

export function createCursorlessEngine(
  treeSitter: TreeSitter,
  ide: IDE,
  hats: Hats,
  commandServerApi: CommandServerApi | null,
): CursorlessEngine {
  injectIde(ide);

  const debug = new Debug(treeSitter);

  const rangeUpdater = new RangeUpdater();
  ide.disposeOnExit(rangeUpdater);

  const snippets = new Snippets();
  snippets.init();

  const hatTokenMap = new HatTokenMapImpl(
    rangeUpdater,
    debug,
    hats,
    commandServerApi,
  );
  hatTokenMap.allocateHats();

  const storedTargets = new StoredTargetMap();

  const testCaseRecorder = new TestCaseRecorder(hatTokenMap, storedTargets);

  const languageDefinitions = new LanguageDefinitions(treeSitter);

  const scopeVisualizer = new StartStop(
    (scopeType: ScopeType, visualizationType: string) =>
      new ScopeVisualizer(
        new ScopeHandlerFactoryImpl(languageDefinitions),
        scopeType,
        VisualizationType[visualizationType as keyof typeof VisualizationType],
      ),
  );

  return {
    commandApi: {
      runCommand(command: Command) {
        return runCommand(
          debug,
          hatTokenMap,
          testCaseRecorder,
          snippets,
          storedTargets,
          languageDefinitions,
          rangeUpdater,
          command,
        );
      },

      runCommandSafe(...args: unknown[]) {
        return runCommand(
          debug,
          hatTokenMap,
          testCaseRecorder,
          snippets,
          storedTargets,
          languageDefinitions,
          rangeUpdater,
          ensureCommandShape(args),
        );
      },
    },
    scopeVisualizer,
    testCaseRecorder,
    storedTargets,
    hatTokenMap,
    snippets,
    injectIde,
  };
}

export interface CommandApi {
  /**
   * Runs a command.  This is the core of the Cursorless engine.
   * @param command The command to run
   */
  runCommand(command: Command): Promise<unknown>;

  /**
   * Designed to run commands that come directly from the user.  Ensures that
   * the command args are of the correct shape.
   */
  runCommandSafe(...args: unknown[]): Promise<unknown>;
}

export interface CursorlessEngine {
  commandApi: CommandApi;
  scopeVisualizer: StartStop<[ScopeType, string]>;
  testCaseRecorder: TestCaseRecorder;
  storedTargets: StoredTargetMap;
  hatTokenMap: HatTokenMapImpl;
  snippets: Snippets;
  injectIde: (ide: IDE | undefined) => void;
}
