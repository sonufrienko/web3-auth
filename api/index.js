require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const Moralis = require('moralis').default;
const { EvmChain } = require('@moralisweb3/common-evm-utils');

const app = express();
const port = 4000;
const chain = EvmChain.ETHEREUM;
const config = {
  domain: process.env.APP_DOMAIN,
  statement: 'Please sign this message to confirm your identity.',
  uri: process.env.REACT_URL,
  timeout: 60,
};

async function getBalance(address) {
  const nativeBalance = await Moralis.EvmApi.balance.getNativeBalance({
    address,
    chain,
  });
  const native = nativeBalance.result.balance.ether;

  // Get token balances
  const tokenBalances = await Moralis.EvmApi.token.getWalletTokenBalances({
    address,
    chain,
  });

  // Format the balances to a readable output with the .display() method
  const tokens = tokenBalances.result.map((token) => token.display());

  // Get the nfts
  const nftsBalances = await Moralis.EvmApi.nft.getWalletNFTs({
    address,
    chain,
    limit: 10,
  });

  // Format the output to return name, amount and metadata
  const nfts = nftsBalances.result.map((nft) => ({
    name: nft.result.name,
    amount: nft.result.amount,
    metadata: nft.result.metadata,
  }));

  return { address, native, tokens, nfts };
}

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/request-message', async (req, res) => {
  const { address, chain, network } = req.body;

  try {
    const message = await Moralis.Auth.requestMessage({
      address,
      chain,
      network,
      ...config,
    });

    res.status(200).json(message);
    console.log(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error(error);
  }
});

app.post('/verify', async (req, res) => {
  console.log('verify');
  try {
    const { message, signature } = req.body;
    console.log(message);
    const { address, profileId } = (
      await Moralis.Auth.verify({
        message,
        signature,
        networkType: 'evm',
      })
    ).raw;

    const user = { address, profileId, signature };

    // create JWT token
    const token = jwt.sign(user, process.env.AUTH_SECRET);

    // set JWT cookie
    res.cookie('jwt', token, { httpOnly: true });

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error(error.message);
  }
});

app.get('/authenticate', async (req, res) => {
  if (req.cookies && req.cookies.jwt) {
    const token = req.cookies.jwt;
    console.log(token);
    if (!token) return res.sendStatus(403); // if the user did not send a jwt token, they are unauthorized

    try {
      const data = jwt.verify(token, process.env.AUTH_SECRET);
      res.json(data);
    } catch {
      return res.sendStatus(403);
    }
  } else {
    return res.sendStatus(400);
  }
});

app.get('/logout', async (req, res) => {
  try {
    res.clearCookie('jwt');
    return res.sendStatus(200);
  } catch {
    return res.sendStatus(403);
  }
});

app.get('/wallet/:wallet', async (req, res) => {
  try {
    const data = await getBalance(req.params.wallet);
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500);
    res.json({ error: error.message });
  }
});

app.listen(port, async () => {
  console.log(`App listening on port ${port}`);
  await Moralis.start({
    apiKey: process.env.MORALIS_API_KEY,
  });
});
