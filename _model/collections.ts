import {Schema, model, Document} from 'mongoose';

export interface ICollections extends Partial<Document> {
    policy_id: string,
    amount_in_lovelace: string,
    amount_in_ada: string,
    metadata_pathname: string,
    hashed_token_name: string,
    sender_address: string,
    createdAt: Date,
};

const collectionsSchema = new Schema({
    policy_id: {
        type: String
    },
    amount_in_lovelace: {
        type: String
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

export default model<ICollections>('Collections', collectionsSchema);