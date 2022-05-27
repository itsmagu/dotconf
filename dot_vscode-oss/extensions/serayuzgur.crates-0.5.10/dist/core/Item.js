"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Item is a data structure to define parsed items, hierarchy and index.
 */
class Item {
    constructor(item) {
        this.key = "";
        this.values = [];
        this.value = "";
        this.start = -1;
        this.end = -1;
        if (item) {
            this.key = item.key;
            this.values = item.values;
            this.value = item.value;
            this.start = item.start;
            this.end = item.end;
        }
    }
}
exports.default = Item;
//# sourceMappingURL=Item.js.map