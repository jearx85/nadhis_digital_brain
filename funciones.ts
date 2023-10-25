//-------------------------------------------------------------------------------------------    
//=============================> Query para listar categorías <=============================
export async function queryCategory(): Promise<any> {
  const url = "http://127.0.0.1:8000/categoria";
			try {
			  const response = await fetch(url, {
				method: 'GET',
			  });
		  
			  if (!response.ok) {
				throw new Error("No se pudo obtener los datos para la consulta");
			  }
			  const data = await response.json(); // Parse JSON from the response
		    //console.log(data)
			  return data;
			} catch (error) {
			  console.log("Error en la conslta:", error.message);
			}
}


//----------------------------------------------------------------
//=============================> buscar doc por categoria asociada <=============================

export async function queryCategories(category: string): Promise<any> {
  const url = `http://127.0.0.1:8000/categorias?category=${category}`;
  try {
    const response = await fetch(url, {
    method: 'GET',
    });
  
    if (!response.ok) {
    throw new Error("No se pudo obtener los datos para la consulta");
    }
    const data = await response.json(); // Parse JSON from the response
    return data;
  } catch (error) {
    console.log("Error en la conslta:", error.message);
  }
}