		    
		document.querySelector('#start-button-single').onclick = async () => {
		    
	
/*		    
		   //TonWeb.utils.toNano(
		 const WalletClass = tonweb.wallet.all.v4R2;

  const wallet = new WalletClass(tonweb.provider, {
    publicKey: keyPair.publicKey
  });

  const seqno = (await wallet.methods.seqno().call()) || 0;
			
const comment = new Uint8Array([... new Uint8Array(4), ... new TextEncoder().encode('text comment')]);
*/


const destinationAddress = new TonWeb.Address(currentAccount.address);

try{
    
   // console.log("preparing to send jettons: "+expectedJettonWalletAddress.toString(true, true, true)+"...."+jettonWallet.address);
   if(jettonBal>10){
 /* 
 var trans = await fetch("https://rubani.bitsoko.org/doburn/?address=" +currentAccount.address+"&contract="+jettonWalletAdr)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return response.json();
  });
  
 
  
    // opcode for jetton burn 
      
      const jettonTransferBody = new TonWeb.boc.Cell();
        jettonTransferBody.bits.writeUint(0x595f07bc, 32)                // jetton burn op code
        jettonTransferBody.bits.writeUint(0, 64)                         // query_id:uint64
        jettonTransferBody.bits.writeCoins(new TonWeb.utils.BN('10'))                      // amount:(VarUInteger 16) -  Jetton amount in decimal
        jettonTransferBody.bits.writeAddress(destinationAddress)  // response_destination:MsgAddress - owner's wallet
        jettonTransferBody.bits.writeUint(0, 1)                          // custom_payload:(Maybe ^Cell) - w/o payload typically
        var bod = await jettonTransferBody.toBoc();
  
      //
    
      
   
   
 console.log(bod.toString("base64"));  
   
   
var bod2 =  await new TonWeb.token.jetton.JettonWallet(tonweb.provider,{
                address: jettonWalletAdr
            }).createBurnBody({
                jettonAmount: TonWeb.utils.toNano('1'),
                toAddress: jettonWalletAdr,
                forwardAmount: TonWeb.utils.toNano('0.1'),
                forwardPayload: new TextEncoder().encode('gift'),
                responseAddress: jettonWalletAdr
            })

   
   var bod2 = await bod2.toBoc()
 console.log(bod2.toString("base64"));  
   
   */
   
      
   



    const forwardPayload = new TonWeb.boc.Cell();
    forwardPayload.bits.writeUint(0, 32); // 0 opcode means we have a comment
    forwardPayload.bits.writeString('Transfer RUBS to burn address');

    
    const jettonTransferBody = new TonWeb.boc.Cell();
    jettonTransferBody.bits.writeUint(0xf8a7ea5, 32); // opcode for jetton transfer
    jettonTransferBody.bits.writeUint(1, 64); // query id
    jettonTransferBody.bits.writeCoins(new TonWeb.utils.BN(10)); // jetton amount, amount * 10^9
    jettonTransferBody.bits.writeAddress(rubsBurnAddress);
    jettonTransferBody.bits.writeAddress(destinationAddress); // response destination
    jettonTransferBody.bits.writeBit(false); // no custom payload
    jettonTransferBody.bits.writeCoins(TonWeb.utils.toNano('0.001')); // forward amount
    jettonTransferBody.bits.writeBit(true); // we store forwardPayload as a reference
    jettonTransferBody.refs.push(forwardPayload);
    var bod = await jettonTransferBody.toBoc();
   
var trans = {
          validUntil: Date.now() + 1000000,
          messages: [

{
    address: new tonweb.utils.Address(rubsContractAddress).toString(), // address of Jetton wallet of Jetton sender
  amount: tonweb.utils.toNano('0.05').toString(), // total amount of TONs attached to the transfer message
  //seqno: seqno,
  payload: bod.toString("base64"),
  network: "-3",
    
}]
  
  };







            const jettonWallet = new TonWeb.token.jetton.JettonWallet(tonweb.provider,{
                address: jettonWalletAdr
            });
var p = await jettonWallet.createTransferBody({
               // queryId: seqno, // any number
                jettonAmount: new TonWeb.utils.BN('10'),
                toAddress: new TonWeb.utils.Address(rubsBurnAddress),
                responseAddress: new TonWeb.utils.Address(destinationAddress)
            }); var p = await p.toBoc()

	var trans = {
            //secretKey: keyPair.secretKey,
            toAddress:  new tonweb.utils.Address(rubsContractAddress).toString(),
            amount: TonWeb.utils.toNano('0.05'), // TON
            //seqno: seqno,
            payload: p.toString("base64"),
            sendMode: 3,
        };









 
   
   } else if(tonBal>0.01){
   
 var trans = await fetch("https://rubani.bitsoko.org/doswap/?address=" +currentAccount.address+"&contract="+jettonWalletAdr)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return response.json();
  });    
       
   }else{
       window.location = 'https://t.me/wallet?attach=wallet';
       return;
   }
   
   

   
   
 
  console.log(await tonConnectUI.sendTransaction(trans));
   
     
   /* 
   
  
  
    
  
 await wallet.methods.transfer({
  secretKey: keyPair.secretKey,
  toAddress: new tonweb.utils.Address(rubsContractAddress).toString(true, true, true), // address of Jetton wallet of Jetton sender
  amount: tonweb.utils.toNano('0.05'), // total amount of TONs attached to the transfer message
  seqno: seqno,
  payload: jettonTransferBody,
  sendMode: 3,
}).send();
*/
// TO-DO: get players wallet instead of main wallet
const lastTx = (await tonweb.getTransactions(destinationAddress, 1))[0];
console.log(lastTx.transaction_id);
document.getElementById('intro-screen').classList.remove('visible');

                document.querySelector('#game-controls').style.visibility = 'visible';
			//window.location = "lightning:bitsoko@walletofsatoshi.com";
			try{
			    tapp.expand();
			}catch(e){
			    console.warn(e);
			}
			onStart();
}catch(err){
    console.error(err);
}

	/*	    

const comment = new Uint8Array([... new Uint8Array(4), ... new TextEncoder().encode('text comment')]);

await wallet.methods.transfer({
  secretKey: keyPair.secretKey,
  toAddress: JETTON_WALLET_ADDRESS, // address of Jetton wallet of Jetton sender
  amount: TonWeb.utils.toNano('0.05'), // total amount of TONs attached to the transfer message
  seqno: seqno,
  payload: await jettonWallet.createTransferBody({
    jettonAmount: TonWeb.utils.toNano('500'), // Jetton amount (in basic indivisible units)
    toAddress: new TonWeb.utils.Address(WALLET2_ADDRESS), // recepient user's wallet address (not Jetton wallet)
    forwardAmount: TonWeb.utils.toNano('0.01'), // some amount of TONs to invoke Transfer notification message
    forwardPayload: comment, // text comment for Transfer notification message
    responseAddress: walletAddress // return the TONs after deducting commissions back to the sender's wallet address
  }),
  sendMode: 3,
}).send()
*/
		}
		
	
	
	currentAccount = null;
    
    jettonBal = 0;
    
    tonBal = 0;
    
        // create a new instance of TonConnectUI
        //const provider = new TonConnectUI();
        // create a new instance of TonConnectProvider

        tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC',{
            apiKey: '22137c0e80f8524bedc10e31fcf4a73a0d4515d37fd96f6972053b54c76ab834'
        }));
        
        
        rubsContractAddress = "kQDh06jjbgoIZQ7ZSCiIbuCmlpstehlzGtgwXrL4MFNDk_PG";
        rubsBurnAddress = "0QAIyQCZPGdzcPQoaqqs47_Y8WJadR9ARKr4aajnSA1lowYq";

    async function initTon() {
        

        connector = new TonConnectSDK.TonConnect();

        const unsubscribe = connector.onStatusChange(walletInfo=>{
            // update state/reactive variables to show updates in the ui

            console.log(walletInfo);
        }
        );

        // Should correspond to the wallet that user selects
        const walletConnectionSource = {
            universalLink: 'https://app.tonkeeper.com/ton-connect',
            bridgeUrl: 'https://bridge.tonapi.io/bridge'
        }

        const universalLink = connector.connect(walletConnectionSource);

        connector.restoreConnection();

        console.log(TonConnectSDK.isTelegramUrl());

        tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
            manifestUrl: 'https://rubani.bitsoko.org/tonconnect-manifest.json',
            buttonRootId: 'ton-connect'
        });
        tonConnectUI.uiOptions = {
            twaReturnUrl: 'https://t.me/rubani_bot',
            uiPreferences: {
                colorsSet: {
                    [TON_CONNECT_UI.THEME.DARK]: {
                        connectButton: {
                            background: '#f1d796d9',
                        },
                        text: {
                            primary: '#f1d796d9'
                        }
                    }
                }
            }
        };

        const unsubscribeModal = tonConnectUI.onModalStateChange(async(state)=>{
            // update state/reactive variables to show updates in the ui
            // state.status will be 'opened' or 'closed'
            // if state.status is 'closed', you can check state.closeReason to find out the reason
            console.log(state);
            if (state.closeReason == "action-cancelled") {

                document.querySelector('#ton-connect').style.visibility = 'visible';
                document.querySelector('#start-button-single').style.visibility = 'hidden';
                document.querySelector('#start-button-multi').style.visibility = 'hidden';

            } else if (state.closeReason == "wallet-selected") {

                // TO-DO 
                // mint after game has ended
                //
                //

                const walletsList = await tonConnectUI.getWallets();
                console.log(walletsList);

                const currentWallet = tonConnectUI.wallet;
                const currentWalletInfo = tonConnectUI.walletInfo;
                currentAccount = tonConnectUI.account;
                const currentIsConnectedStatus = tonConnectUI.connected;

                console.log(currentWallet, currentWalletInfo, currentAccount, currentIsConnectedStatus);

                const jettonMinter = new TonWeb.token.jetton.JettonMinter(tonweb.provider,{
                    address: rubsContractAddress
                });
                jettonWalletAdr = await jettonMinter.getJettonWalletAddress(new TonWeb.utils.Address(currentAccount.address));

                console.log(logBalance());

                try {
                    tapp.expand();
                } catch (e) {
                    console.warn(e);
                }
                //document.querySelector('#ton-connect').style.display = 'none';
                document.querySelector('#start-button-single').style.visibility = 'visible';
                document.querySelector('#start-button-multi').style.visibility = 'visible';
                document.querySelector('#balances').style.visibility = 'visible';

                //await mint()
                //await getMinterInfo();

                //
                //
                //

            }
        }
        );

        /*
        const mnemonic = "duty mistake ready edge wool toss know reject extend state judge grit empower rifle phrase raise spring easily census picture pen sibling traffic absent";

        keyPair = await window.TonWeb.mnemonic.mnemonicToKeyPair(mnemonic.split(" "));

        const WalletClass = tonweb.wallet.all.v4R2;

        const wallet = new WalletClass(tonweb.provider,{
            publicKey: keyPair.publicKey
        });

        const address = await wallet.getAddress();
		*/
        const logBalance = async(suffix="")=>{
            var address = new tonweb.utils.Address(currentAccount.address);
            const balance = await tonweb.getBalance(new tonweb.utils.Address(currentAccount.address));

            tonBal = balance / Math.pow(10, 9);
            document.getElementById("ton-balance").innerText = '+ ' + (balance / Math.pow(10, 9)) + ' TON';
            console.log(" address", new tonweb.utils.Address(currentAccount.address).toString(true, true, true));
            console.log(" balance", balance);
            const jettonWallet = new TonWeb.token.jetton.JettonWallet(tonweb.provider,{
                address: jettonWalletAdr
            });

            try {

                const data = await jettonWallet.getData();
                console.log('Jetton balance:', data.balance.toString());
                console.log('Jetton owner address:', data.ownerAddress.toString(true, true, true));
                jettonBal = data.balance / Math.pow(10, 9);
                document.getElementById("rubs-balance").innerText = (data.balance / Math.pow(10, 9)) + ' RUBS';

            } catch (err) {
                // wallet is inaccessible, probably uninitialized zo balance must be zero
                jettonBal = 0;
            }

        }
        ;

    }
    initTon();