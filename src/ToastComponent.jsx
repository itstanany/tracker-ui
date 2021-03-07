import React from 'react';
import { Collapse, Alert } from 'react-bootstrap';

// eslint-disable-next-line react/prefer-stateless-function
export default class ToastComponent extends React.Component {
  /**
   * Toast Message component
   * It renders a toast message
   */
  componentDidUpdate() {
    /**
     * On every update - usually change in "showing" property
     * if Toast message is rendered, set a timer to dismiss it after 5 seconds
     * also, clear any timer set before to avoid overlapping
     */
    const { showing, onDismiss } = this.props;
    if (showing) {
      clearInterval(this.dismissToast);
      this.dismissToast = setTimeout(onDismiss, 5000);
    }
  }

  componentWillUnmount() {
    /**
     * TRY TO COMMENT THIS FUNCTIONALITY AND OBSERVE WHAT HAPPENS, FUNCTION EXECUTED OR UNDEFINED
     * in case of user changes the view that render the toast message
     * remove the timer associated with that view
     */
    clearInterval(this.dismissToast);
  }

  render() {
    /**
     * This is rendered as Collapsible div
     * It's positioned absolute, at lower left corner of the screen
     * Rendered for 5 seconds or on mandatory dismissing by close button
     */
    const {
      bsStyle, showing, children, onDismiss,
    } = this.props;

    return (
      <Collapse in={showing}>
        <div
          style={{
            position: 'fixed', bottom: '20px', left: '20px', zIndex: '66',
          }}
        >
          <Alert bsStyle={bsStyle} onDismiss={onDismiss}>
            {children}
          </Alert>
        </div>
      </Collapse>
    );
  }
}
