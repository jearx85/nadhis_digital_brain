
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




```



 