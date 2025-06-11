
// Library Imports  
import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { GridColumns } from '@visx/grid';
import { scaleLinear } from '@visx/scale';
import { curveCardinal, curveBasisClosed } from '@visx/curve';
import { AxisBottom, AxisLeft } from "@visx/axis";
import React, { useEffect, useState } from 'react';

// Project Imports 
import { 
  lap_compare_graph_data_interface, lap_compare_graph_info_interface,
  quali_lap_compre_graph_input_interface, lap_compare_data_point_interface,
  axis_cosmatics ,
} from '../../../Commen_Utils';


// CSS Import 
import "./Lap_Time_Comp_Page.css" ;


// ==== Arrow Function Defines ====

// Graph Accessers 

const get_y = (datapoint : lap_compare_data_point_interface) => datapoint.y ;
const get_x = (datapoint : lap_compare_data_point_interface) => datapoint.x ;


// Graph Atributers 



// Page Export Funciton 
export function  Lap_Compare_Graph( { 
  graph_data,
  graph_info,
}: quali_lap_compre_graph_input_interface ) {

// =========== UseState Section ===========

  const [focus_driver_state, set_focus_driver_state] = useState< string | null > (null)


// =========== UseEffectSection ===========


// ==== General Defines ==== 

  // Set the bounderies 
  let window_width = document.documentElement.clientWidth;
  let window_height = document.documentElement.clientHeight;

  let graph_width = window_width < 1024 ? window_width * 0.8 : window_width * 0.5;
  let graph_height = window_height < 800 ? window_height * 1: window_height * 0.8;

  let element_space_width =  window_width < 1024 ?  window_width * 0.07 : window_width  * 0.04;
  let element_space_height = window_height * 0.1 ;

  let x_axis_max = graph_width - element_space_width ;
  let y_axis_max = graph_height - element_space_height ;

  let axis_domain_min = graph_info.x_axis.min_val < graph_info.y_axis.min_val  ? graph_info.x_axis.min_val : graph_info.y_axis.min_val ;
  let axis_domain_max = graph_info.x_axis.max_val < graph_info.y_axis.max_val  ? graph_info.y_axis.max_val : graph_info.x_axis.max_val ;



  // Graph Scales Defines 
  let x_axis_scale = scaleLinear<number>({
 
    range : [0, x_axis_max ],
    domain: [graph_info.x_axis.min_val - 800, graph_info.x_axis.max_val + 800]
  })

  let y_axis_scale = scaleLinear<number>({

    range : [y_axis_max, 0 ],
    domain: [graph_info.y_axis.min_val - 800, graph_info.y_axis.max_val + 800],
  })



// ==== Local Arrow Functions ====



// ==== Local Variable Defines ====

let start_point : lap_compare_data_point_interface = graph_data[0].data[0]

let track_cords : Array< lap_compare_data_point_interface > = []; 

graph_data.map( (data_point) => {
  track_cords = track_cords.concat(data_point.data) ;
}) ;

console.log(track_cords);



// ==== Return Section ====

  return (
    <div className='LTC_Graph_Div'>

      

      <div className='LTC_Graph_Container'>

        <svg width={x_axis_max} height={y_axis_max} >

          <Group width={x_axis_max} height={y_axis_max} >

            {
              <Group >
              
              <LinePath 
                  className={`LTC_Line_Paths Track`}
                  data  = {track_cords}
                  x={ ( data : any ) => x_axis_scale( get_x( data ) ) }
                  y={ ( data : any ) => y_axis_scale( get_y( data ) ) }
                  
                  opacity={0.4}
                  strokeWidth={14}
                  stroke  = '#D2D1CD'
                  curve={curveBasisClosed}
                />
              </Group>
            }

            {
              graph_data.map(( data_point ) => {
                return (
                  <Group >
                  
                    <LinePath
                      className={`LTC_Line_Paths ${data_point.driver} `}
                      data  = {data_point.data}
                      x={ ( data : any ) => x_axis_scale( get_x( data ) ) }
                      y={ ( data : any ) => y_axis_scale( get_y( data ) ) }
                      
                      opacity={0.9}
                      strokeWidth={5}
                      curve={curveCardinal}
                      stroke  = { data_point.team_color }
                    />

                  </Group>
                )
              })
            
            }            

            {
              <Group>
                <rect
                  x = {x_axis_scale(start_point.x) - 13}
                  y = {y_axis_scale(start_point.y) - 28}
                  
                  rx={3}
                  ry={3}
                  width={26}
                  height={16}
                  fill='#D2D1CD'
                  opacity={0.3}
                />
                {/* First Row */}
                <rect
                  x = {x_axis_scale(start_point.x) - 10}
                  y = {y_axis_scale(start_point.y) - 20}
                  width={5}
                  height={5}
                  fill='white'
                />
                
                <rect
                  x = {x_axis_scale(start_point.x) - 5}
                  y = {y_axis_scale(start_point.y) - 20}
                  width={5}
                  height={5}
                  fill='black'
                />                
                
                <rect
                  x = {x_axis_scale(start_point.x)}
                  y = {y_axis_scale(start_point.y) - 20}
                  width={5}
                  height={5}
                  fill='white'
                />               

                <rect
                  x = {x_axis_scale(start_point.x) + 5}
                  y = {y_axis_scale(start_point.y) - 20 }
                  width={5}
                  height={5}
                  fill='black'
                />

                {/* Second Row */}
                <rect
                  x = {x_axis_scale(start_point.x) - 10}
                  y = {y_axis_scale(start_point.y) - 25}
                  width={5}
                  height={5}
                  fill='black'
                />
                
                <rect
                  x = {x_axis_scale(start_point.x) - 5}
                  y = {y_axis_scale(start_point.y) - 25}
                  width={5}
                  height={5}
                  fill='white'
                />                
                
                <rect
                  x = {x_axis_scale(start_point.x)}
                  y = {y_axis_scale(start_point.y) - 25}
                  width={5}
                  height={5}
                  fill='black'
                />               

                <rect
                  x = {x_axis_scale(start_point.x) + 5}
                  y = {y_axis_scale(start_point.y) - 25 }
                  width={5}
                  height={5}
                  fill='white'
                />

              </Group>
            }




          </Group>

        </svg>

      </div>

    </div>
  );
}

