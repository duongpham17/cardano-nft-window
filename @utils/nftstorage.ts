import axios from 'axios';
import { NFTStorage, Blob } from 'nft.storage';

const nft_storage_api_token = process.env.NFT_STORAGE_API_TOKEN;

export const upload = async (image: any): Promise<{ url: string; ipfs: string}> => {
    const storage = new NFTStorage({ token: nft_storage_api_token || "" });
    const blob = new Blob([image]);
    const cid = await storage.storeBlob(blob);
    return {
        url: `ipfs://${cid}`,
        ipfs: cid
    }
};

export const remove = async (cid: string): Promise<boolean> => {

    try{
        const api = axios.create({
            baseURL: `https://api.nft.storage`,
            headers: { Authorization: `Bearer ${nft_storage_api_token}` }
        });
        await api.delete(`/${cid}`)
    } catch(err:any){
        console.log(err)
        return false
    }

    return true
};

export const removeAll = async (): Promise<void> => {

    const api = axios.create({
        baseURL: `https://api.nft.storage`,
        headers: { Authorization: `Bearer ${nft_storage_api_token}` }
    });

    setInterval(async () => {

        const {data} = await api.get("/");

        const storage = data.value;
        
        let accumulator = 0;
    
        for(let i of storage) {
            await api.delete(`/${i.cid}`);
            accumulator++;
    
            console.log("------------------------------------------------------------------------")
            console.log('deleted', i.cid)
            console.log(accumulator, "/", storage.length);
        }
    }, 30000);

};