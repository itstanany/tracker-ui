import React from 'react';
import { withRouter } from 'react-router-dom';
import {
  ButtonToolbar, ControlLabel, Form, FormControl, FormGroup, Modal, Button,
  Glyphicon, NavItem, Tooltip, OverlayTrigger,
} from 'react-bootstrap';
import graphQLFetch from './graphQLFetch.js';
import withToast from './withToast.jsx';

const addTooltip = (
  <Tooltip id="addNewIssue" placement="left">
    NEW Issue
  </Tooltip>
);

class IssueAdd extends React.Component {
  /**
   * Adding New Issue Component
   * It is rendered as "plus" icon
   * On clicking the icon, a Modal appears with issue fields and submit button
   * It ADDS a new issue
   * Upon success, user is redirected to edit page with the new created issue
   */
  constructor(props) {
    /**
     * "showModal" => (Boolean) control visibility of Modal view
     */
    super(props);
    this.state = {
      showAddModal: false,
    };
    this.dismissModal = this.dismissModal.bind(this);
    this.showModal = this.showModal.bind(this);
    this.submitAddForm = this.submitAddForm.bind(this);
  }

  dismissModal() {
    /**
     * Hide the modal
     * Clear out form fields
     */
    this.setState({
      showAddModal: false,
    });
    const addForm = document.forms.addIssue;
    addForm.title.value = '';
    addForm.owner.value = '';
  }

  showModal() {
    /**
     * Make the modal visible
     */
    this.setState({
      showAddModal: true,
    });
  }

  async submitAddForm(e) {
    /**
     * Hide the modal containing the form
     * Handle submitting of Add new Issue form
     * It constructs an "issue" object form form input fields
     *  then make a request for adding the new issue
     * Upon "adding" success,
     *  navigate to edit page of the newly created issue
     */
    e.preventDefault();
    const addForm = document.forms.addIssue;
    const issue = {
      title: addForm.title.value,
      owner: addForm.owner.value,
    };
    // hide modal and clear out form fields
    // it must be after extraction of form input fields
    //  because dismissModal method clears out form input fields
    this.dismissModal();
    // return only the id to use it in navigation to edit page
    const query = `
    mutation AddIssue($issue: InputNewIssue!) {
      issueAdd(issue: $issue) {
        id
      }
    }
  `;
    const { showError } = this.props;
    const result = await graphQLFetch(query, { issue }, showError);
    if (result) {
      const { issueAdd: { id } } = result;
      if (id) {
        const { history } = this.props;
        history.push({
          pathname: `/edit/${id}`,
        });
        const { showSuccess } = this.props;
        showSuccess(`Issue with ID <${id}>  ADDED Successfully`);
      }
    }
  }

  render() {
    /**
     * This component is rendered as a Nav item "plus" icon
     * on clicking the icon, a modal appears containing a form to create a new issue
     * submit button => add the new issue in backend and navigate ot edit page
     * cancel button => hide the modal and clears  out form fields
     */
    const { showAddModal } = this.state;
    const { signedIn } = this.props;
    return (
      <React.Fragment>
        <NavItem
          onClick={this.showModal}
          disabled={!signedIn}
        >
          <OverlayTrigger
            overlay={addTooltip}
            placement="left"
            delay={50}
          >
            <Glyphicon
              glyph="plus"
            />
          </OverlayTrigger>
        </NavItem>
        <Modal show={showAddModal} keyboard onHide={this.dismissModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              Add Issue
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form name="addIssue">
              <FormGroup>
                <ControlLabel>
                  Title
                </ControlLabel>
                <FormControl
                  name="title"
                  id="title"
                  placeholder="Title Must be at LEAST 3 CHARACTERS"
                  autoFocus
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>
                  Owner
                </ControlLabel>
                <FormControl
                  name="owner"
                  id="owner"
                  placeholder="Issue Owner - Optional"
                />
              </FormGroup>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <ButtonToolbar>
              <Button
                bsStyle="link"
                onClick={this.dismissModal}
              >
                Cancel
              </Button>
              <Button
                bsStyle="primary"
                type="submit"
                onClick={this.submitAddForm}
              >
                Submit
              </Button>
            </ButtonToolbar>
          </Modal.Footer>
        </Modal>
      </React.Fragment>
    );
  }
}

export default withRouter(withToast(IssueAdd));
