// Visx Import 
import { Axis,  Grid, LineSeries, XYChart, Tooltip, } from "@visx/xychart";

import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';

// CSS Import 
import "./Lap_Time_Line_Page.css"


// Interface Defines 

interface graph_data_interface {
  graph_data : any,
  graph_domain : { min : number, max : number  }
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
  graph_domain
}: graph_data_interface ) {

  const accessors = {
    xAccessor: (data : any) => data.lap_number,
    yAccessor: (data : any) => data.lap_time,
  };

  console.log(graph_domain.min); 
  console.log(graph_domain.max); 


  // Return the object if it exist 
  return (
    <div className= 'Graph_Div' >
      <XYChart 
      height={500} 
      xScale={{ type: "band" , zero: true}} 
      yScale={{ type: "linear", domain: [graph_domain.min, graph_domain.max, ], zero:false} }>
      
        <Axis orientation="bottom"  />
        <Axis orientation="left" />
        
        <Grid columns={false} numTicks={10} />
        {
          Object.keys(graph_data).map((key) => (
            <LineSeries 
              key={key}
              dataKey={key} 
              data={graph_data[key]} 
              {...accessors}
            />
          ))
        }
        <Tooltip
          snapTooltipToDatumX
          snapTooltipToDatumY
          showVerticalCrosshair
          showSeriesGlyphs
          renderTooltip={({ tooltipData, colorScale }) => (
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
  );
}

