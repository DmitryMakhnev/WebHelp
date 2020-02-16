import React, { FC } from 'react';
import classNames from 'classnames';
import styles from './list-loading-stub.scss';
import { ListLoadingStubItemDisplayingConfiguration } from './list-loading-stub-item-displaying-configuration';

const DEFAULT_ITEMS_STUB_CONFIGURATION: ListLoadingStubItemDisplayingConfiguration[] = [
  {
    id: 'default_0',
  },
  {
    id: 'default_1',
    leftGapCoefficient: 1,
    rightGapCoefficient: 2,
  },
  {
    id: 'default_2',
    leftGapCoefficient: 1,
  },
  {
    id: 'default_3',
    leftGapCoefficient: 1,
    rightGapCoefficient: 2,
  },
  {
    id: 'default_4',
    leftGapCoefficient: 2,
  },
  {
    id: 'default_5',
    leftGapCoefficient: 2,
    rightGapCoefficient: 2,
  },
  {
    id: 'default_6',
    leftGapCoefficient: 2,
  },
  {
    id: 'default_7',
    leftGapCoefficient: 2,
    rightGapCoefficient: 2,
  },
  {
    id: 'default_8',
  },
  {
    id: 'default_9',
  },
];

interface ListLoadingStubProps {
  className?: string;
  config?: ListLoadingStubItemDisplayingConfiguration[];
}

export const ListLoadingStub: FC<ListLoadingStubProps> = props => (
  <div className={classNames(styles.root, props.className)}>
    {(props.config || DEFAULT_ITEMS_STUB_CONFIGURATION).map(configuration => (
      <div
        key={configuration.id}
        className={styles.item}
        data-left={configuration.leftGapCoefficient || 0}
        data-right={configuration.rightGapCoefficient || 0}
      />
    ))}
  </div>
);
