import {Schema, model, Document} from 'mongoose';

export interface IPayments extends Partial<Document> {
    policy_id: string,
    utxo: string,
    txid: string,
    batched_tokens: string,
    amount_in_lovelace: string,
    status: "pending" | "refund" | "refunded" | "correct_amount" | "minted" | "gift",
    amount_in_ada: string,
    metadata_pathname: string,
    hashed_token_name: string,
    sender_address?: string,
    createdAt: Date,
};

const paymentsSchema = new Schema({
    policy_id: {
        type: String
    },
    utxo:{
        type: String
    },
    txid: {
        type: String
    },
    batched_tokens:{
        type: String
    },
    amount_in_lovelace: {
        type: String
    },
    status:{
        type: String,
        enum: ["pending", "refund", "refunded", "correct_amount", "gift", "minted"],
        default: "pending"
    },
    amount_in_ada:{
        type: String
    },
    metadata_pathname:{
        type: String
    },
    hashed_token_name:{
        type: String,
    },
    sender_address:{
        type: String
    },
    created_at: {
        type: Date
    }
});

export default model<IPayments>('Payments', paymentsSchema);