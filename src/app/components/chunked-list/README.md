# Chunked List

`<ChunkedList ... />` helps to display big lists with some extra abilities:

* filtration 
* animation appending and removing items
* interaction with some item of list 
* restoration

## Main conception

`ChunkedList` receives [`ChunkedListModificationHolder`](./types/chunked-list-modification-holder.ts)
and starts to listen `ChunkedListModificationHolder.childrenModification` change

When `ChunkedList` receives new [`ChunkedListItemsModification`](./types/chunked-list-items-modification.ts), 
it checks [type of modification](./types/chunked-list-items-modification-type.ts) of [items](./types/chunked-list-item.ts)
and sort the items by [chunks](./chunks/chunked-render-list-items-chunk-model.ts)
use strategy based on modification type

After that `ChunkedList` render the chunks which are required for current viewport

Also `ChunkedList` watching for them scrolled view interaction and render chunks for new viewport requirements 
 
## `ChunkedListModificationHolder`

It's a [simple interface](./types/chunked-list-modification-holder.ts) which you can support by in you code which response for transformation from data to view-oriented data.

### Example
[`TableOfContentsTree`](../../higher-order-components/table-of-contents-panel/view-model/tree/table-of-contents-tree.ts)
is a current example of [`ChunkedListModificationHolder`](./types/chunked-list-modification-holder.ts) implementation

## Notes

`ChunkedList` is not full implementation of [virtual list](https://reactjs.org/docs/optimizing-performance.html#virtualize-long-lists).
It just render list by chunks but chunks stay in DOM

Use `ChunkedList` when you can't render full list immediately but it's normal to save this list in DOM

Also it's possible to extend `ChunkedList` for supporting virtual scrolling without extra long work
but not at this time, however contracts of `ChunkedList` allow it.
