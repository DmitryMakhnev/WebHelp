import React, { FC } from 'react';
import styles from './app.scss';
import { ContentsPanel } from '../contents-panel/contents-panel';
import { MainContent } from '../main-content/main-content';
import { Header } from '../header/header';

export const App: FC = () => (
  <div className={styles.root}>
    <Header className={styles.header} />
    <ContentsPanel className={styles.contentsPanel} />
    <MainContent className={styles.mainContent} />
  </div>
);
