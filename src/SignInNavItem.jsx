import fetch from 'isomorphic-fetch';
import React from 'react';
import {
  Button,
  MenuItem, Modal, NavDropdown, NavItem,
} from 'react-bootstrap';
import withToast from './withToast.jsx';

class SignInNavItem extends React.Component {
  /**
   * User Sign in Component
   * it renders either a sign in button or user name and dropdown of "sign out" link
   * it doesn't expect any user-defined supplied properties
   */
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      disabled: false,
    };
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
  }

  componentDidMount() {
    /**
     * Initialize and Auth Instance for the first mounting
     */
    const clientId = window.ENV.GOOGLE_CLIENT_ID;
    if (!clientId) {
      const { showError } = this.props;
      if (showError) showError('Missing Environment Variable Google Client ID');
      return;
    }
    window.gapi.load('auth2', () => {
      if (!window.gapi.auth2.getAuthInstance()) {
        window.gapi.auth2
          .init({
            client_id: clientId,
          })
          .then(() => this.setState({
            disabled: false,
          }));
      }
    });
  }


  showModal() {
    /**
     * Show Modal that contains sign in options
     * only show it if google client id is available
     */
    const clientId = window.ENV.GOOGLE_CLIENT_ID;
    if (!clientId) {
      const {
        showError,
      } = this.props;
      if (showError) showError('Missing Environment Variable GOOGLE_CLIENT_ID');
      return;
    }
    this.setState({
      modalVisible: true,
    });
  }

  hideModal() {
    /**
     * Hide Sign In Modal
     */
    this.setState({
      modalVisible: false,
    });
  }

  async signIn() {
    /**
     * Sign in and verify sign in id token at the back-end
     * retrieve sign in information from back-end
     * update the state by calling "OnUserChange" method
     */
    this.hideModal();
    const {
      showError,
    } = this.props;
    let googleToken;
    try {
      // PERFORM THE SIGN IN AND EXTRACT "id_token" of signed in user
      const auth2 = window.gapi.auth2.getAuthInstance();
      const googleUser = await auth2.signIn();
      googleToken = googleUser.getAuthResponse().id_token;

      // USE THIS SNIPPED DURING NO VERIFYING OF SIGN IN IN THE BACKEND

      // const givenName = googleUser.getBasicProfile().getGivenName();
      // this.setState({
      //   user: {
      //     signedIn: true,
      //     givenName,
      //   },
      // });
    } catch (e) {
      if (showError) showError(`Error Authentication with GOOGLE ${e.error}`);
    }

    try {
      // verify the sign in "id token" at the backend
      const apiEndpoint = window.ENV.UI_AUTH_ENDPOINT;
      const response = await fetch(`${apiEndpoint}/signin`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ google_token: googleToken }),
      });
      const text = await response.text();
      const { givenName, signedIn } = JSON.parse(text);
      const { onUserChange } = this.props;
      if (onUserChange) onUserChange({ givenName, signedIn });
    } catch (e) {
      if (showError) showError(`Error in Validation: ${e}`);
    }
  }


  async signOut() {
    /**
     * Sign out user
     * update the state variable to show "sign in" button
     */
    try {
      const apiEndpoint = window.ENV.UI_AUTH_ENDPOINT;
      await fetch(`${apiEndpoint}/signout`, {
        method: 'POST',
        credentials: 'include',
      });
      const auth2 = window.gapi.auth2.getAuthInstance();
      await auth2.signOut();
      const { onUserChange } = this.props;
      if (onUserChange) onUserChange({ signedIn: false, givenName: '' });
    } catch (e) {
      const {
        showError,
      } = this.props;
      if (showError) showError(`Error Signing Out: ${e}`);
    }
  }

  render() {
    /**
     * Render a "sign in" button when no user is signed in
     * If user is signed in, render it name and a dropdown of "sign out" option
     */
    const {
      modalVisible,
      disabled,
    } = this.state;
    const {
      user: {
        signedIn,
        givenName,
      },
    } = this.props;

    if (signedIn) {
      return (
        <NavDropdown
          title={givenName}
          id="signOutDropdown"
        >
          <MenuItem
            onClick={this.signOut}
          >
            SignOut
          </MenuItem>
        </NavDropdown>
      );
    }

    return (
      <React.Fragment>
        <NavItem
          onClick={this.showModal}
        >
          SignIn
        </NavItem>
        <Modal show={modalVisible} onHide={this.hideModal} bsSize="sm">
          <Modal.Header closeButton>
            <Modal.Title>
              SignIN
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Button
              block
              bsStyle="link"
              onClick={this.signIn}
              disabled={disabled}
            >
              <img
                src="https://developers.google.com/identity/images/btn_google_signin_light_normal_web.png"
                alt="Sign In"
                width="100%"
              />
            </Button>
          </Modal.Body>
          <Modal.Footer>
            <Button
              bsStyle="link"
              onClick={this.hideModal}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </React.Fragment>
    );
  }
}

// make toast message component method available as properties
export default withToast(SignInNavItem);
