
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
             

```