import React, { Component } from 'react'

export class Main extends Component {
    render() {
        return (
            <div>
                <br />
                <h2>Add product</h2>
                <form onSubmit={(event) => {
                    event.preventDefault();
                    const name = this.productName.value;
                    const price = window.web3.utils.toWei(this.productPrice.value.toString(), 'Ether');
                    this.props.createProduct(name, price);
                }}>
                    <div className="mb-3">
                        <input type="text" className="form-control" placeholder='Product Name' id="productName" name='productName' aria-describedby="emailHelp" ref={(input) => { this.productName = input }} />
                    </div>
                    <div className="mb-3">
                        <input type="text" className="form-control" placeholder='Product Price' id="productPrice" name='productPrice' ref={(input) => { this.productPrice = input }} />
                    </div>

                    <button type="submit" className="btn btn-primary">Add Product</button>
                </form>

                <br />
                <br />
                <h2>Buy product</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Name</th>
                            <th scope="col">Price</th>
                            <th scope="col">Owner</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.products.map((product, key) => {
                            return (
                                <tr key={key}>
                                    <th scope="row">{product.id.toString()}</th>
                                    <td>{product.name}</td>
                                    <td>{window.web3.utils.fromWei(product.price.toString(), 'Ether')} Eth</td>
                                    <td>{product.owner}</td>
                                    <td>
                                        {!product.purchased
                                            ? <button
                                                name={product.id}
                                                value={product.price}
                                                onClick={(event) => {
                                                    this.props.purchaseProduct(event.target.name, event.target.value)
                                                }}>Buy
                                            </button>
                                            : null
                                        }
                                    </td>
                                </tr>
                            )
                        })}

                    </tbody>
                </table>
            </div>
        )
    }
}

export default Main
