import { conn } from "./conexion"

const client = conn();

//-------------------------------------------------------------------------------------------    
//=============================> Obtener todos los titulos del indice <=============================
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
    //console.log(titulos)
  
    for (let i = 0; i < titulos.length; i ++) {
      const titulo = result.hits.hits[i]._source?.titulo;
      results.push(titulo);
    }
    //console.log(results)
    return results;
}

//-------------------------------------------------------------------------------------------    
//=============================> Obtener nombre de un solo indice <=============================
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
  //=============================> Obtener los resultados de un solo documento <=============================
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
//=============================> Query para listar categorías <=============================
export async function queryCategory(): Promise<string[]>{
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
                      "field": "categoria"
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
    const titulo = result.hits.hits[i]._source?.categoria;
    results.push(titulo);
  }
  //console.log(results)
  return results; 
}
//queryCategory()

//----------------------------------------------------------------
//=============================> buscar doc por categoria asociada <=============================
export async function queryCategories(category: string): Promise<string[]> {
  // console.log(category);
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
                      "categoria": category
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
  const results = [];
  const titulos = result.hits.hits

  for (let i = 0; i < titulos.length; i ++) {
    const titulo = result.hits.hits[i]._source?.titulo;
    results.push(titulo);
  }
  return results;
}

// ----------------------------------------------------------------
export async function semanticQuery(title: string): Promise<string[]> {
  const result: any = await client.search({
    index: "vectors_index_2",
    body: {
      "query": {
        "bool": {
          "must": [
            {
              "bool": {
                "should": [
                  {
                    "match_phrase": {
                      "content": title
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
  
  const res = result.hits.hits[0]._source.title
  //console.log(res)
  return result;
}

//semanticQuery("hilda")

//----------------------------------------------------------------
export async function semanticQueryContent(titulo: string){
  const result: any = await client.search({
    index: "vectors_index_2",
    body: {
      "query": {
        "bool": {
          "must": [
            {
              "bool": {
                "should": [
                  {
                    "match_phrase": {
                      "title": titulo
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
  const res = result.hits.hits[0]._source.content
  //console.log(res)
  return res;
}
//semanticQueryContent("Las ovejas")
//--------------------------------------------------------------------------------------