// Visx Import 
import React, { useEffect, useState } from 'react';

import { curveCardinal } from '@visx/curve';
import { Axis,  Grid, XYChart, Tooltip,AnimatedLineSeries } from "@visx/xychart";
import {interval_data_interface, interval_graph_input_interface, Null_Values_Interpolation} from '../../Commen_Utils';

// CSS Import 
import "./Interval_Line_Page.css" ;

// Interface Defines 
interface graph_domain_interface{ 
  min : number, 
  max : number  
}


// Define utils Function 

function Tooltip_Data_Handler( tooltip_data : any[] ) {
  
  let interval_json : {[key : string] : Number} = {}

  tooltip_data.forEach( (sub_element) => {
    interval_json[sub_element.key] = sub_element.datum.driver_interval ; 
  })


  return Object.entries(interval_json)
  .sort((a, b) => Number(a[1]) - Number(b[1]));
}


// Page Export Funciton 
export function  Interval_Line_Graph( { 
  graph_type, 
  graph_data,
  graph_style,
  lap_max_interval_json,
}: interval_graph_input_interface ) {


  // Add state for tracking visible series
  const [ legend_visibility_state, set_legend_visibility_state ] = useState< number >(1);
  const [ graph_domain_state, set_graph_domain_state ] = useState< graph_domain_interface >({min : 0, max : 150})
  const [ visible_series_state, set_visible_series_state ] = useState< Set<string> >( new Set( Object.keys(graph_data) ) );


  useEffect(() => { 
    
    let min_number : number = 10000;
    let max_number : number = -10000;

    Array.from(visible_series_state).map((key) => {
      
      if ( Object.keys(graph_data).includes(key) ) {

        let interval_array = graph_data[key]
        .map((item: interval_data_interface) => (graph_type) ? (item.driver_interval) : (item.stacked_interval) )
        .filter((time): time is number  => 
          time !== null && 
          time !== undefined && 
          !isNaN(time)
        );
  
        let temp_min_nunber = Math.min(...interval_array );
        let temp_max_number = Math.max(...interval_array );
  
        if ( temp_min_nunber < min_number ) {
          min_number = temp_min_nunber;
        } 
        if ( temp_max_number > max_number ) {
          max_number = temp_max_number;
        } ;
      
      }      
    })

    set_graph_domain_state( { min : min_number, max: max_number } )


  }, [visible_series_state, graph_data, graph_type] );


    // Update window size calculation
    let window_width = Math.min(document.documentElement.clientWidth); 
    let window_height = Math.min(document.documentElement.clientHeight); 
    
    // Adjust graph dimensions based on screen size
    let graph_width = window_width < 1024 ? window_width * 0.85 : window_width * 0.8;
    let graph_height = window_height < 800 ? window_height * 1 : window_height * 0.5;


  // Arrow Functions 
  
  // Arrow Functino for Legend Filters
  const toggle_series = (seriesKey: string) => {
    const new_visible_series = new Set(visible_series_state);
    
    if (new_visible_series.has(seriesKey)) {
      new_visible_series.delete(seriesKey);
    } else {
      new_visible_series.add(seriesKey);
    }
    set_visible_series_state(new_visible_series);
  };

  // Acceser Json for the 'LineSeries' object 
  const accessors = {
    xAccessor: (data : any) => data.lap_number,
    yAccessor: (data : any) => (graph_type) ? (data.driver_interval) : (data.stacked_interval),
    colorAccessor: (key : string) => graph_style[key], // NOTES : Color Accessor got the mapping key as an input, not the data point. [ As in our case 'VER', 'LEC' etc. ]
  };


  const graph_cosmatic = {
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
      opacity : 0.8,
      stroke_color : "#F5F5F5"
    },
  }



  // Return the object if it exist 
  return (
    <div className='IL_Graph_Div'>

      <div className='IL_Graph_Container_Div'>

        <XYChart 
          width={graph_width}
          height={graph_height} 
          xScale={{ type: "band", zero: true}} 
          yScale={{ type: "linear", domain: [graph_domain_state.min - 0.1, graph_domain_state.max + 0.1 ], zero:false}} >
        
          <Axis 
          orientation="bottom" hideAxisLine hideTicks
          label="Lap Number" labelProps={graph_cosmatic.axis.label_props} 
          tickLabelProps={graph_cosmatic.axis.tick_props} />          
          
          <Axis 
          orientation="left" hideAxisLine hideTicks left={60}
          label="Driver Interval" labelOffset={28} labelProps={graph_cosmatic.axis.label_props} 
          tickLabelProps={graph_cosmatic.axis.tick_props} />
          
          <Grid columns={false} numTicks={10} left={60} lineStyle={{opacity: 0.3}} />
          
          {
            Object.keys(graph_data).map((key) => (
              visible_series_state.has(key) && (
                
                <AnimatedLineSeries 
                className={key}
                
                key={key}
                dataKey={key} 
                data={Null_Values_Interpolation( graph_data[key], lap_max_interval_json)} 
                
                opacity={1}
                strokeWidth={3}
                curve={curveCardinal}

                {...accessors}
                />


              )
            ))
          }

          <Tooltip
            snapTooltipToDatumX
            snapTooltipToDatumY
            showVerticalCrosshair
            showSeriesGlyphs
            renderTooltip={({ tooltipData }) => (
              <div className='IL_Tooltip_Div'>

                {tooltipData && tooltipData.nearestDatum &&  ( 
                
                <>
                  <strong> Lap - {accessors.xAccessor(tooltipData.nearestDatum.datum)} </strong>
                  
                  <div className='IL_Tooltip_SubDiv'>

                    <div className='IL_Tooltip_Column_Div'>
                    
                      { Tooltip_Data_Handler(Object.values(tooltipData.datumByKey))
                      .filter((_, index) => index % 2 === 0)
                      .map( ( values: any, index: number ) => 
                        values[1] &&(
                          <div className='IL_Tooltip_Item_Div capitalize'>
                              {values[0].toLowerCase()} : {values[1].toFixed(3)}
                          </div>     
                        )
                      )}
                    
                    </div>

                    <div className='IL_Tooltip_Column_Div'>

                      { Tooltip_Data_Handler(Object.values(tooltipData.datumByKey))
                      .filter((_, index) => index % 2 === 1)
                      .map( ( values: any, index: number ) => 
                        values[1] &&(
                          <div className='IL_Tooltip_Item_Div capitalize'>
                            {values[0].toLowerCase()} : {values[1].toFixed(3)}
                          </div>     
                        ) 
                      )}
                    </div>
                  </div>

                </>
                )}
              </div>
            )}
          />

        </XYChart>

      </div>

      <div className='IL_Graph_Legend_Main_Div'>
        
        <div className='IL_Graph_Legend_Control_Div' onClick={ () => { ( legend_visibility_state ) ? ( set_legend_visibility_state(0) ) : ( set_legend_visibility_state(1) )  } } >
          <span className="IL_Graph_Legend_Control_Text">Legend</span>
        </div>

        <div className={`IL_Graph_Legend_Div ${(!legend_visibility_state) ? 'Legend_Inactive' : '' }`}>
            
          <div className='IL_Legend_Column'>

            {Object.keys(graph_data)
              .filter((_, index) => index % 2 === 0)
              .map((driverName) => (

              <div 
                key={driverName}
                className={`IL_Legend_Item ${!visible_series_state.has(driverName) ? 'Legend_Item_Inactive' : ''}`}
                onClick={() => toggle_series(driverName)}
              >
                <span className='IL_Legend_Driver_Name'>{driverName}</span>
              </div>

            ))}

          </div>
          
          <div className='IL_Legend_Column'>

            {Object.keys(graph_data)
              .filter((_, index) => index % 2 === 1)
              .map((driverName) => (
              
              <div 
                key={driverName}
                className={`IL_Legend_Item ${!visible_series_state.has(driverName) ? 'Legend_Item_Inactive' : ''}`}
                onClick={() => toggle_series(driverName)}
              >
                <span className='IL_Legend_Driver_Name'>{driverName}</span>
              </div>

            ))}

          </div>
      
        </div>


      </div>

    </div>
  );
}

