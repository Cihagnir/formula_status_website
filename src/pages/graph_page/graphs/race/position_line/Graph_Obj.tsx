
// Library Imports  
import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { GridColumns } from '@visx/grid';
import { scaleLinear } from '@visx/scale';
import { curveCardinal } from '@visx/curve';
import { AxisBottom, AxisLeft } from "@visx/axis";
import React, { useEffect, useState } from 'react';

// Project Imports 
import { 
  position_graph_input_interface, position_data_interface,
  position_graph_data_interface, axis_cosmatics ,
} from '../../../Commen_Utils';


// CSS Import 
import "./Position_Line_Page.css" ;


// ==== Arrow Function Defines ====

// Graph Accessers 

const get_y = (datapoint : position_data_interface) => datapoint.driver_pos ;
const get_x = (datapoint : position_data_interface) => datapoint.lap_number ;
const get_last_data = ( positions : Array<position_data_interface> ) => positions[positions.length - 1].driver_pos ; 


// Graph Atributers 

const get_x_domain = (graph_data : position_graph_data_interface) : number[] => {

  let max_lap_number = 0 ; 
  Object.values( graph_data ).forEach(lap_array => {
    max_lap_number = (max_lap_number < lap_array.length) ? (lap_array.length) : (max_lap_number)
  });

  return [0, max_lap_number] ;
}

const get_tick_vals = (graph_data : position_graph_data_interface) => {

  let tick_vals = [] ; 

  for (let index = 1; index <= Object.keys(graph_data).length; index++) {
    tick_vals.push(index)
  }
  return tick_vals ; 

}


