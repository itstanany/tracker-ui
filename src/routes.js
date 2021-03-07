/**
 * Common Source of Truth (Interface) for the available routes in our application
 * it is used to establish structured way of attaching each route to a specific component
 * so we can reference the component by property "component" of each selected path
 */

import IssueEdit from './IssueEdit.jsx';
import IssueList from './IssueList.jsx';
import IssueReport from './IssueReport.jsx';
import NotFound from './NotFound.jsx';

const routes = [
  { path: '/issues/:id?', component: IssueList },
  { path: '/edit/:id', component: IssueEdit },
  { path: '/report', component: IssueReport },
  { component: NotFound },
];

export default routes;
