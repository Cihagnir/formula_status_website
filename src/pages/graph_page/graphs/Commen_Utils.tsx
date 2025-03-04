
/**
 * Commen Items or Utils file for the graph and it's 
 * sub-pages. 
 * 
 */




// Base Url for backend 
export var BASE_URL = "https://formulatics.backend.ssoli.app" ; 


//// LAP TIME LINE GRAPH 

// Input data interfaces  
export interface graph_style_interface { 
  [key : string] : string ; 
}

export interface lap_data_interface {
  lap_number: number;
  lap_time: number;
}

export interface graph_data_interface {
  [key : string] : Array<lap_data_interface> ;
}

export interface graph_input_interface {
  graph_data : graph_data_interface ;
  graph_style : graph_style_interface ;
}




