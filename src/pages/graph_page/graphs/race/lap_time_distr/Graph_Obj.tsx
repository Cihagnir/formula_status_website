// Visx Import 
import { Group } from '@visx/group';
import { GridRows } from "@visx/grid";
import { PatternLines } from '@visx/pattern';
import { AxisBottom, AxisLeft } from "@visx/axis";
import { ViolinPlot, BoxPlot } from '@visx/stats';
import { scaleBand, scaleLinear } from '@visx/scale';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';

// CSS Import 
import "./Lap_Time_Distr_Page.css"


// Interface Defines 
interface bin_data_interface {
  value: number;
  count: number;
}

export interface lap_duration_graph_data_interface {
  violin_plot  : Array<bin_data_interface>,
  box_plot : {
    x : string, 
    color: string,
    min : number ,
    max : number, 
    median : number,
    first_quartile  : number, 
    second_quartile : number,
    third_quartile  : number,
    outliers : Array<number>, 
  },
}

interface TooltipData {
  driver: string;
  median: number;
  min: number;
  max: number;
}

interface lap_time_graph_interface {
  graph_data : Array<lap_duration_graph_data_interface>
}


// Arrow Functions
const accesser = {
 x : (data: lap_duration_graph_data_interface) => data.box_plot.x ,
 min : (data: lap_duration_graph_data_interface) => data.box_plot.min ,
 max : (data: lap_duration_graph_data_interface) => data.box_plot.max ,
 median : (data: lap_duration_graph_data_interface) => data.box_plot.median ,
 outliers : (data: lap_duration_graph_data_interface) => data.box_plot.outliers ,
 firstQuartile : (data: lap_duration_graph_data_interface) => data.box_plot.first_quartile ,
 thirdQuartile : (data: lap_duration_graph_data_interface) => data.box_plot.third_quartile ,

}