// Page Export Funciton 
export function  Position_Line_Graph( { 
  graph_data,
  color_map,
}: position_graph_input_interface ) {

// =========== UseState Section ===========

  const [focus_driver_state, set_focus_driver_state] = useState< string | null > (null)
  const [opacity_json_state, set_opacity_json_state] = useState< { [key:string] : number} | null>( null ) ;


// =========== UseEffectSection ===========

  useEffect( () => {
    
    let opacity_json : {[key : string] : number} = {}

    if (focus_driver_state){
  
      Object.keys(graph_data).forEach( (driver : string) => {
        opacity_json[driver] = 0.3 ;
      });
      
      opacity_json[focus_driver_state] = 0.9 ;
    
    }else{
      
      Object.keys(graph_data).forEach( (driver : string) => {
        opacity_json[driver] = 0.9 ;
      });
    }
    set_opacity_json_state(opacity_json) ;

  }, [focus_driver_state] )



// ==== General Defines ==== 

  // Set the bounderies 
  let window_width = document.documentElement.clientWidth;
  let window_height = document.documentElement.clientHeight;

  let graph_width = window_width < 1024 ? window_width * 0.9 : window_width * 0.83;
  let graph_height = window_height < 800 ? window_height * 1: window_height * 0.55;

  let element_space_width =  window_width < 1024 ?  window_width * 0.07 : window_width  * 0.04;
  let element_space_height = window_height * 0.1 ;

  let x_axis_max = graph_width - element_space_width ;
  let y_axis_max = graph_height - element_space_height ;


  // Graph Scales Defines 
  let x_axis_scale = scaleLinear<number>({
    nice : false, 
    round : false, 
    range : [50, x_axis_max],
    domain: get_x_domain( graph_data )
  })

  let y_axis_scale = scaleLinear<number>({
    nice : false, 
    round : false, 
    range : [0, y_axis_max],
    domain: [0, Object.keys(graph_data).length + 1],
  })

  // Graph Cosmetic Defines 
  
  let longest_lap_info = 0 ;
  Object.entries(graph_data).map( ([driver, positions], i) => {
    if(positions.length > longest_lap_info) {
      longest_lap_info = positions.length ;
    }
  })
  

  const axis_features = axis_cosmatics(window_width) ; 

  const graph_features = {

    points : {
      fill : '#F5F5F5', 
      stroke : (data_key : string) => color_map[data_key], 
      opacity : (data_key : string) => ( opacity_json_state ) ? ( opacity_json_state![data_key] ) : (0.9) ,
    },

    lines : {
      stroke : (data_key : string) => color_map[data_key], 
      opacity : (data_key : string) => ( opacity_json_state ) ? ( opacity_json_state![data_key] ) : (0.9) ,
    }
  }


// ==== Local Arrow Functions ====

const opacity_state_controler = (input : any) => {

  let target_driver = input.target.className.baseVal.split(" ")[1] ;
  set_focus_driver_state(target_driver) ;
}


const is_rect_rendered = (positions : Array<position_data_interface>) => (positions.length >= ( longest_lap_info - 2 )) ? (true) : (false)



// ==== Return Section ====

  return (
    <div className='PL_Graph_Div'>

      <div className='PL_Graph_Container'>

        <svg width={graph_width} height={graph_height} >

          <Group width={x_axis_max} height={y_axis_max} >

            <GridColumns
              scale= { x_axis_scale }

              width= { x_axis_max }
              height= { y_axis_max } 
              stroke= { axis_features.grid.stroke_color }
              strokeOpacity= {axis_features.grid.opacity }
            />

            <AxisBottom 
            label='Lap Time'
            labelProps={axis_features.axis.label_props}
            labelOffset={20}

            top = {y_axis_max} scale = {x_axis_scale} 
            stroke = {axis_features.axis.line_color}  
            tickStroke = {axis_features.axis.line_color} 
            tickLabelProps = {axis_features.axis.tick_props}
            />  

            <AxisLeft 
            label ='Drivers'
            labelOffset= { 20 }
            labelProps={axis_features.axis.label_props}
            
            tickValues = { get_tick_vals(graph_data) } 
            left = {50} scale = {y_axis_scale} 
            stroke = {axis_features.axis.line_color}  
            tickStroke = {axis_features.axis.line_color} 
            tickLabelProps = {axis_features.axis.tick_props} 
            />


            {
              Object.entries(graph_data).map(([driver, positions], i) => {
                return (
                  <Group key={driver}>
                    
                    <LinePath
                      className={`${driver} PL_Line_Paths`}
                      data  = {positions}
                      curve = {curveCardinal}
                      x={ ( data : any ) => x_axis_scale( get_x( data ) ) }
                      y={ ( data : any ) => y_axis_scale( get_y( data ) ) }
                      stroke  = { graph_features.lines.stroke(driver) }
                      opacity = { graph_features.points.opacity(driver) }
                      strokeWidth={2.4}

                    />

                    { 
                      positions.map(( datapoint, i) => (
                        get_y(datapoint) && <circle
                          className={`${driver} PL_Line_Paths`}
                          r = { 2 }
                          cx= { x_axis_scale( get_x( datapoint ) ) }
                          cy= { y_axis_scale( get_y( datapoint ) ) }
                          
                          fill = { graph_features.points.fill }
                          stroke = { graph_features.points.stroke(driver) }
                          opacity = { graph_features.points.opacity(driver) }
                        />
                      ))
                    }

                    {is_rect_rendered(positions) && (<rect
                      className= {`PL_Legend_Rect ${driver}`}
                      x = { x_axis_max + 12}
                      y = { y_axis_scale( get_last_data(positions)) - ( y_axis_max * 0.3 / 20 ) }

                      width= { 55 }
                      height={ 16 }
                      fill = {color_map[driver]}
                      fillOpacity={0.3}
                      stroke = {color_map[driver]}
                      strokeOpacity={0.5}
                      onMouseOver = {opacity_state_controler}
                      onMouseLeave = {() => set_focus_driver_state(null)}
                    />)}
                    
                    {is_rect_rendered(positions) && (<text 
                    className={`PL_Legend_Rect_Text ${driver}`}
                    x = { x_axis_max + 22}
                    y = { y_axis_scale( get_last_data(positions)) + ( y_axis_max * 0.3 / 20 ) }
                    onMouseOver = {opacity_state_controler}
                    onMouseLeave = {() => set_focus_driver_state(null)}
                    >
                      {driver}
                    </text>)}


                  </Group>
                )
              })
            }

          </Group>

        </svg>


      </div>



    </div>
  );
}

