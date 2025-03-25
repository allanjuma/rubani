import { Injectable } from '@angular/core';
import { ButtonLayoutDisplay, ButtonMaker, DialogInitializer, DialogLayoutDisplay } from '@costlydeveloper/ngx-awesome-popup';
import { TokenBurnTransaction, AccountId, LedgerId, Transaction, TransactionReceipt, TransactionResponse } from '@hashgraph/sdk';
import { DappMetadata, HashConnect, HashConnectConnectionState, SessionData, UserProfile } from 'hashconnect';
import { ResultModalComponent } from '../components/result-modal/result-modal.component';
import { SigningService } from './signing.service';
import { HashConnectSigner } from 'hashconnect/dist/signer';
import { startMap } from '../js/game';

//import { createAirplaneMesh } from '../js/airplane';

/*
import('../js/game').then(game => {

    //game.startMap();
    console.log("Imported script!");
    
  }).catch(err => console.error("Error importing game.js", err));
  */
import { Subscription } from 'rxjs';




@Injectable({
    providedIn: 'root'
})
export class HashconnectService {

    constructor() { }

    hashconnect: HashConnect;

    appMetadata: DappMetadata = {
        name: "Rubani",
        description: "flying shooter game on hedera",
        icons: ["https://rubani.bitsoko.org/favicon.png"],
        url: "http://localhost:4200/"
    }

    state: HashConnectConnectionState = HashConnectConnectionState.Disconnected;
    pairingData: SessionData;
    userProfile: UserProfile;

    async initHashconnect(isMainnet: boolean) {
        //create the hashconnect instance
        if (isMainnet)
            this.hashconnect = new HashConnect(LedgerId.MAINNET, "980abf41b1d12f345370395151338868", this.appMetadata, true);
        else
            this.hashconnect = new HashConnect(LedgerId.TESTNET, "980abf41b1d12f345370395151338868", this.appMetadata, true);
        
        //register events
        this.setUpHashConnectEvents();

        //initialize
        await this.hashconnect.init();

        // Check for existing session
        const savedPairingData = localStorage.getItem('hashconnect-pairing-data');
        if (savedPairingData) {
            try {
                const pairingData = JSON.parse(savedPairingData);
                // Verify the pairing data is for the correct network
                if (pairingData.network === (isMainnet ? 'mainnet' : 'testnet')) {
                    // Use connectToLocalWallet instead of connect
                    /*
                    const found = await this.hashconnect.connectToLocalWallet(pairingData.topic);
                    if (found) {
                        this.pairingData = pairingData;
                        // Hide connect button and show start button if we have a valid session
                        document.getElementById("connectToHedera").style.visibility = 'hidden';
                        document.getElementById("start-button-single").style.visibility = 'visible';
                    } else {
                        // If connection failed, clear the saved data
                        localStorage.removeItem('hashconnect-pairing-data');
                    }
                    */
                } else {
                    // Clear saved pairing if it's for a different network
                    localStorage.removeItem('hashconnect-pairing-data');
                }
            } catch (error) {
                console.error('Error restoring HashConnect session:', error);
                localStorage.removeItem('hashconnect-pairing-data');
            }
        }
    }

    setUpHashConnectEvents() {
        //This is fired when a wallet approves a pairing
        this.hashconnect.pairingEvent.on(async (newPairing) => {
            console.log("Paired with wallet", newPairing);

            this.pairingData = newPairing;
            
            // Save pairing data to localStorage
            localStorage.setItem('hashconnect-pairing-data', JSON.stringify(newPairing));
            // save profile id so its accesible from game.js
            localStorage.setItem('hashconnect-profile-id', this.pairingData.accountIds[0]);
            
            let profile = await this.hashconnect.getUserProfile(this.pairingData.accountIds[0]);
            console.log(profile);



            document.getElementById("connectToHedera").style.visibility = 'hidden';
            document.getElementById("start-button-single").style.visibility = 'visible';
         var tHcn;
         tHcn = this;   
document.getElementById('start-button-single').addEventListener('click', async function (evt) {
	//console.log(evt);
    //var subscriptions = new Subscription();
    var signingAcct = '0.0.5724719';
	
	let data = {
        tokenId: "0.0.5740086",
        amount: 50,
        isNft: false,
        serials: [{ number: 0 }]
    }
	let trans = new TokenBurnTransaction()
        .setTokenId(data.tokenId);

        if(!data.isNft)
            trans.setAmount(data.amount);
        else if(data.isNft) {
            let serials = data.serials.map(serial => { return serial.number })
            trans.setSerials(serials);
        }
        try{
            let res = await tHcn.sendTransaction(trans, AccountId.fromString(signingAcct));
    console.log(res.status, res.status._code);
    if(res.status._code == 22){

            document.getElementById('intro-screen').style.visibility = 'hidden';
	    	document.getElementById('header').style.visibility = 'hidden';
	    	document.getElementById('score').style.visibility = 'visible';
        startMap();
    }else{
        
    console.log('INFO! burn transaction failed:'+res.status);
    }
}catch(er){
    console.log('INFO! burn transaction rejected:'+ JSON.stringify(er));
}

                 
});	
           
        });

        //This is fired when a wallet disconnects
        this.hashconnect.disconnectionEvent.on((data) => {
            console.log("Disconnected from wallet", data);
            this.pairingData = null;
        });

        //This is fired when HashConnect loses connection, pairs successfully, or is starting connection
        this.hashconnect.connectionStatusChangeEvent.on((state) => {
            console.log("hashconnect state change event", state);
            this.state = state;
        })
    }


    async sendTransaction(trans: Transaction, acctToSign: AccountId) {
        return await this.hashconnect.sendTransaction(acctToSign, trans)
    }

    async disconnect() {
        await this.hashconnect.disconnect();

        this.pairingData = null;
        this.userProfile = null;

        // await this.hashconnect.init();
    }

    showResultOverlay(data: any) {
            const dialogPopup = new DialogInitializer(ResultModalComponent);
    
            dialogPopup.setCustomData({ data: data });
            
            dialogPopup.setConfig({
                Width: '500px',
                LayoutType: DialogLayoutDisplay.NONE
            });
    
            dialogPopup.setButtons([
                new ButtonMaker('Done', 'send', ButtonLayoutDisplay.SUCCESS)
            ]);
    
            dialogPopup.openDialog$().subscribe(resp => { });
    }
}
