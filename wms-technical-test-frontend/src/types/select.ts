import { Key } from "react";

export type Select<T extends Key | null | undefined, V = unknown> = {
  label: string;
  value: T;
  data?: V | null;
};
