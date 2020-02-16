import React, { FC } from 'react';
import classNames from 'classnames';
import { Action, ActionProps } from '../base/action';
import { MiniLoaderIcon } from '../../icons/loaders/mini/mini-loader-icon';
import styles from './text-action-with-loader.scss';

interface TextActionWithLoaderProps extends ActionProps {
  showLoader: boolean;
}

export const TextActionWithLoader: FC<TextActionWithLoaderProps> = props => {
  return (
    <Action
      className={classNames(styles.root, props.className)}
      ariaLabel={props.ariaLabel}
      on={props.on}
    >
      <div className={styles.content}>
        <span className={styles.text}>{props.children}</span>
        {props.showLoader && <MiniLoaderIcon className={styles.loader} />}
      </div>
    </Action>
  );
};
