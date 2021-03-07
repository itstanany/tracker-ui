import React from 'react';


function format(num) {
  /**
   * Receives integers and converts them to string
   * returns empty string in case of falsy input
   * We must return empty string ('') not null or undefined because "value" property of "input"
   * .... if set to undefined will be "uncontrolled" component
   * .... and if we assign new valid value to "value" state property
   * .... that affects "input" value property,
   * .... the component "input" will be changed into "Controlled" component
   * .... which will raise an warning in console
   * 0 != null => true, 0 coerce to falsy value but not null or undefined
   * undefined != null => false
   */
  return num != null ? num.toString() : '';
}

function unformat(str) {
  /**
   * emit either valid integer on base 10 for valid input,
   * or null to indicate invalid input
   */
  const integer = parseInt(str, 10);
  return Number.isNaN(integer) ? null : integer;
}

export default class InputInteger extends React.Component {
  /**
   * Specialized Controlled Integer Input Component
   * Supplied Properties:
   *  (value) =>  integer initial value or undefined and make it the initial input value
   *  (applyOnChange) => method that is called for every valid user input change
   * It filters user's input and accepts only integer input
   * After component loses focuses, it emits the input integer to the parent onChange method
   * If "value" property of component is set to "undefined" in any moment,
   *  ... the component is instantly become uncontrolled and can't return back to be controlled
   */
  constructor(props) {
    super(props);
    this.state = {
      value: format(props.value),
    };
    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }


  onChange(e) {
    /**
     * Test user input in strikes
     * accept only integer input and discard anything else
     * applyOnChange => user-defined method supplied to component as property
     *  .... to be called on every change in the Input component
     */
    const { applyOnChange } = this.props;
    if (e.target.value.match(/^\d*$/)) {
      this.setState({
        value: e.target.value,
      });
      if (applyOnChange) applyOnChange();
    }
  }


  onBlur(e) {
    /**
     * On losing focus:,
     *  call "onChange" method supplied by parent component
     *  ... with the original event object (e) as the first argument
     *  ... and "valid user input Integer" as the second argument
     * Note: This function is called whenever user click in any part outside the input field
     *  example: if user click apply button of parent element when cursor is in input field
     *  this function is executed before click handler is executed
     *  So, in click handler of parent directory,
     * ... the value of the field is derived form state variable of the parent itself.
     * ... This state variable is updated by "onChange" method passed here as property,
     * ... So It is guaranteed that state variable of the parent
     * ... is up to date with the last value in state variable of this component
     */
    const { onChange } = this.props;
    const { value } = this.state;
    if (onChange) onChange(e, unformat(value));
  }


  render() {
    const { value } = this.state;
    // we want "applyOnChange" as a property on IntegerInput Component class
    //   but not as DOM property on Input element
    // custom attribute should be "lowercase" and
    // ...  have values either "string" or "integer" not function
    // so, supplying "applyOnChange" will raise warning,
    // ... that component must be lowercase and value str or int
    const {
      applyOnChange, ...remaining
    } = this.props;
    // we use {..remaining} to make component inherit
    // ... all properties supplied by the parent component
    // value property must be after {...remaining}
    //   to override "value" property supplied by the parent component
    return (
      <input
        {...remaining}
        type="text"
        value={value}
        onChange={this.onChange}
        onBlur={this.onBlur}
      />
    );
  }
}
