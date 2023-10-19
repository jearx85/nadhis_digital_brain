import { Client } from '@elastic/elasticsearch';
const colors = require('colors');



//Conexion con elasticsearch
export function conn(): Client {
  const client = new Client({
    node: ['https://10.11.230.21:9200', 'https://10.11.230.22:9200', 'https://10.11.230.23:9200', 'https://10.11.230.25:9200'],
    tls: {
      //ca: fs.readFileSync('C:/Users/user/Desktop/code_jeisson/VAULT_CITRA/CITRA/.obsidian/plugins/testing-plugin/certs/ca.key'),
      rejectUnauthorized: false,
    },
    auth: {
      apiKey: 'X3dqNXpvUUJFUVc4d0VBYlNzb2o6a3prVmVkajhSdVcya1F6cGFUbko5Zw=='
    }

  })
  return client;
}

//Validar que la conexion funciona

const client = conn();
client.ping()
  .then(response => {
    console.log(colors.rainbow("Nadhis digital brain "));
  })
  .catch(error => {
    console.error('Failed to connect to Elasticsearch:', error);
  });



// obtener nombres de los indices

/* export async function getIndexList() {
  const client = conn();
  const response = await client.cat.indices({ format: 'json' });
  const texto = response.map((index) => index.index)
  console.log(texto)
  return texto
} */


// query para obtener el index
/* export async function query(value: string) {
  const index_name = value;

  const result = await client.search({
    index: index_name,
    body: {
      "query": {
        "bool": {
          "must": [],
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
  }, {
    ignore: [404],
    maxRetries: 3
  })
  return result;
} */


