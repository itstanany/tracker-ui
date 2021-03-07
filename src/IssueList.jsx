import React from 'react';
import { Button, Pagination } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import graphQLFetch from './graphQLFetch.js';
import IssueDetail from './IssueDetail.jsx';
import IssueFilter from './IssueFilter.jsx';
import IssueTable from './IssueTable.jsx';
import store from './store.js';
import withToast from './withToast.jsx';

const SECTION_SIZE = 5;

function PageLink({
  page, activePage, children, params,
}) {
  /**
   * INPUT: Required
   *  (page) Int => number of page to be fetched from data and rendered
   *      page === 0 means the "children" should be "disabled"
   *  (activePage) Int =>
   *   ... currently rendered page from URL search param "page" (active) -- 1 by default
   *  (children) React Element => element to be wrapped by "LinkContainer"
   *  (params) URLSearchParams instance =>
   *   ... currently active search string in form of "URLSearchParams instance"
   * Return the "children" component wrapped by "LinkContainer" component
   * On Click the returned wrapped component:
   *  browser url "search sting" is updated with
   *  ... "page" property to be equal to the supplied  "page" value
   */

  if (page === 0) return React.cloneElement(children, { disabled: true });
  params.set('page', page);
  return (
    <LinkContainer
      to={{ search: `?${params.toString()}` }}
      isActive={() => page === activePage}
    >
      {children}
    </LinkContainer>
  );
}


class IssueList extends React.Component {
  /**
   * The main and landing view of the application
   * It renders a table of current issues and available operations on them
   */
  static async fetchData(match, search, showError) {
    /**
     * Fetch data from resources (database)
     * data is a list of issues and the "id and description" of selected issue
     * data is filtered according to url search params
     * selected issue is determined by "id" parameter of pathname
     */
    const params = new URLSearchParams(search);
    const variables = { hasSelection: false, selectedId: 0 };
    const pageInteger = parseInt(params.get('page'), 10);
    const effortMin = parseInt(params.get('effortMin'), 10);
    const effortMax = parseInt(params.get('effortMax'), 10);
    // only include "page, effortMin, effortMax" if they are valid integers
    if (!Number.isNaN(pageInteger)) variables.page = pageInteger;
    if (!Number.isNaN(effortMin)) variables.effortMin = effortMin;
    if (!Number.isNaN(effortMax)) variables.effortMax = effortMax;
    const status = ['New', 'Assigned', 'Closed', 'Fixed'];
    // test for "status" property value validity
    if (status.includes(params.get('status'))) variables.status = params.get('status');
    if (match) {
      const { params: { id } } = match;
      const integerId = parseInt(id, 10);
      if (!Number.isNaN(integerId)) {
        variables.hasSelection = true;
        variables.selectedId = integerId;
      }
    }
    const query = `
    query ListAndDetail(
      $status: StatusType,
      $page: Int,
      $effortMin: Int,
      $effortMax: Int,
      $hasSelection: Boolean!,
      $selectedId: Int!
    ) {
      issueList(
        status: $status,
        page: $page,
        effortMin: $effortMin,
        effortMax: $effortMax
          ) {
              issues {
                        id
                        owner
                        status
                        created
                        due
                        effort
                        title
                      }
              pages
          } 
      issueGet(id: $selectedId) @include (if: $hasSelection)
      {
        id
        description
      }
    }
    `;
    const result = await graphQLFetch(query, variables, showError);
    return result;
  }

  constructor(props) {
    super(props);
    const initialData = store.initialData || { issueList: {} };
    const {
      issueList: {
        issues,
        pages,
      },
      issueGet: selectedIssue,
    } = initialData;
    delete store.initialData;
    this.state = {
      issues,
      pages,
      selectedIssue,
    };
    this.loadData = this.loadData.bind(this);
    this.closeIssue = this.closeIssue.bind(this);
    this.deleteIssue = this.deleteIssue.bind(this);
    this.restoreIssue = this.restoreIssue.bind(this);
    this.loadDetail = this.loadDetail.bind(this);
  }

