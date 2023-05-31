import { conn } from "./conexion"

const client = conn();

//-------------------------------------------------------------------------------------------    
// Obtener todos los titulos del indice
export async function query(){
    const result: any = await client.search({
      index: "prueba_palabras",
      body: {
        "query": {
          "bool": {
            "must": [
              {
                "bool": {
                  "should": [
                    {
                      "exists": {
                        "field": "titulo"
                      }
                    }
                  ],
                  "minimum_should_match": 1
                }
              }
            ],
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
    //console.log(result)
    const results = [];
    const titulos = result.hits.hits
  
    for (let i = 0; i < titulos.length; i ++) {
      const titulo = result.hits.hits[i]._source?.titulo;
      results.push(titulo);
    }
    //console.log(results)
    return results;
}

//-------------------------------------------------------------------------------------------    

//Obtener nombre de un solo indice
export async function busqueda(title: string){
    const response: any = query().then((dato) => {
    const name = dato?.find(e=>e === title)
    //console.log(name)
    if(title === name){
      console.log("indice encontrado");
      return name
    }else{
      console.log("indice no encontrado");

    }
    });
  
    return response;
  }


//-------------------------------------------------------------------------------------------    
  // Obtener los resultados de un solo documento
export async function queryTitle(title: string): Promise<string[]> {
    const result: any = await client.search({
      index: "prueba_palabras",
      body: {
        "query": {
          "bool": {
            "must": [
              {
                "bool": {
                  "should": [
                    {
                      "match_phrase": {
                        "titulo": title
                      }
                    }
                  ],
                  "minimum_should_match": 1
                }
              }
            ],
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
    //console.log(result.hits.hits[0]._source?.texto)
    return result;
  }

//----------------------------------------------------------------
//Query para categorías
export async function queryCategory(title: string): Promise<string[]> {
  const result: any = await client.search({
    index: "prueba_palabras",
    body: {
      "query": {
        "bool": {
          "must": [
            {
              "bool": {
                "should": [
                  {
                    "match_phrase": {
                      "titulo": title
                    }
                  }
                ],
                "minimum_should_match": 1
              }
            }
          ],
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
  //console.log(result.hits.hits[0]._source?.texto)
  return result;
} 
  