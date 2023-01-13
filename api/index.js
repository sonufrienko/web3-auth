require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Moralis = require('moralis').default;
const { EvmChain } = require('@moralisweb3/common-evm-utils');

const app = express();
const port = 4000;
const chain = EvmChain.ETHEREUM;

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

app.use(cors());
app.get('/', (req, res) => {
  res.send('Hello World!');
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
