
// Library Imports
import { Group } from '@visx/group';
import { LegendOrdinal } from '@visx/legend';
import {  BarStackHorizontal } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';

// Project Imports
import { tyre_stint_graph_interface, axis_cosmatics } from '../../../Commen_Utils';

// CSS Import 
import './Tyre_Stint_Page.css'
import { stringify } from 'querystring';
import { color } from 'd3';



// ==== Local interface defines ====
interface TooltipData {
  [key: string]: string
} 


// ==== Arrow Functions ====

// Sorted driver total laps calculater
const driver_lap_counts = ( graph_data : Array<any>) => {

  let driver_laps : { [key:string] : number } = {} ;

  graph_data.forEach( (  stint_json , i) => {

    let race_duration : any = 0
    let driver_stint_info = stint_json[0] ;
    let stint_durations = Object.values( driver_stint_info ) ;

    for (let index = 0; index < stint_durations.length - 1; index++) {
      race_duration += stint_durations[index] ;
    }

    driver_laps[ driver_stint_info.driver_name ] = race_duration
  });

  const sorted_driver_laps : { [key : string] : number } = Object.entries(driver_laps)
    .sort(([,a], [,b]) => a - b)
    .reduce((acc, [key, value]) => ({
      ...acc,
      [key]: value
    }), {});

  return sorted_driver_laps ; 
}

// Descriptive arrow functions
const driver = (data_json : {driver_name : string}) => data_json.driver_name; 
const driver_scale = (data_json  : Array<any> ) => Object.values(data_json)[0].driver_name ;

const keys = (data_json : any ) => { 
  let temp_subdata = Object.keys(data_json) ; 
  temp_subdata.pop() ; 
  return temp_subdata
} ;


// ==== Export Fucntion ====
export function Tyre_Stint_Graph( {
   graph_data,
   color_maps,
  } : tyre_stint_graph_interface) {



// ==== General Defines ==== 

  // Update window size calculation
  let window_width = document.documentElement.clientWidth; 
  let window_height = document.documentElement.clientHeight;

  // Adjust graph dimensions based on screen size
  let graph_width = window_width < 1024 ? window_width * 0.80 : window_width * 0.50 ;
  let graph_height = window_height < 1024 ? window_height * 0.70 : window_height * 0.850;
  
  // Adjust spacing for smaller screens
  let element_space_width = window_width < 1024 ? window_width * 0.1 : window_width * 0.05;
  let element_space_height = window_height < 1024 ? window_height * 0.15 : window_height * 0.1;

  let x_axis_max = graph_width - element_space_width ; 
  let y_axis_max = graph_height - element_space_height ;

  const axis_features = axis_cosmatics(window_width) ;


  const sorted_driver_laps_json = driver_lap_counts(graph_data) ;

  // Graph Scales Defines 

  let x_axis_scale = scaleLinear<number>({
    nice   : true,
    range  : [0, x_axis_max], 
    domain : [0, Math.max(...Object.values( sorted_driver_laps_json ) ) ],
  });

  let y_axis_scale = scaleBand<string>({
    padding : 0.2,
    range   : [y_axis_max, 0],  
    domain  : Object.keys(sorted_driver_laps_json),
  });

  let graph_color_scale = scaleOrdinal<string ,string>({
    range: Object.values(color_maps.graph_color_map),
    domain: Object.keys(color_maps.graph_color_map),
  });


  let legend_color_map : {[key : string] : string} = {}
  
  Object.entries(color_maps.legend_color_map).forEach(([tyre_name, color_vals], i) => {
    legend_color_map[ tyre_name.charAt(0) + tyre_name.slice(1).toLocaleLowerCase() ] = color_vals ;
  });


  let legend_color_scale = scaleOrdinal<string, string>({
    range: Object.values(legend_color_map),
    domain: Object.keys(legend_color_map),
  });

  // Tooltip Defines 
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
  } = useTooltip<TooltipData>();

  const { TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  });


