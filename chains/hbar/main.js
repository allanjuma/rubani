require("dotenv").config();



// import the 'Client' module from the Hedera JS SDK

const { Client } = require("@hashgraph/sdk");


/* create a new asynchronous function */

async function main() {



/* grab our testnet credentials from our .env file */

const operatorAccount = process.env.ACCOUNT_ID;

const operatorPrivateKey = process.env.PRIVATE_KEY;



console.log(operatorPrivateKey, operatorAccount);

/* configure our testnet client */

const client = Client.forTestnet();

console.log(client);

client.setOperator(operatorAccount, operatorPrivateKey);



/* send our first hbar transfer! */

const transactionId = await new CryptoTransferTransaction()

.addSender(operatorAccount, 1)

.addRecipient("0.0.3", 1)

.setTransactionMemo("Hello future!")

.execute(client);



/* get the receipt of this transfer */

const receipt = await transactionId.getReceipt(client);

console.log(receipt);

}



/* call our async function */ 

main();