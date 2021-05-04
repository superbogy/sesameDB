import {BNode, BLeaf} from './Node';
import {Dict, Filter} from './Interface';
import R from 'ramda';
class BPlusTree {
  order: number;
  root: BNode | BLeaf;
  constructor(order: number = 4096) {
    this.order = order;
    this.root = new BLeaf([], null, [], this.order);
  }

  insert(key: any, value: any) {
    const node = this.findInLeaf(key);
    const newNode = node.insert(key, value);
    if (newNode && !newNode.parent) {
      this.root = newNode;
    }
  }

  findOne(key: any) {
    const node = this.root.getNode(key);
    return node.getId(key);
  }

  find(key: any, op: string, all: boolean = true) {
    const node = this.findInLeaf(key);
    const res = node.find(key, op);
    if (all) {
      return res.all();
    }

    return res.generator();
  }

  findInLeaf(key: any) {
    return this.root.getNode(key);
  }

  printTree(node: BNode | BLeaf, prefix: string = '') {
    if (!node.parent) {
      console.log(`└── ${node.keys}`)
    } else {
      if (node.parent && node instanceof BLeaf) {
        prefix += '    '
      }
      console.log(prefix + '   └──' + node.keys);
    }

    if (node instanceof BNode) {
      node.children.map(n => {
        this.printTree(n, prefix)
      });
    }
  }
}
const tree = new BPlusTree(3);
tree.insert(1, 'a');
tree.insert(2, 'b');
tree.insert(3, 'c');
tree.insert(4, 'd');
tree.insert(5, 'e');
tree.insert(6, 'f');
tree.insert(7, 'g');
tree.printTree(tree.root);
console.log(tree.findOne(2));
console.log(tree.findOne(6));
const d: Dict = {
  a: 'a'
};
console.log(tree.find(3, '$gt'));
console.log(tree.find(3, '$lt'));