import { CARDANO_CLI, CARDANO_NETWORK_TYPE, COST_OF_NFT, TOTAL_MINT, PROJECT_NAME, get_wallet_address, get_policy_id} from '../../global';
import { blockfrost } from '../../@utils/blockfrost';
import { IPayments } from '../../_model/payments';
import payments from '../../_controller/payments';

const cmd:any = require("node-cmd");

const isAmountCorrect = (amount: number | string): boolean => {
    return Number(amount) === (COST_OF_NFT);
};

const getSenderAddress = async (utxo: string): Promise<string> => {
    try{
        const response = await blockfrost.txsUtxos(utxo);
        return response.inputs[0].address;
    } catch(_) {
        console.log("Check blockfrost api, check if your using the correct api key for the environment")
        return ""
    }
};

const getUtxoTable = async(policy_id: string): Promise<string[]> => {

    const WALLET_ADDRESS = get_wallet_address();

    const gifted = await payments.find({policy_id, status: 'gift'});

    const rawUtxoTable = cmd.runSync([
        CARDANO_CLI,
        "query utxo",
        CARDANO_NETWORK_TYPE,
        `--address ${WALLET_ADDRESS}`,
    ].join(" "));
    
    const utxoTableRows: string[] = rawUtxoTable.data.trim().split('\n').splice(2);

    const gifted_ids = gifted.map(el => el.utxo);

    const utxos: string[] = [];

    if(gifted_ids.length){
        for(let x of utxoTableRows){
            for(let i of gifted_ids){
            const exist = x.includes(i);
            if(!exist) utxos.push(x)
            }
        };
    }

    console.log("------------------------------------------------------------------------")
    console.log(new Date());
    console.log("Policy ID", policy_id);
    console.log("utxo length", utxos.length);

    return !utxos.length ? utxoTableRows : utxos;
};

interface MintTracker {
    metadata_pathname: string, 
    hashed_token_name?: string,
    mint_number: number, 
    is_max_mint: boolean,
}

const nft_tracker = async (policy_id: string): Promise<MintTracker> => {

    const mint_number = await payments.count(policy_id, ["minted", "correct_amount"]);
    
    const updated_mint_number = mint_number+1;
    const project_metadata_id = `${PROJECT_NAME}${updated_mint_number}`;
    const metadata_pathname = `${project_metadata_id}.json`;
    const is_max_mint = updated_mint_number > TOTAL_MINT;

    const data: MintTracker = { 
        metadata_pathname, 
        mint_number: updated_mint_number, 
        is_max_mint
    };

    if(is_max_mint) return data;
    
    const hashed_token_name = Buffer.from(project_metadata_id, 'utf8').toString('hex');

    return {...data, hashed_token_name};
};

const recieve = async () => {
    const policy_id = get_policy_id();

    if(!policy_id) return console.log('Recieve, no policy id')

    const utxo_table = await getUtxoTable(policy_id);

    const max_iteration: number = utxo_table.length >= 20 ? 20 : utxo_table.length;

    for (let i = 0; i < max_iteration; i++) {

        const [utxo, txid, amount_in_lovelace] = utxo_table[i].split(" ").filter((s: string) => s);
        
        const config_tokens = utxo_table[i].split(" ").filter(s => s).slice(5, -1).filter(s => s !== "+");
        const batch_tokens_for_output = config_tokens.map((el: any, index: number, items: string[]) => index % 2 === 0 ? `+"${el} ${items[index+1]}"` : "").filter((s: any) => s).join("")
        
        const is_metadata_pending = await payments.findUtxo(utxo);
        if(is_metadata_pending) continue;

        const sender_address: string = await getSenderAddress(utxo);

        const data: IPayments = {
            policy_id,
            utxo,
            txid,
            sender_address,
            amount_in_lovelace,
            status: "refund",
            createdAt: new Date(),
            batched_tokens: batch_tokens_for_output,
            metadata_pathname: "",
            hashed_token_name: "",
            amount_in_ada: String(Number(amount_in_lovelace) / 1_000_000)
        };

        const is_under_lovelace_required_for_a_refund = 5000000 >= Number(amount_in_lovelace);
        if(is_under_lovelace_required_for_a_refund) return await payments.create({...data, status: "gift"});

        const is_correct_amount = isAmountCorrect(amount_in_lovelace);
        if(!is_correct_amount) return await payments.create(data);

        const {metadata_pathname, is_max_mint, hashed_token_name} = await nft_tracker(policy_id);
        if(is_max_mint) return await payments.create(data);

        const data_correct: IPayments = {
            ...data,
            amount_in_ada: (Number(amount_in_lovelace) / 1000000).toFixed(6),
            metadata_pathname,
            hashed_token_name: hashed_token_name || "",
            status: "correct_amount"
        }

        await payments.create(data_correct);

    };

    const metadata_tracker = await payments.find({policy_id});

    const total = metadata_tracker.reduce((acc: any, curr) => {
        return {...acc, [curr.status]: acc[curr.status] + 1}
    }, {
        pending: 0,
        refund: 0,
        refunded: 0,
        correct_amount: 0,
        minted: 0,
        gift: 0
    });

    console.log("Transactions", total);
}

export const on_recieve = (milliseconds?:number) => setInterval(async () => await recieve(), milliseconds || 10000);
