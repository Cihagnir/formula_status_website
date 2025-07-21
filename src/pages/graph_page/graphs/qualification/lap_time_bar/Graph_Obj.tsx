// Inport Section 
import React, { useState } from "react";
import { Bar, getPoint } from '@visx/shape';
import { Grid } from "@visx/grid";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";


// Project Imoprts
import {  axis_cosmatics, quali_grpah_input_interface,  } from "../../../Commen_Utils";



// Export Functions 
function Quali_Lap_Time_Graph(
  { graph_data, selected_section, graph_type, color_map }: quali_grpah_input_interface
) {


// ==== Local Arrow Funcstion ====

  // Descriptive Funcitons

  const graph_data_fixer = () => {
    
    let return_data : { [key : string] : number} = {} ;


    const driver_names = Object.keys(graph_data[selected_section])
    const pole_lap_duration = graph_data[selected_section][driver_names[0] ] ;

    Object.entries(graph_data[selected_section]).forEach( ([driver_names, lap_duration], i) => {
      
      return_data[driver_names] = lap_duration - pole_lap_duration ; 
    });

    return return_data ;
  }


// ==== General Defines ==== 

  let selected_data = graph_data[selected_section]

  if (graph_type) {
    selected_data = graph_data_fixer() ;
  }


  // Graph the window height and widht 
  let window_width = document.documentElement.clientWidth;
  let window_height = document.documentElement.clientHeight;

  // Graph Size Calculation
  let graph_width = window_width < 1024 ? window_width * 0.85 : window_width * 0.8;
  let graph_height = window_height < 800 ? window_height * 0.8 : window_height * 0.5;

  let element_space_width = window_width < 1024 ? window_width * 0.05 : window_width * 0.04;
  let element_space_height = window_height < 800 ? window_height * 0.15 : window_height * 0.1;

  let x_axis_max = graph_width - element_space_width;
  let y_axis_max = graph_height - element_space_height;

  let graph_cosmatic = axis_cosmatics(window_width) ;
  
  graph_cosmatic['margin'] = {
    top: 20,
    right: 0,
    bottom: 0,
    left: 0
  }

  // Set the grpah scales 
  let y_axis_scale = scaleLinear<number>({
    nice: true,
    range: [y_axis_max, 0],
    domain: [0, Math.max(...Object.values( selected_data )) ] ,
  });


  let x_axis_scale = scaleBand<string>({
    padding: 0.4,
    range: [0, x_axis_max],
    domain: Object.keys(selected_data),

  });





// ======= Return Function =======
  return (
    <div className='LTQ_Graph_Div'>

      <div className="LTQ_Graph_Container_Div" >

        <svg width={graph_width} height={graph_height}>
        
          <Group top={graph_cosmatic.margin.top} left={element_space_width}>

            <Grid
              xScale={x_axis_scale}
              yScale={y_axis_scale}
              width={x_axis_max}
              height={y_axis_max}
              stroke={graph_cosmatic.grid.stroke_color}
              strokeOpacity={graph_cosmatic.grid.opacity}
              numTicksColumns={Object.keys(graph_data).length}
              numTicksRows={20}
            />

            <Grid
              xScale={x_axis_scale}
              yScale={y_axis_scale}
              width={x_axis_max}
              height={y_axis_max}
              stroke={graph_cosmatic.grid.stroke_color}
              strokeOpacity={graph_cosmatic.grid.opacity - 0.4}
              numTicksRows={Math.max(...Object.values(selected_data))}
            />

            <AxisBottom
              label="Drivers"
              labelProps={graph_cosmatic.axis.label_props}
              labelOffset={window_height * 0.02}
              
              top={y_axis_max}
              left={graph_cosmatic.margin.left}
              
              scale={x_axis_scale}
              
              stroke={graph_cosmatic.axis.color}
              tickStroke={graph_cosmatic.axis.color}
              tickValues={Object.keys(selected_data)}
              tickLabelProps={graph_cosmatic.axis.tick_props}
            />

            <AxisLeft
              label={ (graph_type) ? ("Pole Gap ( as Sec )") : ("Lap Times ( as Sec )")}
              labelOffset={window_width * 0.025}
              labelProps={graph_cosmatic.axis.label_props}
              
              scale={y_axis_scale}
              
              numTicks={20}
              stroke={graph_cosmatic.axis.color}
              tickStroke={graph_cosmatic.axis.color}
              tickLabelProps={graph_cosmatic.axis.tick_props}
            />

            {
              Object.keys(selected_data).map( (data_key) => {
                
                let driver_lap_duration =selected_data[data_key] ;

                return (
                
                (<g>
                  
                  <Bar
                  className= "LTQ_Bars"
                  x = { x_axis_scale(data_key) }
                  y = { y_axis_scale( driver_lap_duration ) }
                  width= { x_axis_scale.bandwidth() }
                  height= { y_axis_max - y_axis_scale( driver_lap_duration )}
                  fill= { color_map[data_key] }


                                    
                  />
                
                  <text
                  className= "LTQ_Bars_Text"
                  x = { x_axis_scale(data_key)! + ( x_axis_scale.bandwidth() / 2 ) }
                  y = { (graph_type) ?  ( y_axis_scale( driver_lap_duration ) -10 ) : (y_axis_max / 2) }

                  fill= { (graph_type) ? (color_map[data_key]) : ('#F5F5F5') }
                  writingMode= { (graph_type) ? ('') : ('vertical-rl') }

                  
                  
                  >
                    {driver_lap_duration.toFixed(3)}
 
                  </text>
                  
                </g>)
              
              
              )
                
              })
            }



          </Group>
        </svg>

      </div>


    </div>
  )


}



export default Quali_Lap_Time_Graph












