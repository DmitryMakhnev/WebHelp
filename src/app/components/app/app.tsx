import React, { FC } from 'react';
import { IntlProvider } from 'react-intl';
import enMessages from '../../../../lang/en.json';
import { Layout } from '../layout/layout';

export const App: FC = () => (
  <IntlProvider
    locale="en"
    messages={enMessages as Record<string, string>}
  >
    <Layout />
  </IntlProvider>
);
