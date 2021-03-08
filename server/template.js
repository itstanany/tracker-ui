import serialize from 'serialize-javascript';


export default function template(body, initialData, userData) {
  /**
   * input: (body) => html string of the view generated at server side according to requested url
   * (initialData) => data fetched form resources (DB) that is required to pass to the client code
   *  (userData) => user credentials data
   *  so, both server and client code share the identical data and reduce traffic to resources (DB)
   * function that returns html string file that is the view of matched url
   * we sent initialData serialized to keep date objects native not transferred to string
   * if we passed it stringified,
   *  ..... we must use stringify and parsing with reviver at the client side
   */
  return (
    `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Issue Tracker</title>
        <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <style>
          table.table-hover tr {cursor: pointer;}
          .panel-title a {display: block; width: 100%; cursor: pointer;}
        </style>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://apis.google.com/js/api:client.js"></script>
      </head>

      <body>
        <div id="contents">${body}</div>
        <script src="/env.js"></script>
        <script>
          window.__INITIAL_DATA__=${serialize(initialData)};
          window.__USER_DATA__=${serialize(userData)};
        </script>
        <!--  fot HTML path resolution https://www.w3schools.com/html/html_filepaths.asp -->
        <script src="/app.bundle.js"></script>
        <script src="/vendor.bundle.js"></script>
      </body>
    </html>
    `
  );
}
