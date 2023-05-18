import { ItemView, WorkspaceLeaf, Plugin, Notice, App, Modal, Setting, TFile, TFolder, Vault, TAbstractFile } from "obsidian";
import { query, busqueda, queryTitle } from './funciones';

//, getIndexList

export const VIEW_TYPE_EXAMPLE = "example-view";

export class ExampleView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_EXAMPLE;
  }

  getDisplayText() {
    return "Documentos Elasticsearch";
  }

  async onOpen() {
    const container = this.containerEl.children[1];




    consultar();
    const searchBox = createEl('input');
    searchBox.type = 'text';
    searchBox.placeholder = 'Buscar...';
    container.appendChild(searchBox);

    //Caja de busqueda
    const input = searchBox

    //Accion para cunado presionamos enter
    input.addEventListener("keyup", function (event) {
      const texto = input.value;
      //console.log(texto);
      if (event.key === "Enter") {

        container.empty();
        const dato: any = busqueda(texto).then((data) => {

          if (!data) {
            container.appendChild(searchBox);
            new Notice(`No se encuentra elemento ${texto}`)
            consultar();
          } else {
            const h4 = container.createEl("h4");
            h4.classList.add("titulos");
            h4.textContent = data
            h4.addEventListener('click', () => {
              container.empty();
              searchTitle(data);
              new Notice(`Haz hecho clic en el elemento ${data}`)

              container.appendChild(searchBox);
              consultar();

            });

          }

        });
        input.value = ""
      }
    });

    //Funcion para listar los titulos y tarer el texto
    async function consultar() {
      const datos = await query();
      //console.log(datos);

      datos.forEach((value: any) => {
        const h4 = container.createEl("h4");
        h4.textContent = value
        h4.classList.add("titulos");
        h4.addEventListener('click', () => {
          console.log(`Haz hecho clic en el elemento ${value}`);
          new Notice('Sincronizando documento');

          /// Hacer el query en el elemento seleccionado

          searchTitle(value);

        });
      });
    }


    /// Hacer el query en el elemento seleccionado   
    async function searchTitle(title: string) {
      const vault = app.vault;
      queryTitle(`${title}`).then((results: any) => {
        const titulo = (results.hits.hits[0]._source.titulo);// Extraer titulo de la busqueda
        const exist_note = checkNoteExists(vault, titulo);// Verificar si la nota ya existe

        exist_note.then((res: any) => {
          if (!res) {

            const noteTitle = `${titulo}.md`; // Titulo de la nota 
            const noteContent = JSON.stringify(results.hits.hits[0]._source.texto, null, 4); // Convierte el resultado de la búsqueda en una cadena JSON formateada 
            createNoteAndSetContent(noteTitle, noteContent);

          } else {

            const updatedContent = JSON.stringify(results.hits.hits[0]._source.texto, null, 4); // Convierte el resultado de la búsqueda en una cadena JSON formateada
            updateNoteContent(vault, titulo, updatedContent);

          }
        }).catch((error: any) => console.log(error));

      }).catch((error) => {
        console.error(`Error searching in Elasticsearch: ${error}`);
      });


    }

    //Validar si ya existe la nota en obsidian
    async function checkNoteExists(vault: Vault, title: string): Promise<boolean> {

      const file = vault.getAbstractFileByPath(`${title}.md`);
      return file instanceof TAbstractFile

    }


    //Crear nueva nota
    let currentNote: any = null;
    async function createNoteAndSetContent(title: string, content: string) {
      try {
        const newNote = await app.vault.create(title, content);
        console.log(`Created new note: ${newNote.name}`);
        currentNote = newNote;
        new Notice("Nuevo documento creado");

      } catch (error) {
        console.error(`Error creating new note: ${error}`);
      }
    }


    //Actualizar nota
    async function updateNoteContent(vault: Vault, title: string, content: string): Promise<void> {
      const file = vault.getAbstractFileByPath(`${title}.md`);
      if (file instanceof TFile) {
        await vault.modify(file, content);
        new Notice('Documento actualizado');
      }
    }

  }

  async onClose() {
    // Nothing to clean up.
  }
}
