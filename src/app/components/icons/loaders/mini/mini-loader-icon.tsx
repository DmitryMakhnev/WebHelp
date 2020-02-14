import React, { FC } from 'react';
import classNames from 'classnames';
import styles from './mini-loader-icon.scss';

interface MiniLoaderIconProps {
  className?: string;
}

export const MiniLoaderIcon: FC<MiniLoaderIconProps> = props => (
  // just first normal loader which I found fast
  <svg
    className={classNames(styles.root, props.className)}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 6c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1" opacity=".95" />
    <path
      d="M9 6.804c.476-.275.641-.89.366-1.366l-2-3.464A1.003 1.003 0 0 0 6 1.608c-.476.275-.641.89-.366 1.366l2 3.464c.275.476.89.64 1.366.366"
      opacity=".85"
    />
    <path
      d="M6.804 9a1.003 1.003 0 0 0-.366-1.366l-3.464-2A1.003 1.003 0 0 0 1.608 6a1.003 1.003 0 0 0 .366 1.366l3.464 2c.476.275 1.09.11 1.366-.366"
      opacity=".75"
    />
    <path d="M6 12c0-.55-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1" opacity=".65" />
    <path
      d="M6.804 15a1.003 1.003 0 0 0-1.366-.366l-3.464 2c-.477.275-.641.89-.366 1.366.275.476.89.641 1.366.366l3.464-2c.476-.275.64-.89.366-1.366"
      opacity=".55"
    />
    <path
      d="M9 17.196a1.003 1.003 0 0 0-1.366.366l-2 3.464A1.003 1.003 0 0 0 6 22.392c.476.275 1.091.11 1.366-.366l2-3.464A1.003 1.003 0 0 0 9 17.196"
      opacity=".45"
    />
    <path d="M12 18c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1v-4c0-.55-.45-1-1-1" opacity=".4" />
    <path
      d="M15 17.196c-.476.275-.641.89-.366 1.366l2 3.464c.275.477.89.641 1.366.366.476-.275.641-.89.366-1.366l-2-3.464A1.003 1.003 0 0 0 15 17.196"
      opacity=".35"
    />
    <path
      d="M17.196 15a1.003 1.003 0 0 0 .366 1.366l3.464 2c.477.275 1.091.11 1.366-.366a1.003 1.003 0 0 0-.366-1.366l-3.464-2a1.003 1.003 0 0 0-1.366.366"
      opacity=".25"
    />
    <path d="M18 12c0 .55.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1h-4c-.55 0-1 .45-1 1" opacity=".2" />
    <path
      d="M17.196 9c.275.476.89.641 1.366.366l3.464-2c.477-.275.641-.89.366-1.366a1.003 1.003 0 0 0-1.366-.366l-3.464 2c-.476.275-.64.89-.366 1.366"
      opacity=".15"
    />
    <path
      d="M15 6.804c.476.275 1.091.11 1.366-.366l2-3.464A1.003 1.003 0 0 0 18 1.608a1.003 1.003 0 0 0-1.366.366l-2 3.464A1.003 1.003 0 0 0 15 6.804"
      opacity=".1"
    />
  </svg>
);
