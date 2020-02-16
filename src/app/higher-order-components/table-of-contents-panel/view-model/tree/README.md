# Table of Contents Tree

It's view model of Table of Contents tree

## Responsibility

It manipulates Table of Contents tree data for Table of Contents view presentation

## Concepts

[`TableOfContentsTree`](./table-of-contents-tree.ts) transforms Table of Contents tree into one level list
with extra view state information about page of Table of Contents
and mange this list for [`ChunkedList`](../../../../components/chunked-list/README.md) component,
because Table of Contents can contains more than 1K items
and we have to optimize render of them for good performance of UI

Also it works with UI state of selected pages and filtering of pages

### Implements `ChunkedListModificationHolder` 

It implements [`ChunkedListModificationHolder`](../../../../components/chunked-list/types/chunked-list-modification-holder.ts).
You can see all modification types supporting [here](./children-modification)
