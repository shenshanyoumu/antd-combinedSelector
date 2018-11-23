import React, { Component } from 'react';
import { LocaleProvider } from 'antd';
import { Router } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';
import zhCN from 'antd/lib/locale-provider/zh_CN';

const history = createHistory();

export default class Wrapper extends Component {
  render() {
    return (
      <Router history={history}>
        <LocaleProvider locale={zhCN}>{this.props.children}</LocaleProvider>
      </Router>
    );
  }
}
