import React, { FC } from 'react';
import classNames from 'classnames';
import styles from './arrow-iocn.scss';

interface ArrowIconProps {
  className?: string;
}

export const ArrowIcon: FC<ArrowIconProps> = props => (
  <div className={classNames(styles.root, props.className)} />
);