// ==== Local Arrow Functions ====

  // Tooltip Handler
  const Handle_Tooltip = (
    event: React.MouseEvent<SVGRectElement>,
    graph_data: any
  ) => {
    if (event) {

      let tooltip_data_json: { [key: string]: string } = {};

      tooltip_data_json["driver"] = graph_data.bar.data.driver_name ; 

      keys(graph_data.bar.data).forEach( (keys) => {
        tooltip_data_json[ 'd' + keys.split("_")[1] ] = keys.split("_")[0] + "_" + graph_data.bar.data[keys] 
      })

      showTooltip({
        tooltipData: tooltip_data_json,
        tooltipLeft: event.pageX, 
        tooltipTop: event.pageY,  
      });

    }
  };

// ==== Return Section ====
  return (
    <div className='TS_Graph_Div' >
      
      <div className='TS_Graph_Legend_Div'>
        <LegendOrdinal scale={legend_color_scale} direction="row" labelMargin="0 15px 0 0" />
      </div>

      <svg width={graph_width} height={graph_height}>

        <Group left={element_space_width} width={x_axis_max} height={y_axis_max}>


          {
            graph_data.map(
              (driver_stint) => (
                              
              <BarStackHorizontal
                data={driver_stint}
                height={y_axis_max}
                keys={driver_stint.map(keys)[0]}
                
                y={driver}
                xScale={x_axis_scale}
                yScale={y_axis_scale}
                color={graph_color_scale}
                >
    
                  {(barStacks) =>
                  barStacks.map((barStack) =>
                    barStack.bars.map((bar) => (
                      <rect
                        key={`barstack-horizontal-${barStack.index}-${bar.index}`}
                        x={bar.x}
                        y={bar.y}
                        width={bar.width - 3 }
                        height={bar.height}
                        
                        rx={4}  
                        ry={4}  
                        fill={bar.color}
                        
                        onMouseMove={(event) => Handle_Tooltip(event, bar) }
                        opacity={0.9}
                        />
                      )),
                    )
                  }
                </BarStackHorizontal>
              )
            )
            
          }


          
          {/* Graph Axis */}
          <AxisLeft
            hideAxisLine
            hideTicks

            label= "Drivers"
            labelOffset= {48}
            labelProps={axis_features.axis.label_props}

            scale={ y_axis_scale }
            stroke={ axis_features.axis.line_color }
            tickStroke={ axis_features.axis.line_color }
            tickLabelProps={ axis_features.axis.tick_props }
            tickValues = {graph_data.map(driver_scale)}

          />  
        
          <AxisBottom
            label= 'Lap Number'
            labelOffset= { 20 }
            labelProps={axis_features.axis.label_props}

            top={y_axis_max}
            scale={x_axis_scale}
            stroke={ axis_features.axis.line_color }
            tickStroke={ axis_features.axis.line_color }
            tickLabelProps={ axis_features.axis.tick_props }
          />
        
        
        </Group>
      </svg>


      {/* Add tooltip portal */}
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...defaultStyles,
            borderRadius: '5px',
            border: '1px solid #F5F5F5',
            padding: '0.5rem',

            color: '#F5F5F5',
            fontSize: '1.4vh',
            fontFamily: 'Electrolize',
            backdropFilter: 'blur(80px)',
            background: 'rgb(0 0 0/24%)',
          }}
        >

          <div>
            <div className='TS_ToolTip_Title_Div'>{tooltipData.driver}</div>
            <>
            { 
              Object.values(tooltipData).slice(1,).map((values, index)=> (
                <div className= 'TS_ToolTip_Row_Div capitalize' > 
                {values.split('_')[0].toLowerCase()} : 
                {values.split('_')[1]} Laps
                </div>
              ))
            }
            </>
          </div>

        </TooltipInPortal>
      )}

    </div>
  );
}
