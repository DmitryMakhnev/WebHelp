import React, { FC, ReactElement } from 'react';
import classNames from 'classnames';
import styles from './info-message.scss';

interface InfoMessageProps {
  className?: string;
  actions?: ReactElement;
}

export const InfoMessage: FC<InfoMessageProps> = props => (
  <div className={classNames(styles.root, props.className)}>
    {props.children}
    {props.actions && (
      <div className={styles.actions}>
        { props.actions }
      </div>
    )}
  </div>
);
