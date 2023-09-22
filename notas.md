
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


```