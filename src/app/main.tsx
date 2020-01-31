import React from 'react';
import ReactDOM from 'react-dom';
import { configure } from 'mobx';
import { App } from './components/app/app';
import './styles/reset.scss';

configure({
  enforceActions: 'always',
});

ReactDOM.render(<App />, document.getElementById('web-help'));
