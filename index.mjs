
 import { GameFi } from '@ton/phaser-sdk'

const gameFi = await GameFi.create({
    network: 'testnet'
    connector: {
        // if tonconnect-manifest.json is placed in the root you can skip this option
        manifestUrl: 'tonconnect-manifest.json',
        actionsConfiguration: {
            // address of your Telegram Mini App to return to after the wallet is connected
            // url you provided to BothFather during the app creation process
            // to read more please read https://github.com/ton-community/flappy-bird#telegram-bot--telegram-web-app
            twaReturnUrl: "https://t.me/rubani_bot"
        },
        contentResolver: {
            // some NFT marketplaces don't support CORS, so we need to use a proxy
            // you are able to use any format of the URL, %URL% will be replaced with the actual URL
            //urlProxy: `${YOUR_BACKEND_URL}/${PROXY_URL}?url=%URL%`
        },
        // where in-game purchases come to
        merchant: {
            // in-game jetton purchases (FLAP)
            // use address you got running `assets-cli deploy-jetton`
            jettonAddress: "kQC2dIk7SZR7CXT_xFISznRyUEK4-uHPri43KGmZTPICCd5-",
            // in-game TON purchases
            // use master wallet address you got running `assets-cli setup-env`
            tonAddress: "kQAIyQCZPGdzcPQoaqqs47_Y8WJadR9ARKr4aajnSA1lo1vv"
        }
    },

})

