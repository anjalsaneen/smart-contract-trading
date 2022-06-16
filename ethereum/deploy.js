const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const tradeShift = require('./build/TradeShift.json');

const provider = new HDWalletProvider(
  'replace want flame tilt lobster apple absent renew magnet lonely royal term',
  'https://rinkeby.infura.io/v3/8a2031940fc84b009bb8ce11e035a89e'
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);
  
  const result = await new web3.eth.Contract(
    tradeShift.abi
  )
    .deploy({ data: tradeShift.evm.bytecode.object })
    .send({ gas: '10000000', from: accounts[0] });


  console.log('Contract deployed to', result.options.address);
  provider.engine.stop();

};
deploy();
