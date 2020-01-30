import React, { FC } from 'react';
import classNames from 'classnames';
import styles from './contents-list.scss';

export const ContentsList: FC<{
  className?: string;
}> = (props) => (
  <div
    className={classNames(
      styles.contentsList,
      props.className,
    )}
  >
    { new Array(100).fill(null).map(() => <p>item</p>) }
  </div>
);
