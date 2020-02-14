import React, { ChangeEvent, FC, ReactElement } from 'react';
import classNames from 'classnames';
import styles from './text-input.scss';
import { generateUniqClientSideId } from '../../../../../lib/id/generate-uniq-client-side-id';

interface TextInputProps {
  className?: string;
  id?: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  withOutLabel?: boolean;
  icons?: ReactElement|null,
}

export const TextInput: FC<TextInputProps> = props => {
  const resolvedId = props.id || generateUniqClientSideId('text-input');
  const resolvedType = props.type || 'text';

  return (
    <div className={classNames(styles.root, props.className)}>
      <input
        className={styles.input}
        type={resolvedType}
        id={resolvedId}
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange}
      />
      {props.icons
        ? (
          <label htmlFor={resolvedId} className={styles.icons}>
            { props.icons }
          </label>
        )
        : null}
      <label htmlFor={resolvedId} className={styles.background}>
        {/* accessibility helper for placeholder only case */}
        { props.withOutLabel !== false &&
          <span className={styles.hiddenLabelText}>{ props.placeholder }</span>}
      </label>
    </div>
  );
};
