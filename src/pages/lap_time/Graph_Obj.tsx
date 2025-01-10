// Visx Import 
import { Group } from '@visx/group';
import { PatternLines } from '@visx/pattern';
import { AxisBottom, AxisLeft } from "@visx/axis";
import { ViolinPlot, BoxPlot } from '@visx/stats';
import { scaleBand, scaleLinear } from '@visx/scale';

// CSS Import 
import "./Lap_Time_Page.css"


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
    violin_color : '#5B636A',
    pattern_line_color : '#5B636A', 
  },
  box_plot : {
    fill_color : '#E9ECEF', 
    fill_opacity : 0.3 ,
    stroke_color : '#E9ECEF',
    stroke_width : 2, 
  },
  axis : {
    line_color : '#E9ECEF',
    text_prop : {
      fill : '#E9ECEF',
      fontSize : 12,
      fontFamily : 'sans-seif',
    }
  }
}
 
export function  Lap_Time_Graph( { 
  graph_data,
}: lap_time_graph_interface) {

  let values = graph_data.reduce( (allValues, { box_plot }) => {
    allValues.push(box_plot.min, box_plot.max);
    return allValues;
  }, [] as number[]);

  let window_width = document.documentElement.clientWidth;
  let window_height = document.documentElement.clientHeight;

  // Set the bounderies 

  let grpah_width = window_width * 0.90 ;
  let graph_height = window_height * 0.50 ;
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
    range: [y_axis_max, 0],
    round: true,
    domain: [minYValue, maxYValue],
    nice : true,
  });


  let constrainedWidth = Math.min(60, x_axis_scale.bandwidth());  // We put it max limit for what scale set to make it more usefull 

  let label_values : string[] = [] ;

  graph_data.map( data  => {
    if (!( x(data) in label_values )) {
      label_values.push( x(data) )
    }
  })


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



            </g>
          )
          )
        }
        </Group>
        
        <Group>
          <AxisLeft 
          left = {element_space_width} scale = {y_axis_scale} 
          stroke = {graph_cosmatic.axis.line_color}  tickStroke = {graph_cosmatic.axis.line_color} 
          tickLabelProps = {graph_cosmatic.axis.text_prop}
          />
        </Group>

        <Group>
          <AxisBottom 
          top = {y_axis_max} left = {element_space_width} scale = {x_axis_scale} 
          stroke = {graph_cosmatic.axis.line_color}  tickStroke = {graph_cosmatic.axis.line_color} 
          tickLabelProps = {graph_cosmatic.axis.text_prop} 
          tickValues = {label_values} label ='categories'
          
         />
        </Group>


      </svg>
    </div>
  );
}

