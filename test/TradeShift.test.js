const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const tradeShiftJson = require("../ethereum/build/TradeShift.json");

let accounts;
let tradeShift;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  tradeShift = await new web3.eth.Contract(
    tradeShiftJson.abi
  )
    .deploy({ data: tradeShiftJson.evm.bytecode.object })
    .send({ gas: '6721975', from: accounts[0], gasPrice: '30000000' });
});

describe("TradeShift", () => {

  it("marks caller as the manager", async () => {
    const manager = await tradeShift.methods.manager().call();
    assert.equal(accounts[0], manager);
  });


  it("create product should add right product to the prduct list", async () => {
    const productId = await tradeShift.methods.createProduct("P1", '10000000000000000').send({
      from: accounts[0],
      gas: "1000000",
    });

    const products = await tradeShift.methods.getProducts().call();

    assert(products[0].name == "P1");
    assert(products[0].cost == "10000000000000000");
    assert(products[0].creator == accounts[0]);
  });


  it("buying a product should create a trade with right values", async () => {
    await tradeShift.methods.createProduct("P1", '10000000000000000').send({
      from: accounts[0],
      gas: "1000000",
    });

    const products = await tradeShift.methods.getProducts().call();

    await tradeShift.methods.buyProduct(0).send({
      from: accounts[1],
      gas: "1000000",
      value: '10000000000000000'
    });

    const trades = await tradeShift.methods.getTrades().call();

    assert(trades[0].product.toString() == products[0].toString());
  });

  it("should not able to buy the product if the value is not right", async () => {
    await tradeShift.methods.createProduct("P1", '10000000000000000').send({
      from: accounts[0],
      gas: "1000000",
    });

    const products = await tradeShift.methods.getProducts().call();

    try {
      await tradeShift.methods.buyProduct(0).send({
        from: accounts[1],
        gas: "1000000",
        value: '20000000000000000'
      });
    } catch(err) {
      assert(err);
    }
  });


  it("should pay 80% to manager and 20% to seller in a purchase", async () => {
    let initialBalanceOfManager = await web3.eth.getBalance(accounts[0]);
    let initialBalanceOfSeller = await web3.eth.getBalance(accounts[1]);
    let initialBalanceOfBuyer = await web3.eth.getBalance(accounts[2]);

    const createProductResult = await tradeShift.methods.createProduct("P1", '1000000000000000000').send({
      from: accounts[1],
      gas: "1000000",
    });
    const createProductTransaction = await web3.eth.getTransaction(createProductResult.transactionHash);

    const buyProductResult = await tradeShift.methods.buyProduct(0).send({
      from: accounts[2],
      gas: "1000000",
      value: '1000000000000000000'
    });
    const buyProductTransaction = await web3.eth.getTransaction(buyProductResult.transactionHash);

    let finalBalanceOfManager = await web3.eth.getBalance(accounts[0]);
    let finalBalanceOfSeller = await web3.eth.getBalance(accounts[1]);
    let finalBalanceOfBuyer = await web3.eth.getBalance(accounts[2]);

    assert(finalBalanceOfManager - initialBalanceOfManager == (1000000000000000000 * 4 / 5));
    assert((initialBalanceOfBuyer - finalBalanceOfBuyer - 1000000000000000000 - buyProductTransaction.gasPrice * buyProductResult.cumulativeGasUsed) < 1000000);
    assert((finalBalanceOfSeller - initialBalanceOfSeller - 1000000000000000000 / 5 - createProductTransaction.gasPrice * createProductResult.cumulativeGasUsed) < 1000000);
  });


});