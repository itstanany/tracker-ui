import React from 'react';
import {
  Grid, Nav, Navbar, NavItem, Col,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Contents from './Contents.jsx';
import IssueAdd from './IssueAdd.jsx';
import Search from './Search.jsx';
import SignInNavItem from './SignInNavItem.jsx';
import withToast from './withToast.jsx';
import UserContext from './UserContext.jsx';
import graphQLFetch from './graphQLFetch.js';
import store from './store.js';


function NavBar({ user, onUserChange }) {
  return (
    <Navbar fluid>
      <Navbar.Header>
        <Navbar.Brand>
          Issue Tracker
        </Navbar.Brand>
      </Navbar.Header>
      <Nav>
        <LinkContainer exact to="/">
          <NavItem>
            HOME
          </NavItem>
        </LinkContainer>
        <LinkContainer to="/issues">
          <NavItem>
            ISSUES
          </NavItem>
        </LinkContainer>
        <LinkContainer to="/report">
          <NavItem>
            REPORT
          </NavItem>
        </LinkContainer>
      </Nav>
      <Col sm={5}>
        {/* we used Navbar.Form to adjust margins and alignment with Nav items adjacent */}
        <Navbar.Form>
          <Search />
        </Navbar.Form>
      </Col>
      <Nav pullRight>
        <IssueAdd signedIn={user.signedIn} />
        <SignInNavItem user={user} onUserChange={onUserChange} />
      </Nav>
    </Navbar>
  );
}

function Footer() {
  return (
    <small>
      <p className="text-center">
        The full source code of this project can be found at Github
        {' '}
        <a
          href="https://github.com/ahmedalima/tracker-ui"
          rel="noreferrer"
          target="_blank"
        >
          UI
        </a>
        &nbsp;
        and
        &nbsp;
        <a
          href="https://github.com/ahmedalima/tracker-api"
          rel="noreferrer"
          target="_blank"
        >
          API
        </a>
      </p>
    </small>
  );
}


// eslint-disable-next-line react/prefer-stateless-function
class Page extends React.Component {
  /**
   * Render the Principal View of the Website
   * The View consists of 3 sections:
   *  NavBar Section
   *  Contents Section - This section renders one of the different
   *   views depending on the current URL
   *    IssueList
   *    IssueEdit
   *    IssueReport
   *    NotFound
   *  Footer Section
   */

  static async fetchData(cookie) {
    /**
     * Fetch user data
     */
    const query = `
      query {
        user {
          givenName
          signedIn
        }
      }
    `;
    const result = await graphQLFetch(query, null, null, cookie);
    return result;
  }

  constructor(props) {
    /**
     * Load data from global store object if available
     * otherwise, set user to null
     */
    super(props);
    const user = store.userData ? store.userData.user : null;
    delete store.userData;
    this.state = {
      user,
    };
    this.loadData = this.loadData.bind(this);
    this.onUserChange = this.onUserChange.bind(this);
  }

  async componentDidMount() {
    // const { user: { signedIn } } = this.state;
    const { user } = this.state;
    if (user == null) {
      await this.loadData();
    }
  }

  onUserChange(user) {
    /**
     * Update the state variable "user" with the supplied argument "user"
     */
    this.setState({ user });
  }

  async loadData() {
    /**
     * Load user sign in data and update the state with fetched data
     */
    try {
      const data = await Page.fetchData();
      if (data) this.setState({ user: data.user });
    } catch (e) {
      const { showError } = this.props;
      if (showError) showError(`Error Fetching User Data: ${e}`);
    }
  }


  render() {
    /**
     * render the different sections of the program
     * In case of user state variable is "null" => which means the component is not mounted yet
     *  return null and do not return anything
     */
    const {
      user,
    } = this.state;
    if (user == null) return null;
    return (
      <React.Fragment>
        <NavBar user={user} onUserChange={this.onUserChange} />
        <Grid fluid>
          <UserContext.Provider value={user}>
            <Contents />
          </UserContext.Provider>
        </Grid>
        <Footer />
      </React.Fragment>
    );
  }
}

// Make toast message methods available as properties
const PageWithToast = withToast(Page);
// assign the static method "fetchData" to the wrapped component
PageWithToast.fetchData = Page.fetchData;
export default PageWithToast;
