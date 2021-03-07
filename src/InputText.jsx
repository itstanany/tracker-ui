import React from 'react';


function format(text) {
  /**
   * This function Used to ensure that the return value is string
   * If the input is not string return empty string
   * otherwise, return string supplied
   */
  return (text != null ? text : '');
}

function unformat(text) {
  /**
   * Ensure the return value is
   * ... string with length more then or equal to 1
   * or null
   * Used to send data to server
   */
  return (text.trim().length !== 0 ? text : null);
}

// eslint-disable-next-line react/prefer-stateless-function
class InputText extends React.Component {
  /**
   * Specialized Text Input Component
   * On Input component Loses Focus, emits a string with length >= 1 or null
   * It renders as a default "input" component,
   * ... but if "tag" property is supplied as a property, use the specified tag
   */
  constructor(props) {
    super(props);
    const { value } = this.props;
    this.state = {
      value: format(value),
    };
    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  onChange(e) {
    /**
     * update the component state variable "value" on every user stroke
     * No test for valid input, accept anything
     */
    this.setState({
      value: e.target.value,
    });
  }

  onBlur(e) {
    /**
     * On losing focus, call parent onChange method with the unformatted input value
     *  as the second argument and original firing event as the first argument
     */
    const { onChange } = this.props;
    const { value } = this.state;
    if (onChange) onChange(e, unformat(value));
  }

  render() {
    /**
     * Render "input" as default but use supplied "tag" if supplied as property
     */
    const {
      tag = 'input', ...remaining
    } = this.props;
    const { value } = this.state;
    return (
      React.createElement(tag, {
        ...remaining,
        value,
        onChange: this.onChange,
        onBlur: this.onBlur,
      }));
  }
}

export default InputText;
