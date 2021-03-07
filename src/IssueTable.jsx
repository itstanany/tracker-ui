import React from 'react';
import {
  Button, Glyphicon, OverlayTrigger, Table, Tooltip,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { withRouter } from 'react-router-dom';
import UserContext from './UserContext.jsx';

const editTooltip = (
  <Tooltip bsStyle="info" id="editTooltip">
    Edit Issue
  </Tooltip>
);

const closeTooltip = (
  <Tooltip
    id="closeTooltip"
  >
    Close Issue
  </Tooltip>
);

const deleteTooltip = (
  <Tooltip
    id="deleteIssue"
    placement="top"
  >
    Delete Issue
  </Tooltip>
);

// eslint-disable-next-line react/prefer-stateless-function
class IssueRowPlain extends React.Component {
  /**
   * component with no state to make "context" available as property of "this"
   */
  render() {
    const {
      issue, index, closeIssue, deleteIssue, location: { search },
    } = this.props;
    /**
     * Get an issue and construct an table row that uses the supplied issue
     */
    const { id } = issue;
    const selectLocation = {
      pathname: `/issues/${id}`,
      search,
    };
    const user = this.context;
    const Row = (
      <tr>
        <td>
          {issue.id}
        </td>
        <td>
          {issue.status}
        </td>
        <td>
          {issue.owner}
        </td>
        <td>
          {issue.created ? issue.created.toLocaleString() : null}
        </td>
        <td>
          {issue.effort}
        </td>
        <td>
          {issue.due ? issue.due.toDateString() : null}
        </td>
        <td>
          {issue.title}
        </td>
        <td>
          <LinkContainer to={`/edit/${issue.id}`}>
            <OverlayTrigger
              overlay={editTooltip}
              delay={150}
              placement="top"
            >
              {/**
             * we don't use "onClick" attribute because "click event" of Button
             * propagates and handled by "LinkContainer"
             */}
              <Button
                bsSize="xsmall"
              >
                <Glyphicon
                  glyph="edit"
                />
              </Button>
            </OverlayTrigger>
          </LinkContainer>
          {' | '}
          <OverlayTrigger
            overlay={closeTooltip}
            delay={150}
            placement="top"
          >
            {/**
           * e.preventDefault() => we used it to "click" event propagation to the entire row
           */}
            <Button
              disabled={!user.signedIn}
              bsSize="xsmall"
              onClick={(e) => { e.preventDefault(); closeIssue(index); }}
            >
              <Glyphicon
                glyph="remove"
              />
            </Button>
          </OverlayTrigger>
          {' | '}
          {
            /*
              * Trash Icon for deleting an issue
            */
          }
          <OverlayTrigger
            overlay={deleteTooltip}
            placement="top"
            delay={50}
          >
            {/**
           * e.preventDefault() => we used it to "click" event propagation to the entire row
           */}
            <Button
              disabled={!user.signedIn}
              onClick={(e) => { e.preventDefault(); deleteIssue(index); }}
              bsSize="xs"
            >
              <Glyphicon
                glyph="trash"
              />
            </Button>
          </OverlayTrigger>
        </td>
      </tr>
    );
    return (
      <LinkContainer to={selectLocation}>
        {Row}
      </LinkContainer>
    );
  }
}
IssueRowPlain.contextType = UserContext;

const IssueRow = withRouter(IssueRowPlain);
// wrapped component returned from "withRouter" is "stateless" component
// stateless components can't have static properties, so delete it from wrapped component
// and leave it in the inner component only "IssueRowPlain"
delete IssueRow.contextType;

function IssueTable({ issues, closeIssue, deleteIssue }) {
  /**
   * Assign each issue to an IssueRow component to fill the table
   */
  const issueRows = issues.map(
    (issue, index) => (
      <IssueRow
        key={issue.id}
        issue={issue}
        index={index}
        closeIssue={closeIssue}
        deleteIssue={deleteIssue}
      />
    ),
  );
  return (
    <Table responsive condensed bordered hover>
      <thead>
        <tr>
          <th>
            ID
          </th>
          <th>
            Status
          </th>
          <th>
            Owner
          </th>
          <th>
            Creation Date
          </th>
          <th>
            Effort
          </th>
          <th>
            Due Date
          </th>
          <th>
            Title
          </th>
          <th>
            Actions - Authorized Only
          </th>
        </tr>
      </thead>
      <tbody>
        {issueRows}
      </tbody>
    </Table>
  );
}

export default IssueTable;
