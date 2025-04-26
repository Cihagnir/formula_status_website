// Inport Section 
import React, { useState } from "react";
import { Grid } from "@visx/grid";
import { Group } from "@visx/group";
import { SeriesPoint } from "@visx/shape/lib/types";
import { BarStack } from "@visx/shape";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";


// Interface Defines 
interface graph_sub_data_interface {
  driver_name: string,
  lap_duration: number,
  sector_one: number,
  sector_two: number,
  sector_three: number,
  lap_start_time: string,
};


interface lap_duration_graph_data_interface {
  graph_data: Array<graph_sub_data_interface>,
};


// Define the complex function 
function Lap_Time_Collecter({ graph_data }: lap_duration_graph_data_interface) {

  const driver_lap_time: {
    [key: string]: number;
  } = {};

  graph_data.forEach((sub_data) => {
    driver_lap_time[sub_data.driver_name] = sub_data.lap_duration;
  })

  return driver_lap_time;
}



// Define the arrow function 
const get_driver_name = (data: graph_sub_data_interface) => data.driver_name;
const data_keys = ['sector_one', 'sector_two', 'sector_three']


// Object Function 
function Lap_Time_Graph(
  { graph_data }: lap_duration_graph_data_interface
) {

  // Add state for visible sectors
  const [visible_sectors, set_visible_sectors] = useState(new Set(data_keys));
  
  // Graph the window height and widht 
  let window_width = document.documentElement.clientWidth;
  let window_height = document.documentElement.clientHeight;

  // Set the bounderies 
  let graph_width = window_width < 1024 ? window_width * 0.85 : window_width * 0.8;
  let graph_height = window_height < 800 ? window_height * 0.8 : window_height * 0.5;

  let element_space_width = window_width < 1024 ? window_width * 0.05 : window_width * 0.04;
  let element_space_height = window_height < 800 ? window_height * 0.15 : window_height * 0.1;

  let x_axis_max = graph_width - element_space_width;
  let y_axis_max = graph_height - element_space_height;


  // Set the some global varibales 

  let driver_lap_json = Lap_Time_Collecter({ graph_data });
  let sorted_driver_lap_json = Object.fromEntries(
    Object.entries(driver_lap_json)
      .sort(([, a], [, b]) => a - b)
  );


// Define the graph cosmatic varable 
const graph_cosmatic = {
  axis: {
    color: '#F5F5F5',
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

  margin: {
    top: 20,
    right: 0,
    bottom: 0,
    left: 0
  },

  grid : {
    opacity : 0.6,
    stroke_color : "#F5F5F5"
  },
  color_scale : ["#968CE8", "#B4B3EB", "#D9CDF5"]
}


  // Set the grpah scales 
  let y_axis_scale = scaleLinear<number>({
    nice: true,
    range: [y_axis_max, 0],
    domain: [0, Math.max(...Object.values(driver_lap_json))],
  });


  let x_axis_scale = scaleBand<string>({
    padding: 0.4,
    range: [0, x_axis_max],
    domain: Object.keys(sorted_driver_lap_json),

  });

  const color_scale = scaleOrdinal({
    domain: data_keys,
    range: graph_cosmatic.color_scale,
  });

  
  // Add tooltip hooks
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<{
    bar: SeriesPoint<any>;
    key: string;
    index: number;
    height: number;
    width: number;
    x: number;
    y: number;
    color: string;
  }>();

  const { TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  });


  // Define the arrow functions
  const activeKeys = data_keys.filter(key => visible_sectors.has(key));

  const toggleSector = (sector: string) => {
    const new_visible_sectors = new Set(visible_sectors);
    if (new_visible_sectors.has(sector)) {
      new_visible_sectors.delete(sector);
    } else {
      new_visible_sectors.add(sector);
    }
    set_visible_sectors(new_visible_sectors);
  };

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
              numTicksRows={Math.max(...Object.values(driver_lap_json))}
            />

            <AxisBottom
              label="Drivers"
              labelProps={graph_cosmatic.axis.label_props}
              
              top={y_axis_max}
              left={graph_cosmatic.margin.left}
              
              scale={x_axis_scale}
              
              stroke={graph_cosmatic.axis.color}
              tickStroke={graph_cosmatic.axis.color}
              tickValues={graph_data.map(get_driver_name)}
              tickLabelProps={graph_cosmatic.axis.tick_props}
            />

            <AxisLeft
              label="Lap Times as Sec"
              labelOffset={25}
              labelProps={graph_cosmatic.axis.label_props}
              
              scale={y_axis_scale}
              
              numTicks={20}
              stroke={graph_cosmatic.axis.color}
              tickStroke={graph_cosmatic.axis.color}
              tickLabelProps={graph_cosmatic.axis.tick_props}
            />


            <BarStack
              data={graph_data}
              keys={activeKeys}
              color={color_scale}
              x={get_driver_name}
              xScale={x_axis_scale}
              yScale={y_axis_scale}
            >
              {(barStacks) =>
                barStacks.map((barStack) =>
                  barStack.bars.map((bar) => (
                  
                  <g key={`bar-stack-${barStack.index}-${bar.index}`}>
                  
                    <>{console.log(barStacks)}</>
                    <rect
                      className="LTQ_Bar"
                      x={bar.x}
                      y={bar.y}
                      fill={bar.color}
                      height={bar.height}
                      width={bar.width}
                      opacity={1}
                      onMouseLeave={() => hideTooltip()}
                      onMouseMove={(event) => {
                        showTooltip({
                          tooltipData: {
                            ...bar,
                            key: barStack.key,
                          },
                          tooltipTop: event.pageY,
                          tooltipLeft: event.pageX,
                        });
                      }}
                    />
                    <text className="LTQ_Bar_Text"
                      x={bar.x + (bar.width / 2)}
                      y={bar.y + (bar.height / 2)}
                    >
                      { (bar.bar['1'] - bar.bar['0']) .toFixed(2) }
                    </text>
                  </g>
                    
                  ))
                )
              }
            </BarStack>

            {/* Hover Tooltip Code */}
            { tooltipOpen && tooltipData && (

            <TooltipInPortal
              top={tooltipTop}
              left={tooltipLeft}
              style={{
                ...defaultStyles,
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid black',
                backgroundColor: 'white',
              }}
            >

              <div>
                <strong> Driver : </strong> {tooltipData.bar.data.driver_name} <br/>
                <strong> Lap Time : </strong> {tooltipData.bar.data.lap_duration} <br/>

                {
                Object.keys(tooltipData.bar.data).slice(1,-2).reverse().map((data_key,index) => (
                  <div className=" capitalize">
                    <strong> {data_key.replace("_", " ")} </strong> : {tooltipData.bar.data[data_key]} 
                  </div>
                ))
                }      
              </div>

            </TooltipInPortal>
            )}



          </Group>
        </svg>

      </div>

      <div className="LTQ_Legend_Div">
        
        <div>
          <strong>Sectors</strong>
        </div>
        
        {data_keys.map((key) => (
        
        <div className = "capitalize" 
            key={key}
            onClick={() => toggleSector(key)}
            style={{
              gap: '8px',
              display: 'flex',
              padding: '2px 0',
              cursor: 'pointer',
              alignItems: 'center',
              opacity: visible_sectors.has(key) ? 1 : 0.4,
            }}
          >
        
          <div  style={{
            width: '12px',
            height: '12px',
            backgroundColor: color_scale(key),
            borderRadius: '2px'
          }} />

          <span> {key.replace(/_/g, ' ')} </span>

        </div>
        
        ))}
      </div>
    </div>
  )


}



export default Lap_Time_Graph












