import React, { FC, ReactElement } from 'react';
import classNames from 'classnames';
import styles from './error-message.scss';

interface ErrorMessageProps {
  className?: string;
  actions?: ReactElement;
}

export const ErrorMessage: FC<ErrorMessageProps> = props => (
  <div className={classNames(styles.root, props.className)}>
    {props.children}
    {props.actions && (
      <div className={styles.actions}>
        { props.actions }
      </div>
    )}
  </div>
);
