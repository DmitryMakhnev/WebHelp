import React, { FC } from 'react';
import classNames from 'classnames';
import styles from './contents-panel.scss';
import { ContentsList } from '../contents-list/contents-list';

export const ContentsPanel: FC<{
  className?: string;
}> = (props) => (
  <div
    className={classNames(
      styles.contentsPanel,
      props.className,
    )}
  >
    <ContentsList />
  </div>
);
