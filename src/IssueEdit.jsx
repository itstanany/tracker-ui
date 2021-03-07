import React from 'react';
import {
  ControlLabel,
  Form,
  FormGroup,
  Panel,
  FormControl,
  Col,
  ButtonToolbar,
  Button,
  Alert,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';
import graphQLFetch from './graphQLFetch.js';
import store from './store.js';
import InputText from './InputText.jsx';
import InputDate from './InputDate.jsx';
import InputInteger from './InputInteger.jsx';
import withToast from './withToast.jsx';
import UserContext from './UserContext.jsx';

class IssueEdit extends React.Component {
  /**
   * Form to edit the issue
   * rendered as panel that contains form in its body
   */
  // eslint-disable-next-line no-unused-vars
  static async fetchData(match, search, showError) {
    /**
     * Function to fetch appropriate data from te back-end
     * input: (match) => react-router match object
     *        (search) => url search string
     * output: (data) => data object returned from back-end
     *                   it may have data or null
     */
    const { params: { id } } = match;
    const query = `
      query GetIssueEditComponent($id: Int!) {
        issueGet(id: $id) {
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
    return data;
  }

  constructor(props) {
    /**
     * During component construction, loadData from global shared data store
     * ... or initiate issue state with null to indicate no valid
     * state variables:
     *  issue: object containing fields of Issue type in schema
     *  invalidFields: object contains names of invalid fields
     *    propertyName => fields's name
     *    value: boolean value, true means invalid and false means valid field
     *  showingValidity: boolean var to control showing of error message prompting invalid fields
     */
    super(props);
    const issue = store.initialData ? store.initialData.issueGet : null;
    delete store.initialData;
    this.state = {
      issue,
      invalidFields: {},
      showingValidity: false,
    };
    this.onChange = this.onChange.bind(this);
    this.loadData = this.loadData.bind(this);
    this.applyUpdate = this.applyUpdate.bind(this);
    this.onValidityChange = this.onValidityChange.bind(this);
    this.showValidity = this.showValidity.bind(this);
    this.dismissValidity = this.dismissValidity.bind(this);
  }

  componentDidMount() {
    /**
     * Load data from database if component mounted with no valid issue
     * It is called when component is mounted from browser rendering
     * ... by reaching this component from other component by navigation inside website
     */
    const { issue } = this.state;
    if (issue == null) {
      this.loadData();
    }
  }

  componentDidUpdate(prevProps) {
    /**
     * Load the data only if user navigate to another issue
     */
    const { match: { params: { id: prevId } } } = prevProps;
    const { match: { params: { id } } } = this.props;
    if (id !== prevId) this.loadData();
  }

  onValidityChange(e, validity) {
    /**
     * Function to control state of invalidFields state variable
     * if supplied "validity" argument is true, remove the field name from list
     *  otherwise add or keep it
     * showingValidity is true only whenever there is at least one invalid field

     * input: (e) => event object that triggered the action
     *        (validity) => boolean argument stating whenever field is valid or not
     * output: updating invalidFields and showingValidity state variable
     */
    const { name } = e.target;
    this.setState((prevState) => {
      const invalidFields = { ...prevState.invalidFields, [name]: !validity };
      if (validity) delete invalidFields[name];
      return {
        invalidFields,
        showingValidity: Object.keys(invalidFields).length !== 0,
      };
    });
  }


  onChange(e, unformattedValue) {
    /**
     * update the state with the new changes in any form field
     * test for validity of title field input

     * input: (unformattedValue) =>
     * ... Value valid for direct storing in db, supplied by specialized input component.
     * (e) => event object handled by this method

     * output: update the state with the input value if valid
     * otherwise, return with no action
     */
    const { value: originalValue, name } = e.target;
    const { invalidFields } = this.state;
    const value = unformattedValue !== undefined ? unformattedValue : originalValue;
    // test for title validity
    // title must e at least 3 characters long
    if (name === 'title') {
      if (value.length < 3) {
        if (!invalidFields.title) this.onValidityChange(e, false);
        return;
      }
      if (invalidFields.title) this.onValidityChange(e, true);
    }

    // USE THE FOLLOWING CODE FOR INCOMPLETE VALIDATION OF OWNER FIELD
    // INCOMPLETE BECAUSE IT DEPENDS ON STATUS COMPONENT

    // else if (name === 'owner') {
    //   if (issue.status === 'Assigned' && !value) {
    //     if (!invalidFields.owner) this.onValidityChange(e, false);
    //     return;
    //   }
    //   if (invalidFields.owner) this.onValidityChange(e, true);
    // }
    this.setState(prevState => ({
      issue: { ...prevState.issue, [name]: value },
    }));
  }


  showValidity() {
    /**
     * permission to printing validation error message
     * update "showingValidity" state variable to true
     */
    this.setState({
      showingValidity: true,
    });
  }

  dismissValidity() {
    /**
     * Stop rendering validation error message
     */
    this.setState({
      showingValidity: false,
    });
  }

  async loadData() {
    /**
     * Load data from the db
     * update state when valid data returns
     */
    const {
      location: { search }, match, showError,
    } = this.props;
    const data = await IssueEdit.fetchData(match, search, showError);
    // {} empty object means no document is available in back-end with the requested id
    this.setState({
      issue: data ? data.issueGet : {},
      invalidFields: {},
    });
  }

  async applyUpdate() {
    /**
     * Handler of submit button of Edit form
     * execute update operation then update the state with the returned update issue
     */
    const {
      issue: { id, created, ...changes },
      invalidFields,
    } = this.state;
    if (Object.keys(invalidFields).length > 0) {
      if (this.showValidity) this.showValidity();
      return;
    }
    const query = `
    mutation UpdateIssueIssueEdit($id: Int!, $changes: IssueInputChange!) {
      issueUpdate(id: $id, changes: $changes) {
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

    const { showError } = this.props;
    const updatedIssue = await graphQLFetch(query, { id, changes }, showError);
    if (updatedIssue) {
      this.setState({
        issue: updatedIssue.issueUpdate,
        invalidFields: {},
      });
      const { showSuccess } = this.props;
      showSuccess(`Issue with ID <${id}> UPDATED Successfully`);
    }
  }


  render() {
    /**
     * Render method is executed when
     *   the properties change,
     *   state changes
     * So, when click on next or prev button, render is executed
     * and when state is changes by "loadData method", it's executed again
     */
    const { issue } = this.state;
    const { match: { params: { id: idParam } } } = this.props;
    // prevent rendering
    //  before mounting
    //  and server rendering in case no available issue with the specified id
    if (issue == null) {
      // we must use this test because continuing "render" method execution
      // ... with "issue" state variable equal to "null"
      // ... will throw errors on accessing properties of issue of "accessing property of "null"
      return null;

      // USE THE FOLLOWING SNIPPET IF YOU WANT SERVER RENDERING FOR NOT FOUND PAGE
      // IT WILL CAUSE CONFLICT DURING HYDRATION ON BROWSER
      // AS THE VIEW CONSTRUCTED BEFORE COMPONENTDIDMOUNT (ISSUE=NULL => RETURN NULL)
      // ... IS COMPARED TO SERVER RENDERING (WHICH CONTAINS NOT FOUND STATEMENT)

      // // eslint-disable-next-line no-undef
      // if (__isBrowser__) return null;
      // return (
      //   <h1>
      //     Issue With ID:
      //     &nbsp;
      //     &lt;
      //     {idParam}
      //     &gt;
      //     &nbsp;
      //     NOT FOUND
      //   </h1>
      // );
    }

    const { issue: { id } } = this.state;
    // prevent rendering of Not Found statement before updating state
    // ... and ensure there is no an document in database with that id.
    // id ==null => no valid issue in current state.
    // idParam != null => no document with that id in database.
    // if we used "if(parseInt(id, 10) !== parseInt(idParam, 10))"
    //    this will lead to rendering "Not FOund page" before componentDidUpdate get executed,
    // ... causing flickering in the view
    // ... between" not found page" and updated edit view with the new id
    if (id == null) {
      if (idParam != null) {
        return (
          <h1>
            Issue With ID:
            &nbsp;
            &lt;
            {idParam}
            &gt;
            &nbsp;
            NOT FOUND
          </h1>
        );
      }
      return null;
    }
    const {
      issue: {
        status, created, owner, effort, due, title, description,
      },
      showingValidity,
      invalidFields,
    } = this.state;
    // store the default context in user variable
    const user = this.context;

    // USE THE FOLLOWING CODE IF YOU WANT TO WRAP ERROR MESSAGE BY "COLLAPSE" COMPONENT
    // AND PREVENT FLICKERING APPEARANCE OF COLLAPSE IF RENDERED DIRECTLY IN ITS POSITION

    // let errorMessage;
    // if (showingValidity) {
    //   errorMessage = (
    //     <Collapse in={showingValidity}>
    //       <Alert bsStyle="danger" onDismiss={this.dismissValidity}>
    //         Please Correct Errors before submitting
    //       </Alert>
    //     </Collapse>
    //   );
    // }
    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title>
            Edit Issue with ID:
            {id}
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <Form name="editForm" horizontal>
            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Created
              </Col>
              <Col sm={9}>
                <FormControl.Static>
                  {created ? created.toDateString() : null}
                </FormControl.Static>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Status
              </Col>
              <Col sm={3}>
                <FormControl
                  componentClass="select"
                  value={status}
                  name="status"
                  onChange={this.onChange}
                >
                  <option value="New">
                    New
                  </option>
                  <option value="Assigned">
                    Assigned
                  </option>
                  <option value="Closed">
                    Closed
                  </option>
                  <option value="Fixed">
                    Fixed
                  </option>
                </FormControl>
              </Col>
            </FormGroup>
            <FormGroup>
              {/*
              <FormGroup
              validationState={invalidFields.owner ? 'error' : 'success'}
              >
              // we can't use this validation as it requires association with "status" component
             */}
              <Col sm={3} componentClass={ControlLabel}>
                Owner
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass={InputText}
                  key={id}
                  name="owner"
                  value={owner}
                  onChange={this.onChange}
                />
                {/* <FormControl.Feedback /> */}
              </Col>
            </FormGroup>
            <FormGroup
              validationState={invalidFields.due ? 'error' : 'success'}
            >
              <Col sm={3} componentClass={ControlLabel}>
                Due Date
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass={InputDate}
                  key={id}
                  name="due"
                  value={due}
                  onChange={this.onChange}
                  onValidityChange={this.onValidityChange}
                />
                {/* this component requires "bootstrap fonts" to be present */}
                <FormControl.Feedback />
              </Col>

            </FormGroup>
            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Effort (Days)
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass={InputInteger}
                  key={id}
                  name="effort"
                  value={effort}
                  onChange={this.onChange}
                />
              </Col>
            </FormGroup>
            <FormGroup
              validationState={invalidFields.title ? 'error' : 'success'}
            >
              <Col sm={3} componentClass={ControlLabel}>
                Title
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass={InputText}
                  key={id}
                  name="title"
                  value={title}
                  onChange={this.onChange}
                />
                <FormControl.Feedback />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Description
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass={InputText}
                  tag="textarea"
                  key={id}
                  name="description"
                  value={description}
                  cols={10}
                  rows={7}
                  onChange={this.onChange}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col smOffset={3} sm={9}>
                <ButtonToolbar>
                  <LinkContainer to="/issues">
                    <Button type="button" bsStyle="link">
                      Back
                    </Button>
                  </LinkContainer>
                  <Button
                    disabled={!user.signedIn}
                    type="button"
                    onClick={this.applyUpdate}
                    bsStyle="primary"
                  >
                    Submit
                  </Button>
                </ButtonToolbar>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col smOffset={3} sm={9}>
                {/* {errorMessage} */}
                {/*
                // USING THIS WILL CAUSE FLICKERING BECAUSE COLLAPSE ELEMENT RENDERING AREA
                // IS NOT CONSTANT, BUT INCREASE GRADUALLY DEPENDING ON CONTENT SIZE
                // SO, IT IS ADVISABLE TO USE THA CODE WITH VARIABLE ASSIGNMENT
                <Collapse in={showingValidity}>
                  <Alert bsStyle="danger" onDismiss={this.dismissValidity}>
                    Please Correct Errors before submitting
                  </Alert>
                </Collapse>
                */}

                <Alert
                  bsStyle="danger"
                  onDismiss={this.dismissValidity}
                  hidden={!showingValidity}
                >
                  {
                    /**
                     *  we used property "hidden" to avoid flickering effect of collapse
                     * this component has fixed width in contrast to collapse
                     * so, Alert doesn't have flickering appearance
                     */
                  }
                  Please Correct Errors before submitting!
                  <br />
                  {invalidFields.title ? 'Title Must be at least 3 characters' : null}
                  {invalidFields.due ? 'Due Date must be a valid Date' : null}
                </Alert>
              </Col>
            </FormGroup>
          </Form>
        </Panel.Body>
        <Panel.Footer>
          <Link to={`/edit/${id - 1}`}>
            Previous
          </Link>
          {' | '}
          <Link to={`/edit/${id + 1}`}>
            Next
          </Link>
        </Panel.Footer>
      </Panel>
    );
  }
}
// make the "User" context used as the value of "this.context" explicitly
IssueEdit.contextType = UserContext;
const IssueEditWithToast = withToast(IssueEdit);
IssueEditWithToast.fetchData = IssueEdit.fetchData;

export default IssueEditWithToast;
