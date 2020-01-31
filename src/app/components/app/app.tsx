import React, { FC } from 'react';
import styles from './app.scss';
import { MainContent } from '../main-content/main-content';
import { Header } from '../header/header';
import { TableOfContentsPanelHoc } from '../../higher-order-components/table-of-contents-panel-hoc';

export const App: FC = () => (
  <div className={styles.root}>
    <Header className={styles.header} />
    <TableOfContentsPanelHoc className={styles.TableOfContentsPanel} />
    <MainContent className={styles.mainContent} />
  </div>
);