  async componentDidMount() {
    /**
     * if component is server-rendered, and state is initialized, no need to get data from database
     */
    const { issues } = this.state;
    if (!issues) {
      await this.loadData();
    }
  }

  componentDidUpdate(prevProps) {
    const { match: { params: { id: prevId } }, location: { search: prevSearch } } = prevProps;
    const { match: { params: { id } }, location: { search } } = this.props;
    if (search !== prevSearch) {
      this.loadData();
    }
    if (id !== prevId) {
      this.loadDetail(id);
    }
  }

  async loadData() {
    /**
     * Fetch data from resources "database" and update the state with the fetched data
     */
    const {
      location: { search }, match, showError,
    } = this.props;
    const result = await IssueList.fetchData(match, search, showError);
    if (result) {
      const {
        issueList: {
          issues,
          pages,
        },
        issueGet: selectedIssue,
      } = result;
      this.setState({
        issues,
        pages,
        selectedIssue,
      });
    }
  }

  async loadDetail(id) {
    /**
    * Role: update "selectedIssue" state variable when url parameter "id" changes
    * return the "id" and "description" of the document with the supplied id if valid
    *   if "id" is not valid integer, update SelectedIssue state variable to null and return nothing
     */
    if (Number.isNaN(parseInt(id, 10))) {
      this.setState({ selectedIssue: null });
      return;
    }
    const { showError } = this.props;
    const query = `
    query LoadDetailIssueList($id: Int!) {
      issueGet(id: $id) {
        id
        description
      }
    }
    `;
    const data = await graphQLFetch(query, { id }, showError);
    if (data) {
      this.setState({
        selectedIssue: data.issueGet,
      });
    }
  }

  async closeIssue(index) {
    /**
     * Change the status of the issue at "index" of "issues" state variable to "Close"
     */
    const { issues } = this.state;
    const { id } = issues[index];
    const { showInfo } = this.props;
    // inform the user the issue is already closed if so, and return without performing any action
    if (issues[index].status === 'Closed') {
      if (showInfo) showInfo(`Issue with ID < ${id} > is ALREADY CLOSED`);
      return;
    }
    const query = `
      mutation CloseIssue($id: Int!, $changes: IssueInputChange!) {
        issueUpdate(id: $id, changes: $changes) {
          id status owner created due effort title description
        }
      }
    `;

    const { showError } = this.props;
    const data = await graphQLFetch(query, {
      id,
      changes: {
        status: 'Closed',
      },
    }, showError);
    if (data) {
      issues[index] = data.issueUpdate;
      this.setState({
        issues,
      });
      const { showSuccess } = this.props;
      if (showSuccess) showSuccess(`issue with ID < ${id} > CLOSED Successfully`);

      // USE THAT SNIPPED OF CODE FOR UPDATE STATE
      // WHEN YOU WANT A GUARANTEE THAT THE STATE IS UP-TO-DATE

      // this.setState((prevState) => {
      //   // const { issues } = prevState;
      //   issues[index] = data.issueUpdate;
      //   return issues;
      // });
    }
  }

  async restoreIssue(id, index) {
    /**
     * INPUT:
     *  "id": Int => Required - "id" of the issue to be restored
     *  "index" Int => Optional -index of insertion at "issues" array state variable
     * Recover a deleted issue with the id "id"
     * ... and insert it into the "issues" state variable at index "index"
     * Return nothing when the supplied "id" is not a valid integer
     * Default insertion index to zero when "index" is not a valid integer
     */
    if (Number.isNaN(parseInt(id, 10))) return;
    let insertionIndex = index;
    if (Number.isNaN(parseInt(index, 10))) {
      insertionIndex = 0;
    }
    const { showError } = this.props;
    const query = `
      mutation RestoreIssueFromIssueList($id: Int!) {
        issueRestore(id: $id) {
          id
          status
          owner
          created
          effort
          due
          title
          description
        }
      }
    `;
    const data = await graphQLFetch(query, { id }, showError);
    if (data) {
      this.setState((prevState) => {
        const { issues } = prevState;
        issues.splice(insertionIndex, 0, data.issueRestore);
        return { issues };
      });
      const { showSuccess } = this.props;
      showSuccess(`Issue with ID < ${id} > RESTORED Successfully`);
    }
  }

