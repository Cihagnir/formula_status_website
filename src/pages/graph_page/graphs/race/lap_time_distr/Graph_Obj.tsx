// Visx Import 
import { Group } from '@visx/group';
import { GridRows } from "@visx/grid";
import { PatternLines } from '@visx/pattern';
import { AxisBottom, AxisLeft } from "@visx/axis";
import { ViolinPlot, BoxPlot } from '@visx/stats';
import { scaleBand, scaleLinear } from '@visx/scale';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';


// Project Imports 
import { 
   axis_cosmatics,
  lap_dstrb_graph_data_interface, lap_dstrb_graph_input_interface 
} from '../../../Commen_Utils';


// CSS Import 
import "./Lap_Time_Distr_Page.css"



// ==== Local Interface Defines ==== 
interface TooltipData {
  driver: string;
  median: number;
  min: number;
  max: number;
}


// ==== Arrow Function Defines ====

// Graph Accessers 
const accesser = {
 x : (data: lap_dstrb_graph_data_interface) => data.box_plot.x ,
 min : (data: lap_dstrb_graph_data_interface) => data.box_plot.min ,
 max : (data: lap_dstrb_graph_data_interface) => data.box_plot.max ,
 median : (data: lap_dstrb_graph_data_interface) => data.box_plot.median ,
 outliers : (data: lap_dstrb_graph_data_interface) => data.box_plot.outliers ,
 firstQuartile : (data: lap_dstrb_graph_data_interface) => data.box_plot.first_quart ,
 thirdQuartile : (data: lap_dstrb_graph_data_interface) => data.box_plot.third_quart ,
}

// Page Export Funciton 
export function  Lap_Time_Graph( { 
  graph_data,
}: lap_dstrb_graph_input_interface) {


// ==== Local Arrow Function ====

  // Set the X Axis Labes 
  let label_values : string[] = [] ;

  graph_data.map( data  => {
    if (!( accesser.x(data) in label_values )) {
      label_values.push( accesser.x(data) )
    }
  })

  // Add tooltip handler
  const handleTooltip = (
    event: React.MouseEvent<SVGRectElement>,
    data: lap_dstrb_graph_data_interface
  ) => {
    if (event) {
      showTooltip({
        tooltipData: {
          driver: accesser.x(data),
          median: accesser.median(data) ,
          min: accesser.min(data),
          max: accesser.max(data),
        },
      tooltipLeft: event.pageX, 
        tooltipTop: event.pageY,  
      });
    }
  };

  // Values Collecter
  let values = graph_data.reduce( (allValues, { box_plot }) => {
    allValues.push(box_plot.min, box_plot.max);
    return allValues;
  }, [] as number[]);


// ==== Constant Defines ====

  // Tooltip Defines 
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

  // Set the bounderies 
  let window_width = document.documentElement.clientWidth;
  let window_height = document.documentElement.clientHeight;


  let graph_width = window_width < 1024 ? window_width * 0.85 : window_width * 0.8;
  let graph_height = window_height < 800 ? window_height * 0.8 : window_height * 0.5;

  let element_space_width = window_width * 0.05;
  let element_space_height = window_height * 0.1 ;

  let x_axis_max = graph_width - element_space_width ;
  let y_axis_max = graph_height - element_space_height ;

  let minYValue = Math.min(...values);
  let maxYValue = Math.max(...values);

  // Graph Cosmatics 
  const axis_features = axis_cosmatics(window_width) ;

  const graph_cosmatic =  {    
    violin_plot : {
      violin_color : '#F5F5F5',
      pattern_line_color : '#F5F5F5', 
      opacity : 0.7 ,
    },
    box_plot : {
      fill_color : '#F5F5F5', 
      fill_opacity : 0   ,
      stroke_color : '#CCCCCC',
      stroke_width : 1, 
    },
  }

// ==== ====

  // Graph Scales Defines 
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

  // Max Wdith for Graph boxes  
  let limited_width = Math.min(60, x_axis_scale.bandwidth());  


// ==== Return Section ====

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
            stroke={axis_features.grid.stroke_color}
            strokeOpacity={axis_features.grid.opacity}
          />

          {graph_data.map((data: lap_dstrb_graph_data_interface, i) => (
            
            <g key={i}>               

              <ViolinPlot
                data  = {data.violin_plot}
                left  = {x_axis_scale(accesser.x(data))!}
                width = {limited_width}
                fill  = {data.box_plot.color}
                valueScale = {y_axis_scale}
                stroke = {data.box_plot.color }
                strokeWidth={2}
                opacity={graph_cosmatic.violin_plot.opacity}
              />
              
              <BoxPlot
                min = {accesser.min(data)}
                max = {accesser.max(data)}
                left  = {x_axis_scale(accesser.x(data))! + 0.3 * limited_width}
                top= { element_space_height }
                
                median   = {accesser.median(data)}
                outliers = {accesser.outliers(data)}
                valueScale = {y_axis_scale}
                firstQuartile = {accesser.firstQuartile(data)}
                thirdQuartile = {accesser.thirdQuartile(data)}
                
                boxWidth = {limited_width * 0.4}
                fill = {data.box_plot.color}
                stroke = {data.box_plot.color}
                fillOpacity = {graph_cosmatic.box_plot.fill_opacity}
                strokeWidth = {graph_cosmatic.box_plot.stroke_width}
            
              />

              {/* Add invisible rect for tooltip area */}
              <rect
                x={x_axis_scale(accesser.x(data))!}
                y={0}
                width={limited_width}
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
        labelProps={axis_features.axis.label_props}
        labelOffset={(window_width < 1024) ? (20) : (50)}

        scale = {y_axis_scale} 
        stroke = {axis_features.axis.line_color}  
        tickStroke = {axis_features.axis.line_color} 
        tickLabelProps = {axis_features.axis.tick_props}
        />  

        <AxisBottom 
        label ='Drivers'
        labelOffset= { (window_height < 800 ) ? ( 5 ) : ( 20 ) }
        labelProps={axis_features.axis.label_props}
        
        tickValues = {label_values} 
        top = {y_axis_max} scale = {x_axis_scale} 
        stroke = {axis_features.axis.line_color}  
        tickStroke = {axis_features.axis.line_color} 
        tickLabelProps = {axis_features.axis.tick_props} 
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
            fontSize: '14px',
            fontFamily: 'Electrolize',
            backdropFilter: 'blur(40px)',
            background: 'transparent',  // 'rgb(0 0 0/56%)',
          }}
        >
          <div>
            <div className='LTD_ToolTip_Title_Div' >{tooltipData.driver}</div>
            <div className='LTD_ToolTip_Row_Div' > Max : {tooltipData.max.toFixed(3)}s    </div>
            <div className='LTD_ToolTip_Row_Div' > Med : {tooltipData.median.toFixed(3)}s </div>
            <div className='LTD_ToolTip_Row_Div' > Min : {tooltipData.min.toFixed(3)}s    </div>
          </div>

        </TooltipInPortal>
      )}
    </div>
  );
}

