import BNode from './Node';
import Leaf from './Leaf';
import R from 'ramda';

class BPlusTree {
  order: number;
  root: BNode | Leaf;
  leafs: any[];
  constructor(order: number = 4096) {
    this.order = order;
    this.leafs = [];
    this.root = new Leaf([], null, [], this.order);
  }

  insert(key: any, value: any) {
    const node = this.findInLeaf(key);
    const newNode = node.insert(key, value);
    if (newNode && !newNode.parent) {
      this.root = newNode;
    }
  }

  find(key: any) {
    const node = this.root.getNode(key);
    return node.getId(key);
  }


  findInLeaf(key: any) {
    return this.root.getNode(key);
  }

  printTree(node: BNode | Leaf, prefix: string = '') {
    if (!node.parent) {
      console.log(`└── ${node.keys}`)
    } else {
      if (node.parent && node instanceof Leaf) {
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
tree.insert(7, 'f');
tree.printTree(tree.root);