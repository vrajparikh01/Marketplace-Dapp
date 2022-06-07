import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import MarketPlace from '../abis/MarketPlace.json';
import Navbar from './Navbar';
import Main from './Main';

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
    // console.log(window.web3);
  }

  // detect metamask
  async loadWeb3() {
    // Modern web browsers (metamask)
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    // legacy dapp browsers (web3)
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    // load the account
    const accounts = await web3.eth.getAccounts();
    // console.log(accounts);
    this.setState({ account: accounts[0] });
    // get the abi and address to instantiate the smart contracts

    // const abi = MarketPlace.abi;
    // const address = MarketPlace.networks[5777].address;
    // const marketplace = web3.eth.Contract(abi,address);
    // console.log(marketplace);

    // but this is hard coded and we want to detect the network dynamically and
    // also talk to the smart contract
    const networkId = await web3.eth.net.getId();
    // console.log(networkId);
    const networkData = await MarketPlace.networks[networkId];
    if (networkData) {
      const marketplace = web3.eth.Contract(MarketPlace.abi, networkData.address);
      // console.log(marketplace);
      this.setState({ marketplace });
      const productCount = await marketplace.methods.productCount().call();
      this.setState({ productCount });
      // console.log(productCount.toString());
      // load products
      for (let i = 1; i <= productCount; i++) {
        const product = await marketplace.methods.products(i).call();
        this.setState({
          // ading product to the array
          products: [...this.state.products, product]
        })
      }
      this.setState({ loading: false });
      // console.log(this.state.products);
    }
    else {
      window.alert("Marketplace contract not deployed to the network");
    }


  }

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      loading: true
    }
    this.createProduct = this.createProduct.bind(this)
    this.purchaseProduct = this.purchaseProduct.bind(this)
  }

  createProduct(name, price){
    this.setState({ loading: true });
    this.state.marketplace.methods.createProduct(name, price).send({ from: this.state.account })
    .once('receipt',(receipt)=>{
      this.setState({loading: false})
    })
  }
  purchaseProduct(id, price){
    this.setState({ loading: true });
    this.state.marketplace.methods.purchaseProduct(id).send({ from: this.state.account, value: price })
    .once('receipt',(receipt)=>{
      this.setState({loading: false})
    })
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              {this.state.loading ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div> : <Main products={this.state.products} createProduct={this.createProduct} purchaseProduct={this.purchaseProduct}/>}
            </main>
          </div>

        </div>
      </div>
    );
  }
}

export default App;
