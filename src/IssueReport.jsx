import React from 'react';
import { Table } from 'react-bootstrap';
import store from './store.js';
import graphQLFetch from './graphQLFetch.js';
import IssueFilter from './IssueFilter.jsx';
import withToast from './withToast.jsx';


// eslint-disable-next-line react/prefer-stateless-function
class IssueReport extends React.Component {
  /**
  * required Fields => NO
  * Render a report table of each Owner and number of associated individual statuses
   */
  static async fetchData(match, search, showError) {
    /**
     * Data fetcher from Database
     * INPUT
     *    (match) => React Router match object
     *    (search) => url search string
     *    (showError) => Information printing method
     * OUTPUT:
     *    returns data fetched from data base without any manipulation
     */
    const filter = {};
    if (search) {
      const params = new URLSearchParams(search);
      if (params.has('status')) filter.status = params.get('status');
      if (params.has('effortMin')) filter.effortMin = parseInt(params.get('effortMin'), 10);
      if (params.has('effortMax')) filter.effortMax = parseInt(params.get('effortMax'), 10);
    }
    const query = `
      query CountReportPage($status: StatusType, $effortMin: Int, $effortMax: Int) {
        counts(status: $status, effortMin: $effortMin, effortMax: $effortMax) {
          owner
          New
          Assigned
          Closed
          Fixed
        }
      }
    `;
    const result = await graphQLFetch(query, filter, showError);
    return result;
  }

  constructor(props) {
    /**
     * During Class construction: initialize state with data from common source "store"
     *  or null
     * delete store.initialData to turn it into falsy value
     * ... so not used in other component construction
     */
    super(props);
    const report = store.initialData ? store.initialData.counts : null;
    delete store.initialData;
    this.state = {
      report,
    };
    this.loadData = this.loadData.bind(this);
  }

  componentDidMount() {
    /**
     * load data only if component data hasn't been initialized
     */
    const { report } = this.state;
    if (report == null) {
      this.loadData();
    }
  }

  componentDidUpdate(prevProps) {
    /**
     * On UPDATE, only load and update state if url search string changed
     */
    const { location: { search: prevSearch } } = prevProps;
    const { location: { search } } = this.props;
    if (search !== prevSearch) {
      this.loadData();
    }
  }

  async loadData() {
    /**
     * Load date from database then update state with the new data
     */
    const {
      location: { match, search }, showError,
    } = this.props;
    const result = await IssueReport.fetchData(match, search, showError);
    if (result && result.counts) {
      this.setState({
        report: result.counts,
      });
    }
  }

  render() {
    /**
     * Report is rendered as table
     * Head row contains Individual Status ad total
     * data rows contains the owner and number of each status type
     */
    const { report } = this.state;
    if (report == null) return null;
    const statuses = ['New', 'Assigned', 'Fixed', 'Closed'];
    const headerColumns = statuses.map(status => <th key={status}>{status}</th>);
    const reportRows = report.map(counts => (
      <tr key={counts.owner}>
        <td>
          {counts.owner}
        </td>
        {statuses.map(status => <td key={status}>{counts[status]}</td>)}
        <td>
          {statuses.reduce((total, status) => total + counts[status], 0)}
        </td>
      </tr>
    ));
    return (
      <>
        <IssueFilter baseURL="/report" />
        <Table bordered responsive>
          <thead>
            <tr>
              <th />
              {headerColumns}
              <th>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {reportRows}
          </tbody>
        </Table>
      </>
    );
  }
}

const IssueReportWithToast = withToast(IssueReport);
IssueReportWithToast.fetchData = IssueReport.fetchData;

export default IssueReportWithToast;
