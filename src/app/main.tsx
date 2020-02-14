import React from 'react';
import ReactDOM from 'react-dom';
import { configure } from 'mobx';
import './styles/reset.scss';
import { App } from './components/app/app';

configure({
  enforceActions: 'always',
});

ReactDOM.render(<App />, document.getElementById('web-help'));
