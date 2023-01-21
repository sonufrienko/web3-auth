import React from 'react';
import './App.css';

function ManifoldConnect() {
  return (
    <div className="ManifoldConnect">
      <div
        data-widget="m-connect"
        data-grant-type="signature"
        data-client-id="<CLIENT-ID>"
        data-app-name="app"
        data-network="1"
      ></div>
    </div>
  );
}

function App() {
  const apiRequest = async () => {
    // @ts-ignore
    const token = await window.ManifoldEthereumProvider.getOAuth({
      grantType: 'signature',
      appName: 'app',
      clientId: '<CLIENT-ID>',
    });

    console.log(token);

    const query =
      '{"query":"{    tokens {        totalCount        items {            id        }    }}","variables":{}}';

    const response = await fetch('https://graphql-api.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: query,
    });

    const data = await response.json();
    alert(JSON.stringify(data));
  };

  return (
    <div className="App">
      <ManifoldConnect />
      <button onClick={() => apiRequest()}>Get my tokens</button>
    </div>
  );
}

export default App;
