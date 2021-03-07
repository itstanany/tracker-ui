import React from 'react';
import ToastComponent from './ToastComponent.jsx';

function withToast(ParentComponent) {
  /**
   * Higher Order component
   * It takes a component as argument,
   *  and returns a component that holds the state and variable required for managing toast message
   * It makes methods that manages the toast message available as properties to supplied component
   */
  return (
    class ToastWrapper extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          toastVisibility: false,
          toastMessage: '',
          toastStyle: 'success',
        };
        this.showError = this.showError.bind(this);
        this.showSuccess = this.showSuccess.bind(this);
        this.showInfo = this.showInfo.bind(this);
        this.dismissToast = this.dismissToast.bind(this);
      }

      showError(msg) {
        /**
         * Render a toast message with the message "msg" and styled "DANGER"
        */
        this.setState({
          toastMessage: msg,
          toastVisibility: true,
          toastStyle: 'danger',
        });
      }

      showSuccess(msg) {
        /**
         * Render a toast message with the message "msg" and styled "SUCCESS"
        */
        this.setState({
          toastVisibility: true,
          toastMessage: msg,
          toastStyle: 'success',
        });
      }

      showInfo(msg) {
        /**
         * Render a toast message with the message "msg" and styled "INFO"
        */
        this.setState({
          toastVisibility: true,
          toastMessage: msg,
          toastStyle: 'info',
        });
      }

      dismissToast() {
        /**
         * HIDE THE TOAST MESSAGE
         */
        this.setState({
          toastVisibility: false,
        });
      }

      render() {
        const {
          toastMessage, toastStyle, toastVisibility,
        } = this.state;

        return (
          <React.Fragment>
            <ParentComponent
              showError={this.showError}
              showSuccess={this.showSuccess}
              showInfo={this.showInfo}
              {...this.props}
            />

            <ToastComponent
              showing={toastVisibility}
              bsStyle={toastStyle}
              onDismiss={this.dismissToast}
            >
              {toastMessage}
            </ToastComponent>
          </React.Fragment>
        );
      }
    }
  );
}

export default withToast;
