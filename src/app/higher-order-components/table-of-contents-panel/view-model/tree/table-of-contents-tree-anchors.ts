import { computed, observable, runInAction } from 'mobx';

export class TableOfContentsTreeAnchors {
  constructor(anchors: TableOfContentsAnchor[]) {
    this.list = anchors;
  }

  @observable.ref
  list: TableOfContentsAnchor[] = [];

  @computed
  get hasAnchors() {
    return this.list.length !== 0;
  }
}

export function createTableOfContentsTreeAnchors(anchors: TableOfContentsAnchor[]) {
  return runInAction(() => new TableOfContentsTreeAnchors(anchors));
}
