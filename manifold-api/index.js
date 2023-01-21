require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/verify', async (req, res) => {
  console.log('verify');
  const token = (req.headers.authorization ?? '').replace('Bearer ', '');
  console.log(token);

  const response = await fetch('https://oauth2.manifoldxyz.dev/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  if (response.status !== 200) return res.sendStatus(403);

  const responseJson = await response.json();
  const address = responseJson.unwrappedJWT?.address;

  if (!address) return res.sendStatus(403);

  // You now have the address associated with the authenticated session
  // do whatever you need

  return res.status(200).json({ address });
});

app.listen(port, async () => {
  console.log(`App listening on port ${port}`);
});
