import React, { Component, ReactElement } from 'react';
import classNames from 'classnames';
import { reaction } from 'mobx';
import styles from './chunked-render-list.scss';
import { ChunkedRenderListItemRepresentation } from './chunked-render-list-item-representation';
import {
  createChunkedRenderListItemsChunkModel,
  ChunkedRenderListItemsChunkModel,
} from './chunks/chunked-render-list-items-chunk-model';
import { ChunkedRenderListItemsChunk } from './chunks/chunked-render-list-items-chunk';
import { ChunkedRenderListItemsModificationRepresentation } from './chunked-render-list-items-modification-representation';
import { ChunkedRenderListChildrenRepresentationHolder } from './chunked-render-list-children-representation-holder';

let chunkId = 1;

const GAP = 100;
const LIST_ITEMS_CHUNK_SIZE = 50;

interface ChunkedRenderListProps<
  IT extends ChunkedRenderListItemRepresentation,
  MT extends ChunkedRenderListItemsModificationRepresentation<IT>
> {
  className?: string;
  childrenRepresentationHolder: ChunkedRenderListChildrenRepresentationHolder<IT, MT>;
  renderItem: (representation: IT) => ReactElement | null;
}

interface ChunkedRenderListState<T extends ChunkedRenderListItemRepresentation> {
  chunks: ChunkedRenderListItemsChunkModel<T>[];
}

export class ChunkedRenderList<
  IT extends ChunkedRenderListItemRepresentation,
  MT extends ChunkedRenderListItemsModificationRepresentation<IT>
> extends Component<ChunkedRenderListProps<IT, MT>, ChunkedRenderListState<IT>> {
  private storedChunks: ChunkedRenderListItemsChunkModel<IT>[] = [];

  constructor(props: ChunkedRenderListProps<IT, MT>) {
    super(props);
    this.state = {
      chunks: [],
    };
  }

  renderList(childrenRepresentation: MT) {
    // chunks rebuild
    console.log(childrenRepresentation.modificationType);

    const chunks: ChunkedRenderListItemsChunkModel<IT>[] = [];
    const iMax = Math.floor(childrenRepresentation.children.length / LIST_ITEMS_CHUNK_SIZE) + 1;
    for (let i = 0; i !== iMax; i += 1) {
      chunkId += 1;
      chunks.push(
        createChunkedRenderListItemsChunkModel(
          chunkId,
          childrenRepresentation.children.slice(
            LIST_ITEMS_CHUNK_SIZE * i,
            LIST_ITEMS_CHUNK_SIZE * (i + 1),
          ),
        ),
      );
    }

    this.storedChunks = chunks;

    this.setState({
      chunks: [chunks[0]],
    });
  }

  componentDidMount(): void {
    reaction(
      () => this.props.childrenRepresentationHolder.childrenRepresentation,
      childrenRepresentation => {
        this.renderList(childrenRepresentation);
      },
    );
    this.renderList(this.props.childrenRepresentationHolder.childrenRepresentation);
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
    const renderItem = props.renderItem;
    return (
      <div className={classNames(styles.root, props.className)} ref={this.setScrollContainer}>
        <div className={styles.inner}>
          {this.state.chunks.map(chunk => (
            <ChunkedRenderListItemsChunk<IT>
              items={chunk.items}
              key={chunk.id}
              renderItem={renderItem}
            />
          ))}
        </div>
      </div>
    );
  }
}
