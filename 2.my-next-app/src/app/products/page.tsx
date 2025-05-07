import { getDBConnection } from "@/lib/db";
import redisClient from "@/lib/redis";
import { unstable_cache } from "next/cache";

const CACHE_KEY = 'product';

const getProductsFromDB_REDIS_CACHE = async () => {
    const data = await redisClient.get(CACHE_KEY);
    if(data){
        console.log('return redis cache')
        return JSON.parse(data);
    } 
    // TODO: direct connexion vs proxy connexion.
    const db = await getDBConnection(); 
    const [products] = await db.query('SELECT * FROM products');
    redisClient.set(CACHE_KEY, JSON.stringify(products));
    return products;
} 

// Mise en cache "globale" (tout type de traitement)
// (ca peut faire penser à tt ce qui est useEffect, useMemo dans React)
const getProductsFromDB = unstable_cache(
  async () => {
    // TODO: direct connexion vs proxy connexion.
    const db = await getDBConnection(); 
    const [products] = await db.query('SELECT * FROM products');
    return products;
  },
  ['products'],
  { revalidate: 3600, tags: ['products'] }
)

// Mise en cache fetch surr API HTTP
// TODO: est ce qu'on a accès au cache manuellement
const getProductsFromAPI = async () => {
    const data = await fetch('https://dummyjson.com/products', { cache: 'force-cache',  next: { revalidate: 3600 } });
    return await data.json();
}

export default async function Products() {

    // Avec cache ~10ms et sans  ~50ms  
    console.time('DB FECTH')
    const results = await getProductsFromDB();
    console.timeEnd('DB FECTH')
    console.log('Results from DB', results);

    // Avec cache redis ~25 à 30ms (en général 2 à 3 fois plus long)
    console.time('DB FECTH + CACHE REDIS')
    const resultsREDIS = await getProductsFromDB_REDIS_CACHE();
    console.timeEnd('DB FECTH + CACHE REDIS')
    console.log('Results from REDIS', resultsREDIS.length);
    
    // Avec cache ~<10ms et sans ~350ms  
    console.time('API FECTH')
    const resultsAPI = await getProductsFromAPI();
    console.timeEnd('API FECTH')

    console.log('Results from API', resultsAPI.length);
    return (
        <>
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">Products</h1>
                <table className="w-full border">
                    <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2 border">Code</th>
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">Line</th>
                        <th className="p-2 border">Stock</th>
                        <th className="p-2 border">Price</th>
                    </tr>
                    </thead>
                    <tbody>
                        ...
                    </tbody>
                </table>
                </div>
        </>
    )
} 