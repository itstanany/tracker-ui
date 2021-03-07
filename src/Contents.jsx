import React from 'react';
import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import routes from './routes.js';

// stateless component so, should be function
export default function Contents() {
  /**
   * Function that handles Routing for the Contents View Section of the Main view
   * it renders only one view in the Contents Section
   * The available Views are : IssueList, IssueEdit, IssueReport
   */
  return (
    <Switch>
      <Redirect exact from="/" to="/issues" />
      {/* Here we generate different Route(s) form "route" interface
       and attach each root path to corresponding component */}
      {routes.map(route => <Route {...route} key={route.component} />)}
    </Switch>
  );
}
