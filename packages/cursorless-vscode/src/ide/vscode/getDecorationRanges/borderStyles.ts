import { Borders } from "./getDecorationRanges.types";

export const NONE: Borders = {
  top: false,
  right: false,
  bottom: false,
  left: false,
};
export const TOP: Borders = {
  top: true,
  left: false,
  right: false,
  bottom: false,
};
export const BOTTOM: Borders = {
  bottom: true,
  top: false,
  left: false,
  right: false,
};
export const TOP_LEFT: Borders = {
  top: true,
  left: true,
  right: false,
  bottom: false,
};
export const TOP_BOTTOM: Borders = {
  top: true,
  bottom: true,
  left: false,
  right: false,
};
export const BOTTOM_RIGHT: Borders = {
  bottom: true,
  right: true,
  top: false,
  left: false,
};
export const TOP_BOTTOM_LEFT: Borders = {
  top: true,
  bottom: true,
  left: true,
  right: false,
};
export const TOP_BOTTOM_RIGHT: Borders = {
  top: true,
  bottom: true,
  right: true,
  left: false,
};
export const FULL: Borders = {
  top: true,
  right: true,
  bottom: true,
  left: true,
};
