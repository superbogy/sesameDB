import {BLeaf} from "./Node";

export type Dict = {
  [key: string]: any
}

export enum Operator {
  $eq = '=',
  $lt = '<',
  $gt = '>',
  $lte = '<=',
  $gte = '>=',
  $like = 'LIKE'
}
export interface Filter {
  key: string | Dict;
  op?: string;
  lo?: Filter;
  limit?: number;
  skip?: number;
}

export interface Cursor {
  previous: Cursor | null;
  data: any[];
  index: number;
  current: BLeaf;
}