export function  Lap_Time_Graph( { 
  graph_data,
}: lap_time_graph_interface) {

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<TooltipData>();

  const { TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  });

  let values = graph_data.reduce( (allValues, { box_plot }) => {
    allValues.push(box_plot.min, box_plot.max);
    return allValues;
  }, [] as number[]);

  let window_width = document.documentElement.clientWidth;
  let window_height = document.documentElement.clientHeight;

  // Set the bounderies 

  let graph_width = window_width < 1024 ? window_width * 0.85 : window_width * 0.8;
  let graph_height = window_height < 800 ? window_height * 1 : window_height * 0.5;

  let element_space_width = window_width  * 0.05;
  let element_space_height = window_height * 0.1 ;

  let x_axis_max = graph_width - element_space_width ;
  let y_axis_max = graph_height - element_space_height ;

  let minYValue = Math.min(...values);
  let maxYValue = Math.max(...values);



  // Set the Scales for the axis
  let x_axis_scale = scaleBand<string>({
    range: [0, x_axis_max],
    domain: graph_data.map(accesser.x),
    padding: 0.4,
  });

  let y_axis_scale = scaleLinear<number>({
    nice : false,
    round: false,
    range: [y_axis_max, 0],
    domain: [minYValue - 1, maxYValue + 1],
  });


  let constrainedWidth = Math.min(60, x_axis_scale.bandwidth());  // We put it max limit for what scale set to make it more usefull 

  let label_values : string[] = [] ;

  graph_data.map( data  => {
    if (!( accesser.x(data) in label_values )) {
      label_values.push( accesser.x(data) )
    }
  })

  // Add tooltip handler
  const handleTooltip = (
    event: React.MouseEvent<SVGRectElement>,
    data: lap_duration_graph_data_interface
  ) => {
    if (event) {
      showTooltip({
        tooltipData: {
          driver: accesser.x(data),
          median: accesser.median(data) ,
          min: accesser.min(data),
          max: accesser.max(data),
        },
        tooltipLeft: event.pageX, // Add small offset from cursor
        tooltipTop: event.pageY,  // Lift slightly above cursor
      });
    }
  };

  const graph_cosmatic = {
    violin_plot : {
      violin_color : '#F5F5F5',
      pattern_line_color : '#F5F5F5', 
      opacity : 0.6 ,
  
    },
    box_plot : {
      fill_color : '#F5F5F5', 
      fill_opacity : 0   ,
      stroke_color : '#CCCCCC',
      stroke_width : 1, 
    },
    axis : {
      line_color : '#F5F5F5',
      tick_props : {
        fill : '#F5F5F5',
        fontSize : window_width < 1024 ? 10 : 14,
        fontFamily : 'Electrolize',
      },
      label_props: {
        fill: '#F5F5F5',
        fontSize: window_width < 1024 ? 12 : 18,
        fontFamily: 'Electrolize',
      },
    },
    grid : {
      opacity : 0.2,
      stroke_color : "#F5F5F5"
    },
  }

  // Return the object if it exist 
  return (
    <div className= 'LTD_Graph_Div' >

      <svg width={graph_width} height={graph_height}>
      
        <PatternLines
          id="hViolinLines"
          width = {3}
          height = {3}
          strokeWidth = {1}
          orientation = {['horizontal']}
          stroke = {graph_cosmatic.violin_plot.pattern_line_color}
        />
      
        <Group width={x_axis_max} height={y_axis_max} left={element_space_width} >

          <GridRows
            scale={y_axis_scale}
            width={x_axis_max}
            height={y_axis_max}
            stroke={graph_cosmatic.grid.stroke_color}
            strokeOpacity={graph_cosmatic.grid.opacity}
          />

          {graph_data.map((data: lap_duration_graph_data_interface, i) => (
            
            <g key={i}>               

              <ViolinPlot
                data  = {data.violin_plot}
                left  = {x_axis_scale(accesser.x(data))!}
                width = {constrainedWidth}
                fill  = {data.box_plot.color}
                valueScale = {y_axis_scale}
                stroke = {data.box_plot.color}
                opacity={graph_cosmatic.violin_plot.opacity}
              />
              
              <BoxPlot
                min = {accesser.min(data)}
                max = {accesser.max(data)}
                left  = {x_axis_scale(accesser.x(data))! + 0.3 * constrainedWidth}
                top= { element_space_height }
                
                median   = {accesser.median(data)}
                outliers = {accesser.outliers(data)}
                valueScale = {y_axis_scale}
                firstQuartile = {accesser.firstQuartile(data)}
                thirdQuartile = {accesser.thirdQuartile(data)}
                
                boxWidth = {constrainedWidth * 0.4}
                fill = {data.box_plot.color}
                stroke = {data.box_plot.color}
                fillOpacity = {graph_cosmatic.box_plot.fill_opacity}
                strokeWidth = {graph_cosmatic.box_plot.stroke_width}
            
              />

              {/* Add invisible rect for tooltip area */}
              <rect
                x={x_axis_scale(accesser.x(data))!}
                y={0}
                width={constrainedWidth}
                height={y_axis_max}
                fill="transparent"
                onMouseMove={(e) => handleTooltip(e, data)}
                onMouseLeave={() => hideTooltip()}
              />

            </g>
          ))
        }

        <AxisLeft 
        label='Lap Time'
        labelProps={graph_cosmatic.axis.label_props}
        labelOffset={50}

        scale = {y_axis_scale} 
        stroke = {graph_cosmatic.axis.line_color}  
        tickStroke = {graph_cosmatic.axis.line_color} 
        tickLabelProps = {graph_cosmatic.axis.tick_props}
        />  

        <AxisBottom 
        label ='Drivers'
        labelOffset= { 20 }
        labelProps={graph_cosmatic.axis.label_props}
        
        tickValues = {label_values} 
        top = {y_axis_max} scale = {x_axis_scale} 
        stroke = {graph_cosmatic.axis.line_color}  
        tickStroke = {graph_cosmatic.axis.line_color} 
        tickLabelProps = {graph_cosmatic.axis.tick_props} 
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
            background: 'rgba(245, 245, 245, 0.95)',
            padding: '0.5rem',
            border: '1px solid black',
            borderRadius: '5px',
            color: 'black',
            fontSize: '14px',
            fontFamily: 'Electrolize',
          }}
        >
          <div>
            <strong>{tooltipData.driver}</strong>
            <br />
            <div>Max : {tooltipData.max.toFixed(3)}s</div>
            <div>Med : {tooltipData.median.toFixed(3)}s</div>
            <div>Min : {tooltipData.min.toFixed(3)}s</div>
          </div>

        </TooltipInPortal>
      )}
    </div>
  );
}

