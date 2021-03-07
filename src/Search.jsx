import React from 'react';
import { withRouter } from 'react-router-dom';
// eslint-disable-next-line import/extensions
import SelectAsync from 'react-select/lib/Async';
import graphQLFetch from './graphQLFetch.js';
import withToast from './withToast.jsx';

class Search extends React.Component {
  /**
   * Search By term component
   * It returns a search field
   * after user type a term "at least three characters", a list is shown of all matches
   * No required user-defined properties
   */
  constructor(props) {
    super(props);
    this.loadOptions = this.loadOptions.bind(this);
    this.onChangeSelection = this.onChangeSelection.bind(this);
  }


  onChangeSelection({ value }) {
    /**
     * (value) Int => selected issue id
     * Call this method when user selects on of list options
     * On click, navigate to issue edit of the selected issue
     */
    const { history } = this.props;
    history.push({
      pathname: `/edit/${value}`,
    });
  }

  async loadOptions(term) {
    /**
     * (term) => User input
     * Call this function when user types a term
     * Minimum input length is 3 characters
     * query the database for the input form and return an array of all returned issues
     */
    if (term && term.length < 3) return [];
    const query = `
    query search($search: String!) {
      issueSearch(search: $search) {
        id
        title
      }
    }
    `;
    const { showError } = this.props;
    const result = await graphQLFetch(query, { search: term }, showError);
    if (result) {
      return (result.issueSearch.map(issue => ({
        label: `#${issue.id}: ${issue.title}`,
        value: issue.id,
      })));
    }
    return [];
  }

  render() {
    return (
      <SelectAsync
        instanceId="select-search"
        value=""
        loadOptions={this.loadOptions}
        filterOptions={() => true}
        onChange={this.onChangeSelection}
        components={{ DropdownIndicator: null }}
        placeholder="Search by TERM"
      />
    );
  }
}

export default withRouter(withToast(Search));
