/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
// deprecated in favor of corejs/stable and regenerator-runtime
import '@babel/polyfill';
// up-to-date polyfills:
// import 'core-js/stable';
// import 'regenerator-runtime/runtime';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Page from '../src/Page.jsx';
import store from '../src/store.js';

// function jsonDateReviver(key, value) {
//   /**
//    * input: (key) = > object key
//    *        (value) => value of the object key
//    * function: transform ISO Date String into javascript native date objects
//    * it is passed as a reviver in JSON.parse method
//    * return value => the original value
//    *  .. except if the value is ISO Date String, transforms it into javascript native Date object
//    */
//   const jsonDateRegExp = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');
//   if (jsonDateRegExp.test(value)) {
//     return new Date(value);
//   }
//   return value;
// }

// assign data received fom backend to store object
// __INITIAL_DATA__  is the data fetched from database
if (window.__INITIAL_DATA__) {
  // if we received data no serialized,
  //   'the server sent the data stringified and browser automatically parse it and pass it'
  // we should stringify it again and parse it with jsonDateReviver
  // we can't use .parse method directly because browser parse incoming string
  //   and provide it parsed to us
  // window.ENV.__INITIAL_DATA__ = JSON.parse(JSON.stringify(window.ENV.__INITIAL_DATA__)
  //                                                        , jsonDateReviver);
  // our current following implementation assumes the data is serialized before being sent
  // this means that data values are native Date Objects
  store.initialData = window.__INITIAL_DATA__;
}

if (window.__USER_DATA__) store.userData = window.__USER_DATA__;

const element = (
  <Router>
    <Page />
  </Router>
);

ReactDOM.hydrate(element, document.getElementById('contents'));
if (module.hot) {
  module.hot.accept();
}
