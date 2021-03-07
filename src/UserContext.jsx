import React from 'react';

/**
 * Context with initial value of single property "signedIn" false
 * It holds user sign in status
 */
const UserContext = React.createContext({
  signedIn: false,
});

export default UserContext;
