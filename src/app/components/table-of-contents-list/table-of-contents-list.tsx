import React, { FC } from 'react';
import classNames from 'classnames';
import styles from './table-of-contents-list.scss';

export const TableOfContentsList: FC<{
  className?: string;
}> = props => (
  <div className={classNames(styles.tableOfContentsList, props.className)} />
);
