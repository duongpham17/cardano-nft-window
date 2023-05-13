import * as dotenv from 'dotenv';
dotenv.config({path: process.cwd() + '/config.env'});

import { create, clear } from './nfts';

clear();
