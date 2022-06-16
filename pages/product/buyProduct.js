import React, { Component } from 'react'
import { Grid, Button, Message } from 'semantic-ui-react'
import Layout from '../../components/Layout'
import tradeShift from '../../ethereum/tradeShift'
import web3 from '../../ethereum/web3'
import { Router } from "../../routes";

class BuyProduct extends Component {
  static async getInitialProps(props) {
    const productId = props.query.id
    const products = await tradeShift().methods.getProducts().call()
    let product = null
    products.map((item) => {
      if (item.id == productId) {
        product = item
      }
    })

    return {
      product,
    }
  }

  state = {
    errorMessage: "",
    loading: false,
  };


  onSubmit = async (event) => {
    event.preventDefault();
    this.setState({ loading: true, errorMessage: "" });

    try {
      const accounts = await web3.eth.getAccounts();
      await tradeShift().methods
        .buyProduct(this.props.product.id)
        .send({
          from: accounts[0],
          value: this.props.product.cost
        });

      Router.pushRoute("/");
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }
    this.setState({ loading: false });
  };




  render() {
    return (
      <Layout>
        <h3>Buying Product</h3>
        <a>Product ID: {this.props.product.id}</a>
        <br />
        <a>Name: {this.props.product.name}</a>
        <br />
        <a>Cost: {this.props.product.cost} Wei</a>
        <br />
        <a>Creator Adress: ${this.props.product.creator}</a>
        <br />
        <br />
        <Grid>

          <Grid.Row>
            <Grid.Column>
                <a>
                  <Button 
                    primary
                    onClick={this.onSubmit}>
                    Buy
                  </Button>
                </a>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <br />
        {this.state.errorMessage && <Message error header="Oops!" content={this.state.errorMessage} />}
      </Layout>
    )
  }
}

export default BuyProduct
