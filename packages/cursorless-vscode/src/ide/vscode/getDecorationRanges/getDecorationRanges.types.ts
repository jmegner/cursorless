import { Range } from "@cursorless/common";

export interface Borders {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

export interface StyledRange<T> {
  range: Range;
  style: T;
}

export type DecoratedRange = StyledRange<Borders>;

export interface StyleParameters<T> {
  style: T;
  differentiationIndex: number;
}

export interface StyleParametersRanges<T> {
  styleParameters: StyleParameters<T>;
  ranges: Range[];
}
