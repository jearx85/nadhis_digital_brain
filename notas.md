
 ```typescript
 const target = event.target as HTMLElement;
        //console.log(target)
        if (target.matches('h4.titulos')) {
          const notePath = getdocuments(value);
          console.log("path: "+notePath)
          // Abre la nota correspondiente al path
          if (notePath) {
            this.app.workspace.openFileByPath(notePath);
          }
        }


//Abrir el documento en un nuevo view
  await app.workspace.activeLeaf?.openFile(newNote);


  ///=================================demo===================================================================
  //campos quemados
  searchBoxVector.placeholder = "Busqueda avanzada";
  const vectors = searchBoxVector;
  spinner.hide();

  vectors.addEventListener("keydown",function  (event) {
    if (event.key === "Enter") {
      container.empty();
      if(vectors.value.length > 0) {
        event.preventDefault();

        spinner.style.display = 'block';
        const searching = container.createEl("h4");
        searching.className = "searching";
        searching.textContent = "buscando...";

        const titles = ["1. Seguimiento al Plan Estratégico Institucional 2019 - 2022 Ministerio del Interior.", "ley 906 de 2004", "Ley 151 de 2010"]
        const contenido = "" 
        //const contenido1 = contenido.replace('\n', '<br>');
        setTimeout(() => {
          for (const titulo of titles) {
            const titles2 = container.createEl("h4");
            titles2.className = "titulos";
            titles2.textContent = titulo;
            titles2.addEventListener("click", async () => {
              new Notice("Nuevo documento creado");
              container.empty();
            })
          }
          spinner.style.display = 'none';
          searching.textContent = "";
          searchBoxVector.value = "";
          
        }, 3000);
        
        

      }else{
        event.preventDefault();
        new Notice("El campo de busqueda esta vacío");	
        container.empty();
      }
    }
  });
  ///======================================================================================================================================
  //Busqueda semantica
 semanticQueryContent(titulo).then((results) => {
							//console.log(contenido)
							 const exist_note = checkNoteExists(vault, titulo); // Verificar si la nota ya existe
							 
							 exist_note.then((res: any) => {
							 		if (!res) {
							 			const noteTitle = `${titulo}.md`; // Titulo de la nota
							 			createNoteAndSetContent(noteTitle, results); //Crea la nota en obsidian

										 setTimeout(() => {
											openDocuments(titulo);//espera a que la nota se cree y luego la abre
										
										}, 500);

							 		} else {
							 			updateNoteContent( vault, titulo, results);
							 		}
							 	})
							 	.catch((error: any) => console.log(error));
 
							 container.empty();
							 searchBoxVector.value = "";
						 })
						 .catch((error) => {
							 console.error(`Error searching in Elasticsearch: ${error}`);
						 });

  //======================================> Hacer el query en el elemento seleccionado <======================================

		async function searchTitle(title: string) {
			const vault = app.vault;
			queryTitle(`${title}`)
				.then((results: any) => {
					const titulo = results.hits.hits[0]._source.title; // Extraer titulo de la busqueda
					const exist_note = checkNoteExists(vault, titulo); // Verificar si la nota ya existe
					exist_note.then((res: any) => {
							if (!res) {
								const noteTitle = `${titulo}.md`; // Titulo de la nota
								const noteContent = results.hits.hits[0]._source.mark; // Convierte el resultado de la búsqueda en una cadena JSON formateada
								
								createNoteAndSetContent(noteTitle, noteContent); //Crea la nota en obsidian
								
								setTimeout(() => {
									openDocuments(titulo);//espera a que la nota se cree y luego la abre
								
								}, 1000);
								
							} else {
								const updatedContent = results.hits.hits[0]._source.mark; // Convierte el resultado de la búsqueda en una cadena JSON formateada
								
								updateNoteContent( vault, titulo, updatedContent);

							}
						})
						.catch((error: any) => console.log(error));
				})
				.catch((error) => {
					console.error(`Error searching in Elasticsearch: ${error}`);
				});
		}

		//--------------------------------------------------------------------------------------           
      
      // ----------------------------------------------------------------
export async function semanticQuery(title: string): Promise<string[]> {
  const result: any = await client.search({
    index: "nadhis_digital_brain",
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
    index: "nadhis_digital_brain",
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
  const res = result.hits.hits[0]._source.mark
  //console.log(res)
  return res;
}
//semanticQueryContent("Caracterizacion-ciudadania-y-grupos-de-valor-2022")
//--------------------------------------------------------------------------------------
//=============================> Obtener todos los titulos del indice <=============================
export async function query(){
    const result: any = await client.search({
      index: "nadhis_digital_brain",
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
      index: "nadhis_digital_brain",
      body: {
        "query": {
          "bool": {
            "must": [
              {
                "bool": {
                  "should": [
                    {
                      "match_phrase": {
                        "title": title
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
    //console.log(result.hits.hits[0]._source.mark)
    return result;
  }
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
//========================conexión con elastic ===================================================
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
//----------------------------------------------------------------
```