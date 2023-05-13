import Collections, { ICollections } from '../_model/collections';
import { IPayments } from '../_model/payments';

const find = async (policy_id: string): Promise<ICollections[]> => {
    const c = await Collections.find({policy_id});
    return c
};

const findById = async (_id: string): Promise<ICollections | null> => {
    const c = await Collections.findById(_id);
    return c
};

const create = async (data: IPayments): Promise<void> => {
    delete data._id
    await Collections.create({
        policy_id: data.policy_id,
        amount_in_lovelace: data.amount_in_lovelace,
        amount_in_ada: data.amount_in_ada,
        metadata_pathname: data.metadata_pathname,
        hashed_token_name: data.hashed_token_name,
        sender_address: data.sender_address,
        created_at: new Date()
    });
};

const update = async (data: ICollections): Promise<ICollections | null> => {
    const c = await Collections.findByIdAndUpdate(data._id, data, {new: true});
    return c;
};

export const count = async (policy_id: string): Promise<number> => {
    const c = await Collections.countDocuments({policy_id});
    return c
};

export default {
    find,
    findById,
    create,
    update,
    count
}