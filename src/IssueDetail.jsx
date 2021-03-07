import React from 'react';
import withToast from './withToast.jsx';

function IssueDetail({ issue }) {
  /**
   * Component to display the details of supplied issue
   * it displays the "id" and "description" of the "issue"
   */
  if (issue) {
    return (
      <>
        <h1>
          Description ID:&nbsp;
          &lt;
          {issue.id}
          &gt;
        </h1>
        <pre>
          {issue.description}
        </pre>
      </>
    );
  }
  return null;
}

export default withToast(IssueDetail);
