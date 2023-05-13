/* 
    If you plan on deleting and restarting, make sure to run this function first then generate new payment policy keys
*/

import fs from 'fs';
import payments from './_controller/payments';
import { get_policy_id } from './global';
import { database } from './_mongodb';

const absolute_path = __dirname.replace(/\\/g, "/");

const clean = async () => {

    database();

    const policy_id = get_policy_id();
    fs.rmSync(`${absolute_path}/nfts/tracker.json`, { recursive: true, force: true })
    fs.rmSync(`${absolute_path}/nfts/image`, { recursive: true, force: true })
    fs.rmSync(`${absolute_path}/nfts/metadata`, { recursive: true, force: true });

    try{
        await payments.removeAll(policy_id);
    } catch(err){
        console.log("Database is not connected, nothing has been deleted from the database");
    }
    
    console.log("Deleted all nfts/images, nfts/metadata, payments database, successful")
};

clean();