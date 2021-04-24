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
    node.insert(key, value);
  }

  find(key: any) {
    const {index, node} = this.root.getIndex(key);
    return node.getId(key);
  }


  findInLeaf(key: any) {
    return this.root.getIndex(key);
  }
}