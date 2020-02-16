import React, { FC } from 'react';
import classNames from 'classnames';
import style from './action.scss';

export interface ActionProps {
  className?: string;
  ariaLabel: string;
  on: () => void;
}

export const Action: FC<ActionProps> = props => (
  <div className={classNames(style.root, props.className)}>
    <button
      type="button"
      onClick={props.on}
      aria-label={props.ariaLabel}
      className={style.target}
    />
    <div
      className={style.content}
      aria-hidden="true"
    >
      { props.children }
    </div>
  </div>
);