  async deleteIssue(index) {
    /**
     * (index) =>
     *  Integer represents the index of the selected issue in "issues" array state property
     * Steps
     * Delete an issue from database,
     *  if, the deleted issue is selected, return and render main "issues" view
     *  update the state by removing deleted issue
     */
    let { issues } = this.state;
    const { id } = issues ? issues[index] : null;
    const query = `
        mutation deleteIssue($id: Int!) {
          issueDelete(id: $id)
        }
    `;
    const { showError } = this.props;
    const result = await graphQLFetch(query, { id }, showError);
    if (result && result.issueDelete) {
      const { location: { pathname } } = this.props;
      this.setState((prevState) => {
        // eslint-disable-next-line prefer-destructuring
        issues = prevState.issues;
        // if, the deleted issue is selected, return and render main "issues" view
        if (pathname === `/issues/${id}`) {
          const { location: { search }, history } = this.props;
          history.push({
            pathname: '/issues',
            search,
          });
        }
        issues.splice(index, 1);
        return { issues };
      });
      const { showSuccess } = this.props;
      const successMsg = (
        <span>
          {`Issue with ID <${id}> DELETED Successfully`}
          <Button
            bsStyle="link"
            onClick={(e) => { e.preventDefault(); this.restoreIssue(id, index); }}
          >
            RESTORE
          </Button>
        </span>
      );

      showSuccess(successMsg);
    }
  }


  render() {
    const {
      issues,
      selectedIssue,
      pages,
    } = this.state;
    if (!issues) return null;
    const { location: { search } } = this.props;
    const params = new URLSearchParams(search);
    let page = parseInt(params.get('page'), 10);
    // page must be Non-negative integer
    if (Number.isNaN(page) || page <= 0) page = 1;
    const startPage = (Math.floor((page - 1) / SECTION_SIZE) * SECTION_SIZE) + 1;
    const endPage = startPage + (SECTION_SIZE - 1);
    // 0 indicated we reach extremes and the pagination item must be disabled
    const previousSection = startPage === 1 ? 0 : startPage - SECTION_SIZE;
    const nextSection = endPage > pages ? 0 : startPage + SECTION_SIZE;
    const paginationItems = [];
    // build a list of pagination items. Each one is wrapped by "LinkContainer" component
    for (let i = startPage, end = Math.min(endPage, pages); i <= end; i += 1) {
      params.set('page', i);
      paginationItems.push((
        <PageLink params={params} page={i} activePage={page} key={i}>
          <Pagination.Item>
            {i}
          </Pagination.Item>
        </PageLink>
      ));
    }
    return (
      <React.Fragment>
        <IssueFilter baseURL="/issues" />

        <IssueTable
          issues={issues}
          closeIssue={this.closeIssue}
          deleteIssue={this.deleteIssue}
        />

        <Pagination>
          <PageLink params={params} page={previousSection}>
            <Pagination.Item>
              &lt;
            </Pagination.Item>
          </PageLink>
          {paginationItems}
          <PageLink params={params} page={nextSection}>
            <Pagination.Item>
              &gt;
            </Pagination.Item>
          </PageLink>
        </Pagination>

        <IssueDetail issue={selectedIssue} />
      </React.Fragment>
    );
  }
}

const IssueListWithToast = withToast(IssueList);
IssueListWithToast.fetchData = IssueList.fetchData;
export default IssueListWithToast;
