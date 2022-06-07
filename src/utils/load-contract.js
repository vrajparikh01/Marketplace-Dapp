import contract from "@truffle/contract";

export const loadContract = async (name, provider)=>{
    // fetch the response of the json file
    const res = await fetch(`/contracts/${name}.json`);
    // ABI of code
    const Artifact = await res.json();

    // This json format artifacts can't be directly used
    // we will use @truffle/contract to convert into a format that wil interact with the contract of funder.json
    const _contract = contract(Artifact);

    _contract.setProvider(provider);

    // deploying the contract
    const depyoledContract = await _contract.deployed();

    // return the instance so that we can use it in App.js to interact with smart contracts
    return depyoledContract;

};