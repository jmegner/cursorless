import { Range } from "@cursorless/common";

export enum BorderStyle {
  porous = "dashed",
  solid = "solid",
  none = "none",
}

export interface Borders {
  top: BorderStyle;
  bottom: BorderStyle;
  left: BorderStyle;
  right: BorderStyle;
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
