import { CARDANO_CLI, CARDANO_NETWORK_TYPE, get_policy_id } from '../../global';
import { IPayments } from '../../_model/payments';
import payments from '../../_controller/payments';

const cmd: any = require("node-cmd");

const absolute_path = __dirname.replace(/\\/g, "/");

interface Refund {
    refund_amount: number, 
    minimum_lovelace_fee: number
}

const buildRawTx = (data: IPayments): void => {
    const {utxo, txid, sender_address, batched_tokens} = data;
    cmd.runSync([
        CARDANO_CLI,
        "transaction build-raw",
        `--tx-in ${utxo}#${txid}`,
        `--tx-out ${sender_address}+0${batched_tokens}`,
        `--fee 0`,
        `--out-file ${absolute_path}/tx/tx.draft`
    ].join(" "));
};

const calcMinimumFee = (amount_in_lovelace: number | string): Refund => {
    const calculated_fee = cmd.runSync([
        CARDANO_CLI,
        "transaction calculate-min-fee",
        `--tx-body-file ${absolute_path}/tx/tx.draft`,
        `--tx-in-count 1`,
        `--tx-out-count 1`,
        `--witness-count 1`,
        CARDANO_NETWORK_TYPE,
        `--protocol-params-file ${absolute_path}/../protocol.json`
    ].join(" "));

    const [minimum_lovelace_fee] = calculated_fee.data.split(" ");

    const refund_amount = Number(amount_in_lovelace) - Number(minimum_lovelace_fee);

    return {
        refund_amount,
        minimum_lovelace_fee
    }
};

const buildRealTx = (data: IPayments, refund: Refund): void => {
    const {utxo, txid, sender_address, batched_tokens} = data;
    const {refund_amount, minimum_lovelace_fee} = refund;
    cmd.runSync([
        CARDANO_CLI,
        "transaction build-raw",
        `--tx-in ${utxo}#${txid}`,
        `--tx-out ${sender_address}+${refund_amount}${batched_tokens}`,
        `--fee ${Number(minimum_lovelace_fee)}`,
        `--out-file ${absolute_path}/tx/tx.draft`
    ].join(" "));
};

const signTx = (): void => {
    cmd.runSync([
        CARDANO_CLI,
        "transaction sign",
        `--tx-body-file ${absolute_path}/tx/tx.draft`,
        `--signing-key-file ${absolute_path}/../../account/keys/payment.skey`,
        `${CARDANO_NETWORK_TYPE}`,
        `--out-file ${absolute_path}/tx/tx.signed`
    ].join(" "));
};

const submitTx = async (): Promise<boolean> => {
    let status: boolean = false;
    
    try{
        const response = await cmd.runSync([
            CARDANO_CLI,
            "transaction submit",
            `--tx-file ${absolute_path}/tx/tx.signed`,
            `${CARDANO_NETWORK_TYPE}`
        ].join(" "));
      if(response.data.includes("success")) status = true;
    } catch(err){
      status = false
    };
  
    return status;
  }

const refund_payments = async () => {

    const policy_id = get_policy_id();

    if(!policy_id) return console.log('Refund, no policy id')

    const refunds = await payments.find({policy_id, status: "refund"});

    const max_iteration: number = refunds.length >= 30 ? 30 : refunds.length;

    for(let i = 0; i < max_iteration; i++){

        const data = refunds[i];
        
        buildRawTx(data);

        const refund = calcMinimumFee(data.amount_in_lovelace);

        buildRealTx(data, refund);

        signTx();

        const status = await submitTx();
        
        if(!status) continue;

        data.status = "refunded";

        await payments.update(data);

        console.log("------------------------------------------------------------------------")
        console.log(`> ${data.amount_in_lovelace} Refunded to, \n ${data.sender_address}`);
        console.log("------------------------------------------------------------------------")
    }

};

export const on_refund = (milliseconds?:number) => setInterval(async () =>  await refund_payments(), milliseconds || 10000);