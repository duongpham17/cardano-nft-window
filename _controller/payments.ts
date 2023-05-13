import Payments, { IPayments } from '../_model/payments';

const find = async (query: any): Promise<IPayments[]> => {
    const p = await Payments.find(query);
    return p
};

const findUtxo = async (utxo: string): Promise<IPayments | null> => {
    const p = await Payments.findOne({utxo});
    return p
};

const remove = async (_id: string): Promise<IPayments | null> => {
    const p = await Payments.findByIdAndDelete(_id);
    return p;
};

const create = async (data: IPayments): Promise<void> => {
    await Payments.create(data);
};

const update = async (data: IPayments): Promise<IPayments | null> => {
    const p = await Payments.findByIdAndUpdate(data._id, data, {new: true});
    return p;
};

const count = async (policy_id: string, status: IPayments["status"][]): Promise<number> => {
    const p = await Payments.countDocuments({policy_id, status});
    return p
}

const removeAll = async (policy_id: string | undefined): Promise<void> => {
    await Payments.deleteMany({policy_id});
}

export default {
    find,
    findUtxo,
    remove,
    create,
    update,
    count,
    removeAll,
}