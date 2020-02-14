import React, { FC } from 'react';
import { Header } from '../header/header';
import { TableOfContentsPanelHoc } from '../../higher-order-components/table-of-contents-panel/table-of-contents-panel.hoc';
import { MainContent } from '../main-content/main-content';
import styles from './layout.scss';

export const Layout: FC<{}> = () => (
  <div className={styles.root}>
    <Header className={styles.header} />
    <TableOfContentsPanelHoc className={styles.tableOfContentsPanel} />
    <MainContent className={styles.mainContent} />
  </div>
);
