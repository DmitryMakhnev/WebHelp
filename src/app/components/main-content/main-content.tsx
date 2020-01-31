import React, { FC } from 'react';
import classNames from 'classnames';
import styles from './main-content.scss';

export const MainContent: FC<{
  className?: string;
}> = props => (
  <main className={classNames(styles.mainContent, props.className)}>
    <h1>Main Content</h1>
  </main>
);
