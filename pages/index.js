import React, { Component } from "react";
import { Card, Button, Container, Message } from "semantic-ui-react";
import tradeShift from "../ethereum/tradeShift";
import Layout from "../components/Layout";
import web3 from '../ethereum/web3'
import { Link } from "../routes";
import { Router } from "../routes";

class TradeShiftIndex extends Component {

  state = {
    errorMessage: "",
    loading: false,
  };

  static async getInitialProps() {
    const trades = await tradeShift().methods.getTrades().call();
    const products = await tradeShift().methods.getProducts().call();
    const manager = await tradeShift().methods.manager().call();
    console.log('manager', manager)
    console.log('trades', trades)
    console.log('products', products)
    return { trades, products, manager };
  }

  approveTrade = async (tradeId, cost) => {
    this.setState({ loading: true, errorMessage: "" });

    try {
      const accounts = await web3.eth.getAccounts();

      await tradeShift().methods
        .verifyTrade(tradeId)
        .send({
          from: accounts[0],
          value: cost
        });

        alert(`Approved ${tradeId}`)

        Router.reload(window.location.pathname)
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }
    this.setState({ loading: false });
  };

  renderTrades() {
    const items = this.props.trades.map(trade => {
      const tradeId = trade[0]
      const creatorAddress = trade[1]
      const product = trade[2]
      const isCompleted = trade[3]
      const cost = product[3] * 4 / 5

      return {
        header: `Trading "${product[2]}" By ${creatorAddress}`,
        description: (
          <div>
            <a>Cost Holding: {cost} Wei</a>
            <br />
            {isCompleted && <a>Trade Approved</a>}
            <br />
            <a>
              <Button
                disabled={isCompleted}
                floated="left"
                onClick={() => this.approveTrade(tradeId, cost)}
                content="Approve"
                icon="cart"
                primary
              />
            </a>
          </div>
        ),
        fluid: true,
      };
    });
    return <Card.Group items={items} />;
  }

  renderProducts() {
    const items = this.props.products.map(product => {
      const productId = product[0]
      const productCreatorAddress = product[1]
      const productName = product[2]
      const productCost = product[3]

      return {
        header: product.address,
        key: product.address,
        description: (
          <div>
            <a>Product ID: {productId}</a>
            <br />
            <a>Name: {productName}</a>
            <br />
            <a>Cost: {productCost} Wei</a>
            <br />
            <a>Creator Adress: ${productCreatorAddress}</a>
            <br />
            <Link route={`/product/buy/${productId}`}>
              <a>
                <Button
                  floated="left"
                  content="Buy Product"
                  icon="cart"
                  primary
                />
              </a>
            </Link>
          </div>
        ),
        fluid: true,
      };
    });
    return <Card.Group items={items} />;
  }


  render() {
    return (
      <Layout>
        <div>
          <Link route="/product/create">
            <a>
              <Button
                floated="right"
                content="Create Product"
                icon="add circle"
                primary
              />
            </a>
          </Link>
        </div>
        <Container>
          <br />
          <div>This trade is managed by {this.props.manager}</div>
          <h3>All Trades</h3>
          {this.renderTrades()}
          {this.state.errorMessage && <Message error header="Oops!" content={this.state.errorMessage} />}
          <br />
          <h3>All Products</h3>
          {this.renderProducts()}
        </Container>
      </Layout>
    );
  }
}

export default TradeShiftIndex;
