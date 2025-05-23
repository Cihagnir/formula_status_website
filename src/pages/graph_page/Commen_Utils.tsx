
/**
 * Commen Items or Utils file for the graph and it's 
 * sub-pages. 
 * 
 */


// Base Url for backend 
export var BASE_URL =   "https://formulatics.backend.ssoli.app" ; // "http://56.228.2.184" ;  // "http://192.168.1.148" ;


// ===== Data Interfaces   =====


export interface graph_style_interface { 
  [key : string] : string ; 
};


// Lap Duration Interface 

export interface lap_duration_data_interface {
  lap_number: number;
  lap_duration: number;
  lap_accurcy : number ;
};

export interface lap_duration_graph_data_interface {
  [key : string] : Array<lap_duration_data_interface> ;
};

export interface lap_duration_graph_input_interface {
  graph_data : lap_duration_graph_data_interface ;
  color_map : graph_style_interface ;
};


// Interval Data Interfaces 

export interface interval_data_interface {
  lap_number: number;
  is_missing: boolean;
  interval_leader: number;
  stacked_interval : null | number ;
};

export interface interval_graph_data_interface {
  [key : string] : Array<interval_data_interface> ;
};

export interface interval_graph_input_interface {
  graph_type : number ;
  color_map : graph_style_interface ;
  graph_data : interval_graph_data_interface ;
  lap_max_interval_json : {[key : number] : number} ;
};


// Position Data Interfaces

export interface position_data_interface{
  driver_pos : number,
  lap_number : number, 
};

export interface position_graph_data_interface {
  [key : string ] : Array<position_data_interface>
};

export interface position_graph_input_interface {
  color_map : graph_style_interface ;
  graph_data : position_graph_data_interface ;
};


// Lap Duration Distrubation Interfaces 

export interface lap_dstrb_in_data_interface {
  value: number;
  count: number;
};

export interface lap_dstrb_graph_data_interface {
  violin_plot  : Array<lap_dstrb_in_data_interface>,
  box_plot : {
    x : string, 
    color: string,
    min : number ,
    max : number, 
    median : number,
    third_quart  : number, 
    first_quart  : number,
    outliers : Array<number>, 
  },
};

export interface lap_dstrb_graph_input_interface {
  graph_data : Array<lap_dstrb_graph_data_interface>
};


// Tyre Stint Interfaces 


export interface tyre_stint_graph_interface {
  graph_data : Array<any>,
  color_maps : {[keys : string] : { [key : string] : string }},
}




// Qualification Lap Duration Interfaces 

export interface quali_graph_data_interface {
  graph_data : {[key : string] : { [key : string] : number }}
  color_map : {[keys : string] : string },
};


export interface quali_grpah_input_interface {
  graph_type : number,
  selected_section : string,
  graph_data : {[key : string] : { [key : string] : number }},
  color_map : {[keys : string] : string}, 
};


// ==== Utils Functions ====


export const axis_cosmatics = ( window_width : number ) : {[key:string ] : any} => {
  return {    
    axis: {
      line_color: '#F5F5F5',
      label_props: {
        fill: '#F5F5F5',
        fontSize: window_width < 1024 ? 12 : 18,
        fontFamily: 'Electrolize',
      },
      tick_props : {
        fill :'#F5F5F5',
        color : '#F5F5F5',
        fontSize : window_width < 1024 ? 9 : 13,
      },
    },

    grid : {
      opacity : 0.2,
      stroke_color : "#F5F5F5"
    },
  }
};








export function Null_Values_Interpolation(data: interval_data_interface[], lap_max_gap_json: { [key : number] : number }) {
  let return_data = [...data];
  
  for (let index = 0; index < return_data.length-1; index++) {
    
    const current_data_json = return_data[index];
    const next_data_json = return_data[index + 1];
    
    const max_interval = lap_max_gap_json[current_data_json.lap_number] ;

    current_data_json.stacked_interval = current_data_json.interval_leader / max_interval ;

    // Check that is the data is consecutive or not 
    if ( ( current_data_json.lap_number  + 1 )  !== next_data_json.lap_number ) {


      const missing_lap_number_number = next_data_json.lap_number - current_data_json.lap_number ;
      const interval_distance_number = next_data_json.interval_leader - current_data_json.interval_leader ;
      const interval_step_number = interval_distance_number / (missing_lap_number_number ) ;

      for (let lap_index = 1 ;lap_index < missing_lap_number_number; lap_index++) {
        
        let interval_leader = current_data_json.interval_leader + (lap_index * interval_step_number)

        return_data.splice(index + lap_index, 0, {
          is_missing: true,
          lap_number: current_data_json.lap_number + lap_index,
          interval_leader: interval_leader,
          stacked_interval : interval_leader / max_interval,
        });

      }
    }
  }

  return return_data;
}


