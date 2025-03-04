// Visx Import 
import React, { useEffect, useState } from 'react';
import { Axis,  Grid, LineSeries, XYChart, Tooltip, } from "@visx/xychart";
import {lap_data_interface, graph_input_interface} from '../../Commen_Utils';

// CSS Import 
import "./Lap_Time_Line_Page.css"
import { index } from 'd3';



// Interface Defines 
interface graph_domain_interface{ 
  min : number, 
  max : number  
}

interface tooltip_datum_interface{
  key : string, 
  index : number, 
  datum : lap_data_interface
}


// Define utils Function 

function Tooltip_Data_Handler( tooltip_data : any[] ) {
  
  let lap_time_json : {[key : string] : Number} = {}

  tooltip_data.forEach( (sub_element) => {
    lap_time_json[sub_element.key] = sub_element.datum.lap_time ; 
  })


  return Object.entries(lap_time_json)
  .sort((a, b) => Number(a[1]) - Number(b[1]));
}


// Page Export Funciton 
export function  Lap_Time_Line_Graph( { 
  graph_data,
  graph_style,
}: graph_input_interface ) {

  // Add state for tracking visible series
  const [visible_series_state, set_visible_series_state] = useState<Set<string>>(
    new Set(Object.keys(graph_data))
  );
  const [graph_domain_state, set_graph_domain_state] = useState<graph_domain_interface>({min : 0, max : 150})


  useEffect(() => { 
    
    let min_number : number = 10000
    let max_number : number = -10000

    Array.from(visible_series_state).map((key) => {
      
      if ( Object.keys(graph_data).includes(key) ) {

        let lap_time_array = graph_data[key]
        .map((item: lap_data_interface) => item.lap_time)
        .filter((time): time is number => 
          time !== null && 
          time !== undefined && 
          !isNaN(time)
        );
  
        let temp_min_nunber = Math.min(...lap_time_array )
        let temp_max_number = Math.max(...lap_time_array )
  
        if ( temp_min_nunber < min_number ) {
          min_number = temp_min_nunber
        } 
        if ( temp_max_number > max_number ) {
          max_number = temp_max_number
        } ;
      
      }      
    })

    set_graph_domain_state( { min : min_number, max: max_number } )


  }, [visible_series_state, graph_data] )


  // Arrow Function for toggle 
  const toggleSeries = (seriesKey: string) => {
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
    yAccessor: (data : any) => data.lap_time,
    colorAccessor: (key : string) => graph_style[key], // NOTES : Color Accessor got the mapping key as an input, not the data point. [ As in our case 'VER', 'LEC' etc. ]
  };

  // Return the object if it exist 
  return (
    <div className='Graph_Div'>

      <div className='Graph_Container'>

        <XYChart 
          height={500} 
          xScale={{ type: "band", zero: true}} 
          yScale={{ type: "linear", domain: [graph_domain_state.min - 1, graph_domain_state.max + 1], zero:false}}>
          
          <Axis orientation="bottom" label="Lap Number" />
          <Axis orientation="left" label="Lap Time" labelOffset={12}/>
          
          <Grid columns={false} numTicks={10} />
          
          {
            Object.keys(graph_data).map((key) => (
              visible_series_state.has(key) && (
                <LineSeries 
                  className={key}
                  key={key}
                  dataKey={key} 
                  data={graph_data[key]} 
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
              <div className='LTL_Tooltip_Div'>

                {tooltipData && tooltipData.nearestDatum &&  ( 
                
                <>
                  <strong> Lap - {accessors.xAccessor(tooltipData.nearestDatum.datum)} </strong>
                  
                  <div className='LTL_Tooltip_SubDiv'>
                    <div className='LTL_Tooltip_Column_Div'>
                      { Tooltip_Data_Handler(Object.values(tooltipData.datumByKey))
                      .filter((_, index) => index % 2 === 0)
                      .map( ( values: any, index: number ) => 
                        values[1] &&(
                          <div className='LTL_Tooltip_Item_Div capitalize'>
                              {values[0].toLowerCase()} : {values[1]}
                          </div>     
                        )
                      )}
                    </div>

                    <div className='LTL_Tooltip_Column_Div'>

                      { Tooltip_Data_Handler(Object.values(tooltipData.datumByKey))
                      .filter((_, index) => index % 2 === 1)
                      .map( ( values: any, index: number ) => 
                        values[1] &&(
                          <div className='LTL_Tooltip_Item_Div capitalize'>
                            {values[0].toLowerCase()} : {values[1]}
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

      <div className='Graph_Legend'>
        
        <div className='Legend_Column'>

          {Object.keys(graph_data)
            .filter((_, index) => index % 2 === 0)
            .map((driverName) => (

            <div 
              key={driverName}
              className={`Legend_Item ${!visible_series_state.has(driverName) ? 'Legend_Item_Inactive' : ''}`}
              onClick={() => toggleSeries(driverName)}
            >
              <span className='Legend_Color_Box' style={{ backgroundColor: `var(--${driverName}-color)` }}></span>
              <span className='Legend_Driver_Name'>{driverName}</span>
            </div>
            
          ))}

        </div>
        
        <div className='Legend_Column'>
          
          {Object.keys(graph_data)
            .filter((_, index) => index % 2 === 1)
            .map((driverName) => (
      
            <div 
              key={driverName}
              className={`Legend_Item ${!visible_series_state.has(driverName) ? 'Legend_Item_Inactive' : ''}`}
              onClick={() => toggleSeries(driverName)}
            >
              <span className='Legend_Color_Box' style={{ backgroundColor: `var(--${driverName}-color)` }}></span>
              <span className='Legend_Driver_Name'>{driverName}</span>
            </div>

          ))}
        
        </div>
      </div>

    </div>
  );
}

