import React, { FC } from 'react';
import classNames from 'classnames';
import styles from './header.scss';

export const Header: FC<{
  className?: string;
}> = props => <header className={classNames(styles.header, props.className)} />;
