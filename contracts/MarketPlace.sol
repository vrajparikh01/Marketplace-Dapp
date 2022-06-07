// SPDX-License-Identifier: MIT
pragma solidity >=0.4.0 <0.9.0;

contract MarketPlace{
    string public name;
    mapping(uint=>Product) public products;
    uint public productCount = 0;

    struct Product{
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    event ProductCreated(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );
    event ProductPurchased(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    constructor() public {
        name = "Marketplace Project";
    }

    function createProduct(string memory _name, uint _price) public{
        // check the parameters
        require(bytes(_name).length>0);
        require(_price>0);
        // increment the count
        productCount++;
        // create the product
        products[productCount] = Product(productCount, _name, _price, msg.sender, false);
        // trigger the event to let everyone know that product was created successfully
        emit ProductCreated(productCount, _name, _price, msg.sender, false);
    }

    function purchaseProduct(uint _id) public payable{
        // fetch the product and create the copy of it in the memory
        Product memory _product = products[_id];
        // fetch the owner
        address payable _seller = _product.owner;
        // check whether product is valid
        require(_product.id > 0 && _product.id <= productCount);
        // check if there is enough ether to buy the product
        require(msg.value >= _product.price);
        // check whether product is not purchased already
        require(!_product.purchased);
        // buyer is not the seller
        require(_seller != msg.sender);
        // transfer the ownership
        _product.owner = msg.sender;
        // mark as purchased
        _product.purchased = true;
        // update the products array
        products[_id] = _product;
        // pay the seller by sending ether
        address(_seller).transfer(msg.value);
        // trigger the event
        emit ProductPurchased(productCount, _product.name, _product.price, msg.sender, true);
    }
}