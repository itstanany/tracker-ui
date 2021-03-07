import React from 'react';


function unformat(isoDate) {
  /**
   * Return Native javascript date object if supplied argument is valid date string
   *  or return null otherwise
   * isoDate => Date string in ISO format - first 10 characters (YYYY-MM-DD)
   */
  const value = new Date(isoDate);
  return (Number.isNaN(value.getTime()) ? null : value);
}

function editFormat(dateObject) {
  /**
   * Return first 10 characters of Date in ISO string format if supplied date is valid date object
   *  or empty string otherwise
   */
  return (dateObject != null ? dateObject.toISOString().substr(0, 10) : '');
}

function displayFormat(dateObject) {
  /**
   * Preconditions: dateObject is Native Javascript date object or "null"
   * Returns Date in toDateString format
   * ... if the supplied argument (dateObject) is valid date object
   * ... or empty string "" otherwise
   */
  return (dateObject != null ? dateObject.toDateString() : '');
  // Alternate Solution
  // only accepts truthy values, example: empty string is excluded
  // return (dateObject ? dateObject.toDateString() : '');
}

class InputDate extends React.Component {
  /**
   * Specialized Component to handle Date Input Components
   * Input field that accepts only integers and dashes "-" as input
   * store input in form of dashes and integers (editFormat)
   * It guarantees that, parent component receives either
   *  ... valid date object,
   *  ... OR  null.
   * it notifies parent component about change validity by calling parent method onValidityChange
   * It has three forms of Date:
   *    Display Form: Display Date in toDateString format
   *    Edit Form: Display first 9 characters of Date ISO string
   *      stored in state variable in this format
   *    Unformatted Form: Native javascript Date object
   *      Date is sent ot parent component in this form
   */

  constructor(props) {
    super(props);
    this.state = {
      value: editFormat(props.value),
      focused: false,
      valid: true,
    };
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onFocus() {
    this.setState({
      focused: true,
    });
  }

  onChange(e) {
    /**
     * Accept all input that consists of integers and dashes
     * Check for validity occurs in onBlur method
     */
    const { value } = e.target;
    if (value.match(/^[\d-]*$/)) this.setState({ value });
  }


  onBlur(e) {
    /**
     * Update validity status of the component and
     * ... call parent onChange method in case of valid value
     */
    const {
      value, valid: oldValidity,
    } = this.state;
    const {
      onChange, onValidityChange,
    } = this.props;
    const dateValue = unformat(value);
    const valid = value === '' || dateValue != null;
    if (oldValidity !== valid && onValidityChange) onValidityChange(e, valid);
    if (valid && onChange) onChange(e, dateValue);
    this.setState({
      focused: false, valid,
    });
  }

  render() {
    /**
     * render display format in case field is out of focus and valid date
     * otherwise render edit format
     */
    const {
      value: parentValue, onValidityChange, ...remainingProps
    } = this.props;
    const {
      focused, valid, value,
    } = this.state;
    const displayValue = (focused || !valid) ? value : displayFormat(parentValue);

    return (
      <input
        {...remainingProps}
        value={displayValue}
        placeholder={focused ? 'YYYY-MM-DD' : null}
        onFocus={this.onFocus}
        onChange={this.onChange}
        onBlur={this.onBlur}
      />
    );
  }
}

export default InputDate;
