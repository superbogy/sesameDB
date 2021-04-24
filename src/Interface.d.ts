interface Node {
  keys: string[];
  parent: Node | null;
  isLeaf: boolean;
  children: Node[];
}

interface Leaf extends Node {
  data: [string];
}