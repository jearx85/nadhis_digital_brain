import { ItemView, WorkspaceLeaf, Plugin, Notice, App, Modal, Setting, TFile, TFolder, Vault, TAbstractFile, Workspace } from "obsidian";
import { queryCategory, queryCategories } from "./funciones";

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
		
		crearCarpetas();
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
		//=========================== Mensaje de bienvenida =================================

		var userName:any = process.env.USERNAME;//Obtener nombre de usuario del sistema operativo
    
		searchBoxVector.hide();
		container2.hide();

		const user = container.createEl("h4");
		user.className = "titulos";
		user.textContent = `Bienvenido ${userName}`;

		setTimeout(() => {
			user.textContent = ""
			container.show();
			searchBoxVector.show();
			container2.show();
		},3000)

		//=======================================================================================

		//======================================> Caja de busqueda <======================================
		searchBox.type = "text";
		searchBox.placeholder = "Buscar...";

		//======================================> Caja de busqueda por vectores <===========================
		searchBoxVector.placeholder = "¿Cuéntame de qué habla el documento que quieres encontrar?";
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
					setTimeout(() => {
						getEmbeddings(data).then((res) => {
							if (res == 200){
								searching.textContent = "";
								searchBoxVector.value = "";
								searchBoxVector.textContent = "";
								searchBox.value = "";
								defaultOption.selected = true;
								defaultOption.disabled = true;
								defaultOption.textContent = "Seleccione categoría";
								searchBox.hide();
							}else{
								spinner.style.display = 'none';
								searchBoxVector.value = "";
								searching.textContent = "Algo salió mal, intenta con más palabras";
								searchBox.hide();
								setTimeout(() => {
									searching.textContent = "";
									searchBoxVector.value = "";
									
								},4000)
							}
						});
					},1500)
						
					
					
					

				}else{
					event.preventDefault();
					new Notice("El campo de busqueda esta vacío");	
					container.empty();
					searchBoxVector.value = "";
					searchBoxVector.textContent = "";
					searchBox.value = "";
					defaultOption.selected = true;
					defaultOption.disabled = true;
					defaultOption.textContent = "Seleccione categoría";
					searchBox.hide();
				}
			}
		});

		//----------------------------------------------------------------
		//======================================> Accion para cuando se escribe en el input <======================================
		searchBox.hide();
		const input = searchBox;
		input.addEventListener("input",  function  () {
			const texto = input.value;
			if(texto == ""){
				container.empty();
			}
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
			searchBox.style.display = 'block';
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
					searchBox.hide();
					listarDocsVault(value);
					
					//console.log(`Haz hecho clic en el elemento ${value}`);
					new Notice("Sincronizando documento");
					//searchTitle(value); // Hacer el query en el elemento seleccionado
					defaultOption.textContent = "Seleccione categoría";
					defaultOption.selected = true;
					defaultOption.disabled = true;
					container.empty();
					
				});
			});
		}

		//-----------------------------------------------------------------------------------------

		//=============================> Validar si ya existe la nota en obsidian <======================================
		async function checkNoteExists( vault: Vault, path: string): Promise<boolean> {
			const file = vault.getAbstractFileByPath(path);
			return file instanceof TAbstractFile;
		}

		//--------------------------------------------------------------------------------------
		//=============================> Crear nueva nota <======================================

		async function createNoteAndSetContent(title: string, content: string) {
			try {
				const newNote = await app.vault.create(`${title}.md`, content);
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
			const file = vault.getAbstractFileByPath(title);
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
						searchBox.hide();
						listarDocsVault(resultado);
						//searchTitle(resultado);
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
			const note = app.vault.getAbstractFileByPath(title)

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
				
					 res.addEventListener("click", () =>{
						searchBox.hide();
						listarDocsVault(titulo);
						container.empty();						
					 });
				}
				return respuesta.status
			} catch (error) {
				console.log(error.message);
			}
		}
//--------------------------------------------------------------------------------------------
//======================== Listar todos los documentos del vault =================================
	async function listarDocsVault(titulo: string) {
		const selected = titulo//Obtiene el titulo al que le dimos click
			const files = app.vault.getFiles()//Obtener todos los documentos del vault
			let titulos = [];
			let rutas = [];
		
			for (let i = 0; i < files.length; i++) {
				titulos.push(files[i].basename)
				rutas.push(files[i].path)
				if(!titulos.includes(selected)){
					titulos.splice(0, 0, selected)//Agregar el elemento  seleccionado en la primera posición
				}

				if(files[i].path.includes(titulo)){
					const ruta = files[i].path;

					//Enviar la lista de títulos como un arreglo
					axios.post("http://192.168.50.230:8087/relacion/", titulos).then(async(response: any) => {
						const vault = app.vault;
						if	(response.status == 201){
								const noteTitle = ruta; // Titulo de la nota
								const noteContent = response.data;
								await updateNoteContent( vault, noteTitle, noteContent);
								await validarNotaAbierta(noteTitle);
								//await openDocuments(noteTitle);//espera a que la nota se cree y luego la abre	
						}
					}).catch((error: any) => {console.log(error);});
				}
			
			}

			const ruta: any = rutas.find((item) => item.includes(titulo));
			if(!ruta){
				axios.post("http://192.168.50.230:8087/relacion/", titulos).then(async(response: any) => {
				const vault = app.vault;
					if	(response.status == 201){
			
						const noteTitle = titulo; // Titulo de la nota
						const noteContent = response.data; // Convierte el resultado de la búsqueda en una cadena JSON formateada
						await createNoteAndSetContent(noteTitle, noteContent); //Crea la nota en obsidian

						const exist_note = checkNoteExists(vault, titulo); // Verificar si la nota ya existe
						exist_note.then(async(res: any) => {
							if (!res) {
									await openDocuments(`${titulo}.md`);//espera a que la nota se cree y luego la abre	
								} 
							})
							.catch((error: any) => console.log(error));
					}
				}).catch((error: any) => {console.log(error);});	
			}	
	}

//================================ Crear folder por cada categoria ==========================================		
		async function crearCarpetas() {
			const categories = await queryCategory();

			for (const cat of categories) {
					app.vault.createFolder(cat);
					if(!cat){
						new Notice(`Carpeta ${ cat } creada`)
					}
				
			}
		}
//=============================== Validar si la nota ya esta abirta en obsidian ===============================
		async function validarNotaAbierta(titulo: string){
			const doc = app.workspace.getActiveFile()
			const nota = doc?.path
			if(titulo != nota){
				openDocuments(titulo);
			}
		}

 	}	

// 	//--------------------------------------------------------------------------------------

	async onClose() {
		// Nothing to clean up.
	}
}
