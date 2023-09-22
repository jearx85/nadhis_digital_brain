import { ItemView, WorkspaceLeaf, Plugin, Notice, App, Modal, Setting, TFile, TFolder, Vault, TAbstractFile, Workspace  } from "obsidian";
import { queryTitle, queryCategory, queryCategories, semanticQueryContent } from "./funciones";

const axios = require('axios');


export const NADHIS_VIEW = "Nadhis-view";

export class NadhisView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return NADHIS_VIEW;
	}

	getDisplayText() {
		return "Documentos Elasticsearch";
	}

	async onOpen() {
		//Creación de los elementos html
		const container = document.createElement("div");
		const searchBox = document.createElement("input");
		const searchBoxVector = document.createElement("textarea");
		const container2 = document.createElement("select");
		const spinner = document.createElement('spinner');

		searchBoxVector.rows = 4//Text area para busquedas
		searchBoxVector.cols = 40//Text area para busquedas

		//Asignación de clases
		container.className = "my-container";
		searchBox.className = "searchBox";
		searchBoxVector.className = "searchBoxVector";
		container2.className = "Mydropdown";
		spinner.className = "spinner";

		// Agrega el contenedor a la vista de Markdown
		this.containerEl.children[1].appendChild(container2);
		this.containerEl.children[1].appendChild(searchBox);
		this.containerEl.children[1].appendChild(searchBoxVector);
		this.containerEl.children[1].appendChild(spinner);
		this.containerEl.children[1].appendChild(container);

		//consultar(); //Listar los titulos en el view

		//-----------------------------------------------------------------
		//======================================> Caja de busqueda <======================================
		searchBox.type = "text";
		searchBox.placeholder = "Buscar...";

		//======================================> Caja de busqueda por vectores <===========================
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
					
					const data = searchBoxVector.value;
					getEmbeddings(data).then(() => {
						searching.textContent = "";
						searchBoxVector.value = "";
					});
					

				}else{
					event.preventDefault();
					new Notice("El campo de busqueda esta vacío");	
					container.empty();
				}
			}
		});

		//----------------------------------------------------------------
		//======================================> Accion para cuando se escribe en el input <======================================

		const input = searchBox;
		input.addEventListener("input",  function  () {
		const texto = input.value;
		const selectedOption = container2.value;
		buscar(texto, selectedOption);
		container.empty();
		});

		//-----------------------------------------------------------------
		//======================================> Dropdown para categorias <======================================

		const defaultOption = createEl("option");
		defaultOption.textContent = "Seleccione categoría";
		defaultOption.selected = true;
		defaultOption.disabled = true;
		container2.appendChild(defaultOption);

		const opciones = await queryCategory();
		opciones.forEach((option) => {
			const opcion = createEl("option");
			container2.appendChild(opcion);
			opcion.textContent = option;

		});
		//Seleccionar categoria
		container2.addEventListener("change", () => {
			const selectedOption = container2.value;
			//console.log("Seleccion:", selectedOption);
			container.empty();
			consultar(selectedOption);
			defaultOption.textContent = "Seleccione categoría";
		});

		//-----------------------------------------------
		//======================================> Funcion para listar los titulos y tarer el texto <======================================

		async function consultar(categoria: string) {
			const datos = await queryCategories(categoria);
			//console.log(datos);
			datos.forEach((value: any) => {
				const titulos = container.createEl("h4");
				titulos.textContent = value;
				titulos.classList.add("titulos");

				titulos.addEventListener("click", async () => {
					
					
					//console.log(`Haz hecho clic en el elemento ${value}`);
					new Notice("Sincronizando documento");
					searchTitle(value); // Hacer el query en el elemento seleccionado
					defaultOption.textContent = "Seleccione categoría";
					defaultOption.selected = true;
					defaultOption.disabled = true;
					container.empty();
					
				});
			});
		}

		//-----------------------------------------------------------------------------------------
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
								const noteContent = JSON.stringify( results.hits.hits[0]._source.mark, null, 4); // Convierte el resultado de la búsqueda en una cadena JSON formateada
								createNoteAndSetContent(noteTitle, noteContent); //Crea la nota en obsidian
								
								setTimeout(() => {
									openDocuments(titulo);
								
								}, 1000);
								
							} else {
								const updatedContent = JSON.stringify( results.hits.hits[0]._source.mark, null, 4); // Convierte el resultado de la búsqueda en una cadena JSON formateada
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
		//=============================> Validar si ya existe la nota en obsidian <======================================

		async function checkNoteExists( vault: Vault, title: string): Promise<boolean> {
			const file = vault.getAbstractFileByPath(`${title}.md`);
			return file instanceof TAbstractFile;
		}

		//--------------------------------------------------------------------------------------
		//=============================> Crear nueva nota <======================================

		async function createNoteAndSetContent(title: string, content: string) {
			try {
				const newNote = await app.vault.create(title, content);
				//console.log(`Created new note: ${newNote.name}`);
				new Notice("Nuevo documento creado");

			} catch (error) {
				console.error(`Error creating new note: ${error}`);
				new Notice("Error creando nueva nota");
			}
		}

		//--------------------------------------------------------------------------------------
		//=============================> Actualizar nota <======================================

		async function updateNoteContent( vault: Vault, title: string, content: string): Promise<void> {
			const file = vault.getAbstractFileByPath(`${title}.md`);
			if (file instanceof TFile) {
				await vault.modify(file, content);
				new Notice("Documento actualizado");
				//console.log(file)
				
			}
		}

		//--------------------------------------------------------------------------------------
		//=============================> Filtro dinamico <======================================

		async function buscar(valor: string, categoria: string) {
			
			const response = queryCategories(categoria)        //.then((r) => console.log("RESULTADO RESPUESTA:",r));
			.then((dato) => {         
			 	//const name = dato?.find(e=>e === valor)
			 	const resultados = dato.filter((item) =>
			 		item.toLowerCase().includes(valor.toLowerCase())
			 	);
			 	mostrarResultados(resultados);
			 });
		}

		//--------------------------------------------------------------------------------------
		//=============================> Función que muestra los resultados en la página <=============================

		async function mostrarResultados(resultados: string[]) {
			const resultadosDiv = container;
			if (resultadosDiv) {
				container.empty();

				for (const resultado of resultados) {
					const h4 = container.createEl("h4");
					h4.textContent = resultado;
					resultadosDiv.appendChild(h4);
					h4.classList.add("titulos");
					queryCategories(resultado);
					h4.addEventListener("click", () => {
						searchTitle(resultado);
						container.empty();
						searchBoxVector.textContent = "";
						searchBox.value = "";
						defaultOption.selected = true;
						defaultOption.disabled = true;
						defaultOption.textContent = "Seleccione categoría";
						//new Notice(`Haz hecho clic en el elemento ${resultado}`)
					});
				}
			}
		}

		//--------------------------------------------------------------------------------------
		//========> Abrir la nota seleccionada <============

		async function openDocuments(title: string) {
			const note = app.vault.getAbstractFileByPath(`${title}.md`)

			if (note) {
				try{
					//console.log("Abrir nota...")
					app.workspace.openLinkText(note?.path,"",true);
				}catch (error){
					console.error(error);
				}
			} else {
				return null;
			}
		}

		//--------------------------------------------------------------------------------------
		//======================> Funcion para busqueda vectorizada <===========================
		async function getEmbeddings(query: string){
			const url = `http://192.168.50.230:8087/query/${query}`;

			try {
				const respuesta = await axios.get(url);
				spinner.style.display = 'none';
				
				const tamaño_res = respuesta.data.hits.length
                for (let i = 0; i < tamaño_res; i++) {
					const titulo =respuesta.data.hits[i]._source.title
					const res = container.createEl("h4");
					res.classList.add("titulos");
					res.textContent = titulo;
				
					 const vault = app.vault;

					 res.addEventListener("click", () =>{
						 semanticQueryContent(titulo).then((results) => {
 
							 const contenido = results.replaceAll('\n', '<br>');
							//console.log(contenido)
							 const exist_note = checkNoteExists(vault, titulo); // Verificar si la nota ya existe
							 
							 exist_note.then((res: any) => {
							 		if (!res) {
							 			const noteTitle = `${titulo}.md`; // Titulo de la nota
							 			const noteContent = JSON.stringify( contenido, null, 4); // Convierte el resultado de la búsqueda en una cadena JSON formateada
							 			createNoteAndSetContent(noteTitle, noteContent); //Crea la nota en obsidian

										 setTimeout(() => {
											openDocuments(titulo);
										
										}, 500);

							 		} else {
							 			const updatedContent = JSON.stringify( contenido, null, 4); // Convierte el resultado de la búsqueda en una cadena JSON formateada
							 			updateNoteContent( vault, titulo, updatedContent);
							 		}
							 	})
							 	.catch((error: any) => console.log(error));
 
							 container.empty();
							 searchBoxVector.value = "";
						 })
						 .catch((error) => {
							 console.error(`Error searching in Elasticsearch: ${error}`);
						 });
					 });
				}
			} catch (error) {
				console.log(error);
			}	
		}
	}
			
				
				

  
  
	//--------------------------------------------------------------------------------------

	async onClose() {
		// Nothing to clean up.
	}
}
