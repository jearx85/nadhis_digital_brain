import { ItemView, WorkspaceLeaf, Plugin, Notice, App, Modal, Setting, TFile, TFolder, Vault, TAbstractFile, getLinkpath, MarkdownView,} from "obsidian";
import { query, queryTitle } from "./funciones";

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
		//Creación de los elementos html
		const container = document.createElement("div");
		const searchBox = document.createElement("input");
		const container2 = document.createElement("select");

		//Asignación de clases
		container.className = "my-container";
		searchBox.className = "searchBox";
		container2.className = "Mydropdown";

		// Agrega el contenedor a la vista de Markdown
		this.containerEl.children[1].appendChild(container2);
		this.containerEl.children[1].appendChild(searchBox);
		this.containerEl.children[1].appendChild(container);

		consultar(); //Listar los titulos en el view

		//-----------------------------------------------------------------

		//Caja de busqueda------------------------------------------------
		searchBox.type = "text";
		searchBox.placeholder = "Buscar...";

		//Dropdown para categorias------------------------------------------
    const opciones = ["Jurídica", "Administración", "Presupuesto", "Contabilidad"]
    const defaultOption = createEl("option");
    defaultOption.textContent = "Seleccione categoría";
    defaultOption.selected = true;
    defaultOption.disabled = true;
    container2.appendChild(defaultOption);
		
    for(let i = 0; i < opciones.length; i++) {
      const option = createEl("option");
      container2.appendChild(option);
      option.textContent = opciones[i];

    };
    // option.addEventListener('click' , async () =>{
    //   container2.appendChild(defaultOption);
     
    //  });
    
		//Accion para cuando se escribe en el input
		const input = searchBox;
		input.addEventListener("input", function () {
			const texto = input.value;
			container.empty();
			buscar(texto);
		});

		//-------------------------------------------------------------------------------------------
		//Funcion para listar los titulos y tarer el texto
		async function consultar() {
			const datos = await query();
			//console.log(datos);
			datos.forEach((value: any) => {
				const h4 = container.createEl("h4");
				h4.textContent = value;
				h4.classList.add("titulos");

				h4.addEventListener("click", async () => {
					//console.log(`Haz hecho clic en el elemento ${value}`);
					new Notice("Sincronizando documento");
					searchTitle(value); // Hacer el query en el elemento seleccionado
				});
			});
		}

		//-----------------------------------------------------------------------------------------

		/// Hacer el query en el elemento seleccionado
		async function searchTitle(title: string) {
			const vault = app.vault;
			queryTitle(`${title}`)
				.then((results: any) => {
					const titulo = results.hits.hits[0]._source.titulo; // Extraer titulo de la busqueda
					const exist_note = checkNoteExists(vault, titulo); // Verificar si la nota ya existe
					exist_note
						.then((res: any) => {
							if (!res) {
								const noteTitle = `${titulo}.md`; // Titulo de la nota
								const noteContent = JSON.stringify( results.hits.hits[0]._source.markdown, null, 4); // Convierte el resultado de la búsqueda en una cadena JSON formateada

								createNoteAndSetContent(noteTitle, noteContent); //Crea la nota en obsidian
							} else {
								const updatedContent = JSON.stringify( results.hits.hits[0]._source.markdown, null, 4); // Convierte el resultado de la búsqueda en una cadena JSON formateada
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

		//Validar si ya existe la nota en obsidian
		async function checkNoteExists( vault: Vault, title: string): Promise<boolean> {
			const file = vault.getAbstractFileByPath(`${title}.md`);
			return file instanceof TAbstractFile;
		}

		//--------------------------------------------------------------------------------------
		//Crear nueva nota
		async function createNoteAndSetContent(title: string, content: string) {
			try {
				const newNote = await app.vault.create(title, content);
				console.log(`Created new note: ${newNote.name}`);
				new Notice("Nuevo documento creado");
				//await app.workspace.activeLeaf?.openFile(newNote);
			} catch (error) {
				console.error(`Error creating new note: ${error}`);
			}
		}

		//--------------------------------------------------------------------------------------
		//Actualizar nota
		async function updateNoteContent( vault: Vault, title: string, content: string): Promise<void> {
			const file = vault.getAbstractFileByPath(`${title}.md`);
			if (file instanceof TFile) {
				await vault.modify(file, content);
				new Notice("Documento actualizado");
			}
		}

		//--------------------------------------------------------------------------------------
		// Filtro dinamico
		async function buscar(valor: string) {
			const response = query().then((dato) => {
				//const name = dato?.find(e=>e === valor)
				const resultados = dato.filter((item) =>
					item.toLowerCase().includes(valor.toLowerCase())
				);
				mostrarResultados(resultados);
				//console.log(resultados)
			});
		}

		// Función que muestra los resultados en la página
		async function mostrarResultados(resultados: string[]) {
			const resultadosDiv = container;
			if (resultadosDiv) {
				container.empty();

				for (const resultado of resultados) {
					const h4 = container.createEl("h4");
					h4.textContent = resultado;
					resultadosDiv.appendChild(h4);
					h4.classList.add("titulos");
					h4.addEventListener("click", () => {
						searchTitle(resultado);
						//new Notice(`Haz hecho clic en el elemento ${resultado}`)
					});
				}
			}
		}

		//--------------------------------------------------------------------------------------
		// Abrir la nota seleccionada

		async function getdocuments(title: string) {
			const note = app.vault
				.getMarkdownFiles()
				.find((file) => file.name === `${title}.md`);
			console.log("ruta: " + note?.path);

			if (note) {
				return getLinkpath(note.path);
			} else {
				return null;
			}
		}
	}
	//--------------------------------------------------------------------------------------

	async onClose() {
		// Nothing to clean up.
	}
}
