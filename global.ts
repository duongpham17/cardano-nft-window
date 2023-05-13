import fs from 'fs';
import path from 'path';
// Config accordingly

export const CARDANO_CLI: string = "C:/Users/tung/cardano/cardano-cli.exe"; // OR manually enter it in cmd.runSync

export const CARDANO_NETWORK_TYPE: "--mainnet" | "--testnet-magic 1" | "--testnet-magic 2"  = "--testnet-magic 1"; // --mainnet | --testnet-magic 1097911063

export const CARDANO_ERA: "--babbage-era" = "--babbage-era";

// Where all your cardano will be sent to after EACH nft is minted and sent to user. Important.
export const PROJECT_NAME: string = "Fatduck";

export const SEND_CHANGE_TO_ADDRESS = "addr_test1qq4arh8dpqmrxkt7qe6q4l334866wycktnjaguwyh57qgqdhkgpkeq3gd4u3pnfmafx4w7qjylcwnj6qkj8z53wxa4lq8mg5yc"; 

export const COST_OF_NFT: number = 1_000_000 * 10; // in Lovelace

export const TOTAL_MINT: number = 10000;

export const HOURS_BEFORE_CONTRACT_EXPIRES: number = 5000;

export const get_wallet_address = () => {
    try{
        const wallet_address = fs.readFileSync(`${path.resolve(__dirname)}/account/keys/payment.addr`, 'utf-8');
        return wallet_address
    } catch(err){
        console.log("Error no payment keys have been created. \n RUN \n npm run keys")
    }
}

export const get_slot_number = () => {
    try{
        const slot_number = JSON.parse(fs.readFileSync(`${path.resolve(__dirname)}/account/policy/policy.script`, 'utf-8')).scripts[0].slot;
        return slot_number
    } catch(err){
        console.log("Error no policy keys have been created. \n RUN \n npm run policy")
    }
} 
  
export const get_policy_id = () => {
    try{
        const policy_id = fs.readFileSync(`${path.resolve(__dirname)}/account/policy/policyID`, 'utf-8');
        return policy_id
    } catch(err){
        console.log("Error no policy keys have been created. \n RUN \n npm run policy")
    }
}    
  