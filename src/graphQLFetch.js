import fetch from 'isomorphic-fetch';


function jsonDateReviver(key, value) {
  /**
   * input: (key) = > object key
   *        (value) => value of the object key
   * function: transform ISO Date String into javascript native date objects
   * it is passed as a reviver in JSON.parse method
   * return value => the original value
   *  .... except if the value is ISO Date String, transforms it into javascript native Date object
   */
  const jsonDateRegExp = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');
  if (jsonDateRegExp.test(value)) {
    return new Date(value);
  }
  return value;
}


async function graphQLFetch(query, variables = {}, showError = null, cookie = null) {
  /**
   * input:
   *    "query" => valid graphql query string - no check for validity of the string here
   *    "variables" => object of variables needed for the query string
   *    "showError" => function to display errors messages
   *    "cookie" => user credentials cookies

   * output: "return value" =>
   *    value of "data" property of JSON response with date represented as native javascript object
   * or null if error happened in fetching operation
   */
  const apiEndpoint = (
    // eslint-disable-next-line no-undef
    __isBrowser__
      ? window.ENV.UI_API_ENDPOINT
      : process.env.UI_SERVER_API_ENDPOINT
  );
  try {
    // on server rendering, add "cookie" if supplied as an argument
    // but on browser rendering, "credentials: include" will instruct browser to include cookies
    const headers = { 'Content-Type': 'application/json' };
    if (cookie) headers.Cookie = cookie;
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify({ query, variables }),
    });
    const text = await response.text();
    const result = JSON.parse(text, jsonDateReviver);
    // Display Errors if present
    if (result.errors) {
      const error = result.errors[0];
      if (error.extensions.code === 'BAD_USER_INPUT') {
        const details = error.extensions.errors.join(' \n');
        if (showError) {
          showError(`${error.message}:\n ${details}`);
        } else {
          console.log(`${error.message}:\n ${details}`);
        }
      } else if (showError) {
        showError(`Error code is: ${error.extensions.code}.\n Message: ${error.message}`);
      } else {
        console.log(`Error code is: ${error.extensions.code}.\n Message: ${error.message}`);
      }
    }
    return result.data;
  } catch (e) {
    if (showError) {
      showError(`Error in GraphQLFetch function: ${e}`);
    } else {
      console.log(`Error in GraphQLFetch function: ${e}`);
    }
  }
  return null;
}


export default graphQLFetch;
