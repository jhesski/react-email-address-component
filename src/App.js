import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { store } from '_redux/store'
import './App.scss';
import SendReports from './SendReports';

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <SendReports/>
      </Provider>
    );
  }
}

export default App;
