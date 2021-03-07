import React from 'react';
import {
  Button, ButtonToolbar, Col, ControlLabel, FormControl, FormGroup, InputGroup, Panel, Row,
} from 'react-bootstrap';
import URLSearchParams from 'url-search-params';
import { withRouter } from 'react-router-dom';
import InputInteger from './InputInteger.jsx';
import withToast from './withToast.jsx';


class IssueFilter extends React.Component {
  /**
   * Required Properties => "baseURL" => a pathname to which the search string is concatenated
   * Component that Allow user to filter properties "status" and define effort range
   * Upon Apply filter, properties are supplied to the Browser URL as a search parameters
   */
  constructor(props) {
    super(props);
    const { location: { search } } = this.props;
    const params = new URLSearchParams(search);
    this.state = {
      effortMin: params.has('effortMin') ? parseInt(params.get('effortMin'), 10) : null,
      effortMax: params.has('effortMax') ? parseInt(params.get('effortMax'), 10) : null,
      status: params.has('status') ? params.get('status') : '',
      changed: false,
    };
    this.statusChange = this.statusChange.bind(this);
    this.effortMinChange = this.effortMinChange.bind(this);
    this.effortMaxChange = this.effortMaxChange.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
    this.showOriginalFilter = this.showOriginalFilter.bind(this);
    this.changedStateTrue = this.changedStateTrue.bind(this);
    this.resetFilterFields = this.resetFilterFields.bind(this);
  }

  componentDidUpdate(prevProps) {
    /**
     * When url search parameters change, update the filter fields to reflect the current URL
     */
    const { location: { search: prevSearch } } = prevProps;
    const { location: { search } } = this.props;
    if (prevSearch !== search) {
      this.showOriginalFilter();
    }
  }


  statusChange(e) {
    /**
      * e => event object the initiate call to the method
      * update the state with the selected "status" from dropdown menu "select"
    */
    this.setState({
      status: e.target.value,
      changed: true,
    });
  }

  effortMinChange(e, naturalValue) {
    /**
      * naturalValue => either valid integer or "null"
      * this function is called from the specialized component "IntegerInput"
      * update the state with the final user input after user blur off the input
    */
    this.setState({
      effortMin: naturalValue,
    });
  }

  effortMaxChange(e, naturalValue) {
    /**
     * naturalValue => either valid integer or "null"
     * this function is called from the specialized component "IntegerInput"
     * update the state with the final user input after user blur off the input
     */
    this.setState({
      effortMax: naturalValue,
    });
  }

  applyFilter() {
    /**
     * push filtered properties to the Browser URL as search parameters
     * It is guaranteed that the state variables are up-to-date with the last input value
     * ... because the nested input components (InputInteger) push the changes immediately
     * ... when it loses focus. Losing focus occur by clicking in any component outside input field
     * ... including "apply" button that call this function
     */
    const params = new URLSearchParams();
    const {
      status, effortMin, effortMax,
    } = this.state;
    if (status) params.set('status', status);
    if (effortMin) params.set('effortMin', effortMin);
    if (effortMax) params.set('effortMax', effortMax);
    const search = params.toString() ? `?${params.toString()}` : '';
    const { history, baseURL, location: { pathname } } = this.props;
    history.push({
      pathname: baseURL || pathname,
      search,
    });
    const { showSuccess } = this.props;
    showSuccess('Filter Applied');
  }

  showOriginalFilter() {
    // reflect current URL on filter input properties
    const { location: { search } } = this.props;
    const params = new URLSearchParams(search);
    this.setState({
      effortMin: params.has('effortMin') ? parseInt(params.get('effortMin'), 10) : null,
      effortMax: params.has('effortMax') ? parseInt(params.get('effortMax'), 10) : null,
      status: params.has('status') ? params.get('status') : '',
      changed: false,
    });
  }

  resetFilterFields() {
    /**
     * Reset Filter Fields to reflect current active filter
     */
    this.showOriginalFilter();
    const { showInfo } = this.props;
    showInfo('Filter Fields RESET');
  }

  changedStateTrue() {
    /**
     * This function changes change property to true
     * It is called from child components that handle user input (IntegerInput)
     * ... to set "change" property instantly as the user enter valid input
     * If we changed property "change" in onChange method,
     * ... it will be postponed after the field loses focus
     * ... as "onChange" is called from child component when it loses focus
     */
    const { changed } = this.state;
    if (!changed) this.setState({ changed: true });
  }

  render() {
    /**
     * This component is rendered as initially collapsed Panel
     * Panel is toggled by clicking on panel header
     */
    const {
      status, effortMin, effortMax, changed,
    } = this.state;
    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title toggle>
            Filter Issues
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body collapsible>
          <Row>
            <Col xs={12} md={3}>
              <FormGroup>
                <ControlLabel>
                  Status
                  {' '}
                </ControlLabel>
                {' '}
                <FormControl componentClass="select" value={status} onChange={this.statusChange}>
                  <option value="">
                    (All)
                  </option>
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
              </FormGroup>
            </Col>
            <Col xs={6} sm={4} md={3} lg={2}>
              <FormGroup>
                <ControlLabel>
                  Effort Between:
                </ControlLabel>
                <InputGroup>
                  <FormControl
                    componentClass={InputInteger}
                    value={effortMin}
                    onChange={this.effortMinChange}
                    key={(parseInt(effortMin, 10)) || 'effortMin'}
                    applyOnChange={this.changedStateTrue}
                  />
                  <InputGroup.Addon>
                    -
                  </InputGroup.Addon>
                  {
                    /**
                     * Key should be updated when search params updated
                     * to keep them distinct from each other, always make effortMax +1 effortMin
                     */
                  }
                  <FormControl
                    componentClass={InputInteger}
                    value={effortMax}
                    onChange={this.effortMaxChange}
                    key={(parseInt(effortMin, 10) + 1) || 'effortMax'}
                    applyOnChange={this.changedStateTrue}
                  />
                </InputGroup>
              </FormGroup>
            </Col>
            <Col xs={6} sm={4} md={3} lg={2}>
              <FormGroup>
                {
                  /**
                   * ControlLabel to adjust vertical alignment with adjacent components
                   * we just make the label a "space"
                   * &nbsp; => Non-Breaking Space
                   */
                }
                <ControlLabel>
                  &nbsp;
                </ControlLabel>
                <ButtonToolbar>
                  <Button
                    type="button"
                    bsStyle="primary"
                    disabled={!changed}
                    onClick={this.applyFilter}
                  >
                    Apply
                  </Button>
                  <Button
                    type="button"
                    bsStyle="danger"
                    disabled={!changed}
                    onClick={this.resetFilterFields}
                  >
                    Reset
                  </Button>
                </ButtonToolbar>
              </FormGroup>
            </Col>
          </Row>
        </Panel.Body>
      </Panel>
    );
  }
}

// export a component wrapped by withRouter to have routing properties like location and history
export default withRouter(withToast(IssueFilter));
