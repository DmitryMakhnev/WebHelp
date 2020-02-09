import React, { Component, FC } from 'react';
import classNames from 'classnames';
import { reaction } from 'mobx';
import styles from './table-of-contents-list.scss';
import { TableOfContentsListItem } from './item/table-of-contents-item';
import { TableOfContentsTree2 } from '../../higher-order-components/table-of-contents-panel/view-model/tree-2/table-of-contents-tree-2';
import { TableOfContentsPageViewRepresentation } from '../../higher-order-components/table-of-contents-panel/view-model/tree-2/table-of-contents-page-view-representation';
import { ChildrenRepresentation } from '../../higher-order-components/table-of-contents-panel/view-model/tree-2/children-representation/children-representation';

interface TableOfContentsListProps {
  className?: string;
  tree: TableOfContentsTree2;
}

interface TableOfContentsListState {
  chunks: Chunk[];
}

interface Chunk {
  id: number;
  pages: TableOfContentsPageViewRepresentation[];
}

let chunkId = 1;

const ListRenderChunk: FC<{
  pages: TableOfContentsPageViewRepresentation[];
}> = props => (
  <>
    {props.pages.map(pageViewRepresentation => (
      <TableOfContentsListItem
        pageViewRepresentation={pageViewRepresentation}
        key={pageViewRepresentation.id}
      />
    ))}
  </>
);

const GAP = 100;

export class TableOfContentsList extends Component<
  TableOfContentsListProps,
  TableOfContentsListState
> {
  storedChunks: Chunk[] = [];

  constructor(props: TableOfContentsListProps) {
    super(props);
    this.state = {
      chunks: [],
    };
  }

  renderList(childrenRepresentation: ChildrenRepresentation) {
    const chunks: Chunk[] = [];

    const chunkSize = 50;
    const iMax = Math.floor(childrenRepresentation.children.length / chunkSize) + 1;
    for (let i = 0; i !== iMax; i += 1) {
      chunkId += 1;
      chunks.push({
        id: chunkId,
        pages: childrenRepresentation.children.slice(chunkSize * i, chunkSize * (i + 1)),
      });
    }

    this.storedChunks = chunks;

    this.setState({
      chunks: [chunks[0]],
    });
  }

  componentDidMount(): void {
    reaction(
      () => this.props.tree.childrenRepresentation,
      children => {
        this.renderList(children);
      },
    );
    this.renderList(this.props.tree.childrenRepresentation);
  }

  setScrollContainer = (scrollContainer: HTMLDivElement) => {
    scrollContainer.addEventListener('scroll', () => {
      const scrollContainerHeight = scrollContainer.offsetHeight;
      const innerHeight = scrollContainer.scrollHeight;
      const scrollTop = scrollContainer.scrollTop;
      if (innerHeight - (scrollTop + scrollContainerHeight) < GAP) {
        const currentStateChunksCount = this.state.chunks.length;
        if (currentStateChunksCount < this.storedChunks.length) {
          const chunks = this.state.chunks;
          this.setState(() => ({
            chunks: chunks.concat(this.storedChunks[currentStateChunksCount]),
          }));
        }
      }
    });
  };

  render() {
    const props = this.props;
    return (
      <div
        className={classNames(styles.tableOfContentsList, props.className)}
        ref={this.setScrollContainer}
      >
        <div className={styles.inner}>
          {this.state.chunks.map(chunk => (
            <ListRenderChunk pages={chunk.pages} key={chunk.id} />
          ))}
        </div>
      </div>
    );
  }
}
