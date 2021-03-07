import React from 'react';
import { matchPath, StaticRouter } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';
import routes from '../src/routes.js';
import store from '../src/store.js';
import Page from '../src/Page.jsx';
import template from './template.js';

export default async function render(req, res) {
  /**
   * input: (req) => request object, (res) => response object
   * output: (return value) => returns response object with server-side generated
   *   HTML file contains view matched with req.url
   * This function fetches data from database associated with matched view url
   *   and pass it to store module
   * then construct react element that matches req.url
   * then send response object with body as HTML file of the view
   */
  let initialData;
  // activeRoute is the routes element (object) that contains path and component property
  // Array.find() returns the array element
  // ... that for it the predicated (argument) returned true
  const activeRoute = routes.find(route => matchPath(req.path, route.path));
  if (activeRoute && activeRoute.component.fetchData) {
    // get match object which contains the path and parameters
    const match = matchPath(req.path, activeRoute);
    // Extract and send search string to fetchData method
    // as some components (Issue List) uses it
    const searchIndex = req.url.indexOf('?');
    const searchString = req.url.substr(searchIndex) || '';
    initialData = await activeRoute.component
      .fetchData(match, searchString, null, req.headers.cookie);
    // store fetched data in store module
    store.initialData = initialData;
  }
  let userData;
  if (Page.fetchData) {
    /**
     * Get user credentials and store it in "store" global object
     */
    userData = await Page.fetchData(req.headers.cookie);
    store.userData = userData;
  }

  const context = {};
  let element = (
    <StaticRouter location={req.url} context={context}>
      <Page />
    </StaticRouter>
  );
  element = ReactDOMServer.renderToString(element);
  if (context.url) {
    // in case of initiation of redirect by react router, instruct browser to execute the redirect
    // 301 permanent-redirect instruct client to permanently redirect the requested page
    //    also, in 301: SEO bots are redirected and the ranking
    //       for the requested page is moved to the ranking of the target page.
    // 307 temporary-redirect, instruct client to TEMPORARILY redirect the requested page
    //    also, in 307: SEO bots are redirected and the ranking
    //       for the requested page IS NOT moved to the ranking of the target page.
    res.redirect(307, context.url);
  } else {
    res.send(template(element, initialData, userData));
  }
}
