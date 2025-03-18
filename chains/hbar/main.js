require("dotenv").config();



// import the 'Client' module from the Hedera JS SDK

const { Client } = require("@hashgraph/sdk");



async function main() {



// Grab our account credentials

const operatorAccount = process.env.ACCOUNT_ID;

const operatorPrivateKey = process.env.PRIVATE_KEY;



// Configure a testnet client with our Account ID & private key

const client = Client.forTestnet();

client.setOperator(operatorAccount, operatorPrivateKey);


console.log(client);
// add the rest of your code here 

// ...

}