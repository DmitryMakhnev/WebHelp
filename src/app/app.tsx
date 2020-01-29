import React from 'react';
import styles from './app.scss';

export const App: React.FC = () => (
  <div className={styles.App}>
    Hello
    <div className={styles.planetIcon} />
  </div>
);
