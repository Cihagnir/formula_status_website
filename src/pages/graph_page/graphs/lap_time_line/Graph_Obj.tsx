// Visx Import 
import React, { useEffect, useState } from 'react';
import { Axis,  Grid, LineSeries, XYChart, Tooltip, } from "@visx/xychart";

// CSS Import 
import "./Lap_Time_Line_Page.css"



// Interface Defines 

interface lap_data_interface {
  lap_number: number;
  lap_time: number;
}

interface graph_data_interface {
  [key : string] : Array<lap_data_interface> ;
}

interface graph_domain_interface{ 
  min : number, 
  max : number  
}

interface graph_input_interface {
  graph_data : graph_data_interface ;
}

// Arrow Functions

const graph_cosmatic = {
  violin_plot : {
    violin_color : '#000000',
    pattern_line_color : '#000000', 
    opacity : 0.3 ,

  },
  box_plot : {
    fill_color : '#000000', 
    fill_opacity : 0.1 ,
    stroke_color : '#CCCCCC',
    stroke_width : 1, 
  },
  axis : {
    line_color : '#000000',
    text_prop : {
      fill : '#000000',
      fontSize : 13,
      fontFamily : 'Electrolize',
    }
  }
}



 

export function  Lap_Time_Line_Graph( { 
  graph_data,
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
      
    })

    set_graph_domain_state( { min : min_number, max: max_number } )

    console.log(`Min val : ${min_number}, Max val : ${max_number}`)

  }, [visible_series_state, graph_data] )

  const toggleSeries = (seriesKey: string) => {
    const new_visible_series = new Set(visible_series_state);
    
    if (new_visible_series.has(seriesKey)) {
      new_visible_series.delete(seriesKey);
    } else {
      new_visible_series.add(seriesKey);
    }
    set_visible_series_state(new_visible_series);
  };

  const accessors = {
    xAccessor: (data : any) => data.lap_number,
    yAccessor: (data : any) => data.lap_time,
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
              <div>
                {tooltipData && tooltipData.nearestDatum &&(
                    <>
                      <div>
                        {tooltipData.nearestDatum.key}
                      </div>
                      {accessors.xAccessor(tooltipData.nearestDatum.datum)}
                      {', '}
                      {accessors.yAccessor(tooltipData.nearestDatum.datum)}
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

