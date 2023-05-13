/* 
    STEP 1, ! IMPORTANT ! Creating payment and policy keys. Run these commands in order. 
        npm run keys

    STEP 2,
        npm run policy

    STEP 3, Generate images.png with metadata.json, view in ./nfts folder
        npm run nfts

    STEP 4, Listen to onchain and actions 
        npm run dev
*/

import * as dotenv from 'dotenv';
dotenv.config({path: process.cwd() + '/config.env'});

import { database } from './_mongodb';
import listeners from './listeners';

database();

listeners.on_mint_nft(5000);

listeners.on_recieve(5000);

listeners.on_refund(5000);