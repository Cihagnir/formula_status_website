// Visx Import 
import { Group } from '@visx/group';
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

export interface graph_data_interface {
  violin_plot  : Array<bin_data_interface>,
  box_plot : {
    x : string, 
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
  graph_data : Array<graph_data_interface>
}


// Arrow Functions
const x = (data: graph_data_interface) => data.box_plot.x;
const min = (data: graph_data_interface) => data.box_plot.min;
const max = (data: graph_data_interface) => data.box_plot.max;
const median   = (data: graph_data_interface) => data.box_plot.median;
const outliers = (data: graph_data_interface) => data.box_plot.outliers;
const firstQuartile = (data: graph_data_interface) => data.box_plot.first_quartile;
const thirdQuartile = (data: graph_data_interface) => data.box_plot.third_quartile;

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

  let grpah_width = window_width * 0.90 ;
  let graph_height = window_height * 0.56 ;
  let element_space_width = window_width  * 0.05;
  let element_space_height = window_height * 0.1 ;

  let x_axis_max = grpah_width - element_space_width ;
  let y_axis_max = graph_height - element_space_height ;

  let minYValue = Math.min(...values);
  let maxYValue = Math.max(...values);



  // Set the Scales for the axis
  let x_axis_scale = scaleBand<string>({
    range: [0, x_axis_max],
    domain: graph_data.map(x),
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
    if (!( x(data) in label_values )) {
      label_values.push( x(data) )
    }
  })

  // Add tooltip handler
  const handleTooltip = (
    event: React.MouseEvent<SVGRectElement>,
    data: graph_data_interface
  ) => {
    if (event) {
      showTooltip({
        tooltipData: {
          driver: x(data),
          median: median(data) ,
          min: min(data),
          max: max(data),
        },
        tooltipLeft: event.pageX, // Add small offset from cursor
        tooltipTop: event.pageY,  // Lift slightly above cursor
      });
    }
  };

  // Return the object if it exist 
  return (
    <div className= 'Graph_Div' >

      <svg width={grpah_width} height={graph_height}>
      
        <PatternLines
          id="hViolinLines"
          width = {3}
          height = {3}
          strokeWidth = {1}
          orientation = {['horizontal']}
          stroke = {graph_cosmatic.violin_plot.pattern_line_color}
        />
      
        <Group width={x_axis_max} height={y_axis_max} left={element_space_width} >

          {graph_data.map((data: graph_data_interface, i) => (
            
            <g key={i}>               

              <ViolinPlot
                data  = {data.violin_plot}
                left  = {x_axis_scale(x(data))!}
                width = {constrainedWidth}
                fill  = "url(#hViolinLines)"
                valueScale = {y_axis_scale}
                stroke = {graph_cosmatic.violin_plot.violin_color}
                opacity={graph_cosmatic.violin_plot.opacity}
              />
              
              <BoxPlot
                min = {min(data)}
                max = {max(data)}
                left  = {x_axis_scale(x(data))! + 0.3 * constrainedWidth}
                top= { element_space_height }
                
                median   = {median(data)}
                outliers = {outliers(data)}
                valueScale = {y_axis_scale}
                firstQuartile = {firstQuartile(data)}
                thirdQuartile = {thirdQuartile(data)}
                
                boxWidth = {constrainedWidth * 0.4}
                fill = {graph_cosmatic.box_plot.fill_color}
                stroke = {graph_cosmatic.box_plot.stroke_color}
                fillOpacity = {graph_cosmatic.box_plot.fill_opacity}
                strokeWidth = {graph_cosmatic.box_plot.stroke_width}
            
              />

              {/* Add invisible rect for tooltip area */}
              <rect
                x={x_axis_scale(x(data))!}
                y={0}
                width={constrainedWidth}
                height={y_axis_max}
                fill="transparent"
                onMouseMove={(e) => handleTooltip(e, data)}
                onMouseLeave={() => hideTooltip()}
              />

            </g>
          )
          )
        }
        </Group>
        
        <Group>
          <AxisLeft 
          label='Lap Time'
          left = {element_space_width} scale = {y_axis_scale} 
          stroke = {graph_cosmatic.axis.line_color}  tickStroke = {graph_cosmatic.axis.line_color} 
          tickLabelProps = {graph_cosmatic.axis.text_prop}
          />
        </Group>

        <Group>
          <AxisBottom 
          label ='Drivers'
          labelOffset= { 20 }
          top = {y_axis_max} left = {element_space_width} scale = {x_axis_scale} 
          stroke = {graph_cosmatic.axis.line_color}  tickStroke = {graph_cosmatic.axis.line_color} 
          tickLabelProps = {graph_cosmatic.axis.text_prop} 
          tickValues = {label_values} 
          
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

