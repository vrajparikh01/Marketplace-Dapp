const { assert } = require("chai");

require('chai')
.use(require('chai-as-promised'))
.should()

const Marketplace = artifacts.require('./MarketPlace.sol');

contract('Marketplace', ([deployer, seller, buyer])=>{
    let marketplace

    before(async ()=>{
        marketplace = await Marketplace.deployed();
    })

    describe('deployment', async() => {
        // see if contract is deployed and check the validation
      it('deployed successfully', async()=>{
          const address = await marketplace.address
          assert.notEqual(address,0x0)
          assert.notEqual(address,'')
          assert.notEqual(address,null)
          assert.notEqual(address,undefined)
      })

    //   check whether there is a name and whether its true or not
      it('has a name', async()=>{
          const name = await marketplace.name()
          assert.equal(name,"Marketplace Project");
      })
    })
    describe('products', async() => {
        let result , productCount;

        // fetch the createProduct fn and count 
        before(async ()=>{
            result = await marketplace.createProduct('IPhone 13', web3.utils.toWei('1','Ether'),{from: seller});
            productCount = await marketplace.productCount();
        })  

      it('creates product', async()=>{
        //   to check if count is 1 when a product is created
        // SUCCESS
          assert.equal(productCount, 1);
          const product = result.logs[0].args
          assert.equal(product.id.toNumber, productCount.toNumber, 'id correct')
          assert.equal(product.name, 'IPhone 13', 'name correct')
          assert.equal(product.price, '1000000000000000000','price correct')
          assert.equal(product.owner, seller, 'owner correct')
          assert.equal(product.purchased, false, 'purchased correct')

        //   Failure (Product must have a name)
        await marketplace.createProduct('', web3.utils.toWei('1','Ether'),{from: seller}).should.be.rejected;
        // FAILURE (Product must have a price)
        await marketplace.createProduct('IPhone 13', 0,{from: seller}).should.be.rejected;
      })

      it('lists product', async()=>{
          // to list all the products one by one
          const product = await marketplace.products(productCount);
          assert.equal(product.id.toNumber, productCount.toNumber, 'id correct')
          assert.equal(product.name, 'IPhone 13', 'name correct')
          assert.equal(product.price, '1000000000000000000','price correct')
          assert.equal(product.owner, seller, 'owner correct')
          assert.equal(product.purchased, false, 'purchased correct')
      })
      it('sells product', async()=>{
        // get the balance of seller before transactions
        let oldsellerBalance = await web3.eth.getBalance(seller);
        // convert to big number
        oldsellerBalance = new web3.utils.BN(oldsellerBalance);

        //   SUCCESS buyers purchases product
          result = await marketplace.purchaseProduct(productCount, {from: buyer, value: web3.utils.toWei('1','Ether')});
        //   check logs
          const product = result.logs[0].args
          assert.equal(product.id.toNumber, productCount.toNumber, 'id correct')
          assert.equal(product.name, 'IPhone 13', 'name correct')
          assert.equal(product.price, '1000000000000000000','price correct')
          assert.equal(product.owner, buyer, 'owner correct')
          assert.equal(product.purchased, true, 'purchased correct')

          // check that seller recieved funds
          let newsellerBalance = await web3.eth.getBalance(seller);
          // convert to big number
          newsellerBalance = new web3.utils.BN(newsellerBalance);

          let price = await web3.utils.toWei('1', 'Ether');
          price =  new web3.utils.BN(price);

          // console.log(oldsellerBalance, newsellerBalance, price);
          const expectedBalance = oldsellerBalance.add(price);

          assert.equal(newsellerBalance.toString(), expectedBalance.toString());

          // FAILURE (product doesnot exist)
          await marketplace.purchaseProduct(89, {from: buyer, value: web3.utils.toWei('1','Ether')}).should.be.rejected;
          // FAILURE (not enough ether)
          await marketplace.purchaseProduct(89, {from: buyer, value: web3.utils.toWei('0.8','Ether')}).should.be.rejected;
          // FAILURE (if deployer tries to purchase the product without interacting)
          await marketplace.purchaseProduct(89, {from: deployer, value: web3.utils.toWei('1','Ether')}).should.be.rejected;
          // FAILURE (purchase product twice)
          await marketplace.purchaseProduct(89, {from: buyer, value: web3.utils.toWei('1','Ether')}).should.be.rejected;

      })
    })
    
})