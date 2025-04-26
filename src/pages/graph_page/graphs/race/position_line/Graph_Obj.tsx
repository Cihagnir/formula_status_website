// Visx Import 
import React, { useEffect, useState } from 'react';
import { Axis,  Grid, XYChart, LineSeries, GlyphSeries} from "@visx/xychart";
import { position_graph_input_interface, } from '../../Commen_Utils';

// CSS Import 
import "./Position_Line_Page.css" ;

// Define utils Function 

function Tooltip_Data_Handler( tooltip_data : any[] ) {
  
  let driver_pos_json : {[key : string] : Number} = {}

  tooltip_data.forEach( (sub_element) => {
    driver_pos_json[sub_element.key] = sub_element.datum.driver_pos ; 
  })


  return Object.entries(driver_pos_json)
  .sort((a, b) => Number(a[1]) - Number(b[1]));
}


// Page Export Funciton 
export function  Position_Line_Graph( { 
  graph_data,
  graph_style,
}: position_graph_input_interface ) {

    // Update window size calculation
    let window_width = Math.min(document.documentElement.clientWidth); 
    let window_height = Math.min(document.documentElement.clientHeight); 
    
    // Adjust graph dimensions based on screen size
    let graph_width = window_width < 1024 ? window_width * 0.90 : window_width * 0.80;
    let graph_height = window_height < 800 ? window_height * 1 : window_height * 0.5;



  // Acceser Json for the 'LineSeries' object 
  const line_series_accessors = {
    xAccessor: (data : any) => data.lap_number,
    yAccessor: (data : any) => data.driver_pos,
    colorAccessor: (key : string) => graph_style[key], // NOTES : Color Accessor got the mapping key as an input, not the data point. [ As in our case 'VER', 'LEC' etc. ]
  };

  const glyph_series_accessors = {
    xAccessor: (data : any) => data.lap_number,
    yAccessor: (data : any) => data.driver_pos,
    glyphColorAcc : (data : any, index :any) => '#F5F5F5'
  };



  const graph_cosmatic = {
    axis: {
      line_color: '#000000',
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
      opacity : 0.6,
      stroke_color : "#000000"
    },
  }

  // Return the object if it exist 
  return (
    <div className='PL_Graph_Div'>

      <div className='PL_Graph_Container'>

        <XYChart 
          width={graph_width}
          height={graph_height} 
          xScale={ { type: "band", zero: true } } 
          yScale={ { type: "linear", domain: [ 0.5, 20.5 ], zero:false, reverse:true } }
           >
          
          <Grid numTicks={20} columns={false} lineStyle={{opacity: 0.6, }} strokeWidth={0.4}   />

          <Axis orientation="bottom"  hideAxisLine hideTicks
          label="Lap Number" labelProps={graph_cosmatic.axis.label_props}
          tickLabelProps={graph_cosmatic.axis.tick_props} />
          
          <Axis orientation="left" hideAxisLine hideTicks
          label="Driver Position" labelOffset={30} labelProps={graph_cosmatic.axis.label_props}
          tickLabelProps={graph_cosmatic.axis.tick_props} numTicks={20}/>
          
          {
            Object.keys(graph_data).map((key) => (
              
              <LineSeries 
              className={key}
              
              key={key}
              dataKey={key} 
              data={graph_data[key]} 
              
              opacity={1}
              strokeWidth={6}

              {...line_series_accessors}
              />
            ))
          }

          {
            Object.keys(graph_data).map((key) => (
              
              <GlyphSeries 

              dataKey={key} 
              data={graph_data[key]} 
              
              xAccessor={glyph_series_accessors.xAccessor}
              yAccessor={glyph_series_accessors.yAccessor}
              colorAccessor={glyph_series_accessors.glyphColorAcc}

              />
            ))
          }




        </XYChart>

      </div>


    </div>
  );
}

