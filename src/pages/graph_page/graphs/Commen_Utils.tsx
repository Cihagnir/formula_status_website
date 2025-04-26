
/**
 * Commen Items or Utils file for the graph and it's 
 * sub-pages. 
 * 
 */




// Base Url for backend 
export var BASE_URL = "https://formulatics.backend.ssoli.app" ; // "http://localhost:8080"


//// LAP TIME LINE GRAPH 

// Input data interfaces  
export interface graph_style_interface { 
  [key : string] : string ; 
}

export interface lap_duration_data_interface {
  lap_time: number;
  lap_number: number;
}

export interface interval_data_interface {
  lap_number: number;
  is_missing: boolean;
  driver_interval: number;
  stacked_interval : null | number ;
}

export interface position_data_interface{
  driver_pos : number,
  lap_number : number, 
}


export interface lap_duration_graph_data_interface {
  [key : string] : Array<lap_duration_data_interface> ;
}

export interface interval_graph_data_interface {
  [key : string] : Array<interval_data_interface> ;
}

export interface position_graph_data_interface {
  [key : string ] : Array<position_data_interface>
}



export interface lap_duration_graph_input_interface {
  graph_data : lap_duration_graph_data_interface ;
  graph_style : graph_style_interface ;
}

export interface interval_graph_input_interface {
  graph_type : number ;
  graph_style : graph_style_interface ;
  graph_data : interval_graph_data_interface ;
  lap_max_interval_json : {[key : number] : number} ;
}

export interface position_graph_input_interface {
  graph_style : graph_style_interface ;
  graph_data : position_graph_data_interface ;
}




export function Null_Values_Interpolation(data: interval_data_interface[], lap_max_gap_json: { [key : number] : number }) {
  let return_data = [...data];
  
  for (let index = 0; index < return_data.length-1; index++) {
    
    const current_data_json = return_data[index];
    const next_data_json = return_data[index + 1];
    
    const max_interval = lap_max_gap_json[current_data_json.lap_number] ;

    current_data_json.stacked_interval = current_data_json.driver_interval / max_interval ;

    // Check that is the data is consecutive or not 
    if ( ( current_data_json.lap_number  + 1 )  !== next_data_json.lap_number ) {


      const missing_lap_number_number = next_data_json.lap_number - current_data_json.lap_number ;
      const interval_distance_number = next_data_json.driver_interval - current_data_json.driver_interval ;
      const interval_step_number = interval_distance_number / (missing_lap_number_number ) ;

      for (let lap_index = 1 ;lap_index < missing_lap_number_number; lap_index++) {
        
        let driver_interval = current_data_json.driver_interval + (lap_index * interval_step_number)

        return_data.splice(index + lap_index, 0, {
          is_missing: true,
          lap_number: current_data_json.lap_number + lap_index,
          driver_interval: driver_interval,
          stacked_interval : driver_interval / max_interval,
        });

      }
    }
  }

  return return_data;
}


