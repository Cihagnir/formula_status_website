

import { Group } from '@visx/group';
import { LegendOrdinal } from '@visx/legend';
import { BarStack, BarStackHorizontal } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';


// CSS Import 
import './Tyre_Stint_Page.css'

// ==========================================================

const get_driver_scale = (data_json  : Array<any> ) => Object.values(data_json)[0].driver_name ;
const get_driver_graph = (data_json : {driver_name : string}) => data_json.driver_name; 
const get_keys_graph = (data_json : any ) => Object.keys(data_json).slice(1,) ;
 

interface tyre_stint_graph_interface {
  graph_data : Array<any>,
}

const graph_cosmatic = {
  axis : {
    line_color : '#E9ECEF',
    text_prop : {
      fill : '#E9ECEF',
      fontSize : 14,
      fontFamily : 'sans-seif',
    }
  }
}

const color_scale_graph = { 
  SOFT : '#FF0000', 
  MEDIUM : '#FFD900', 
  HARD : '#FFFFFF', 
  INTERMEDIATE  : '#00A808', 
  WET : '#000EA8', 
  UNKNOWN : "#000000" 
}

const color_scale_legend  = { 
  Soft : '#FF0000', 
  Medium : '#FFD900', 
  Hard : '#FFFFFF', 
  Intermediate  : '#00A808', 
  Wet : '#000EA8', 
  Unknown : "#000000" 
}

function Color_Scale_Seperator({ graph_data } : tyre_stint_graph_interface) {

  let range : string[] = [] ; 
  let domain : string[] = [] ;

  graph_data.forEach(element => {
    
    Object.keys(element[0]).slice(1,).forEach(sub_element => {

      if (! ( sub_element in domain ) ) {
        let key_element  = sub_element.split("_")[0] ; 
        let color_element = color_scale_graph[key_element as keyof typeof color_scale_graph ] ; 
        
        domain.push(sub_element) ; 
        range.push(color_element) ; 
      }
    });
  });
  return {range, domain}
}

function Lap_Number_Calculator({ graph_data } : tyre_stint_graph_interface) {

  let driver_lap_number : number[] = []

  graph_data.forEach(element => {
    let sum : number = Object.values(element[0]).slice(1,).reduce((accumulator:number, currentValue:any) => accumulator + currentValue, 0);
    driver_lap_number.push(sum)
  });
  return driver_lap_number ; 
}



export function Tyre_Stint_Graph( { graph_data } : tyre_stint_graph_interface ) {

  let window_width = document.documentElement.clientWidth;
  let window_height = document.documentElement.clientHeight;

  // Set the boundries 
  let grpah_width = window_width * 0.50 ; 
  let graph_height = window_height * 0.80 ;
  let element_space_width = window_width * 0.05 ;
  let element_space_height = window_height * 0.1 ;

  let x_axis_max = grpah_width - element_space_width ; 
  let y_axis_max = graph_height - element_space_height ;

  let driver_lap_array = Lap_Number_Calculator({graph_data})
  let driver_name_array = graph_data.map(get_driver_scale)

  const sorted_driver_array = driver_name_array
  .map((name, index) => ({ name, score: driver_lap_array[index] })) // Pair names with scores
  .sort((a, b) => a.score - b.score)                     // Sort by score descending
  .map(pair => pair.name); 

  // Set the graph scales 
  let x_axis_scale = scaleLinear<number>({
    nice   : true,
    range  : [0, x_axis_max], 
    domain : [0, Math.max(...driver_lap_array)],
  });

  let y_axis_scale = scaleBand<string>({
    padding : 0.2,
    range   : [y_axis_max, 0],  
    domain  : sorted_driver_array,
  });

  let color_scale = Color_Scale_Seperator( { graph_data } ) ;  

  let graph_color_scale = scaleOrdinal<string ,string>({
    range: color_scale.range,
    domain: color_scale.domain,
  });

  let legend_color_scale = scaleOrdinal<string, string>({
    range: Object.values(color_scale_legend),
    domain: Object.keys(color_scale_legend),
  });


   ; 

  return (
    <div className='Graph_Div' >
      
      <div className='Graph_Legend_Div'>
        <LegendOrdinal scale={legend_color_scale} direction="row" labelMargin="0 15px 0 0" />
      </div>

      <svg width={grpah_width} height={graph_height}>
        
        <Group left={element_space_width} width={x_axis_max} height={y_axis_max}>
          {
            graph_data.map(

              (driver_stint) => 
                <BarStackHorizontal
                  data={driver_stint}
                  keys={driver_stint.map(get_keys_graph)[0]}
                  height={y_axis_max}
                  y={get_driver_graph}
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
                          width={bar.width - 3}
                          height={bar.height}
                          fill={bar.color}
                        />
                      )),
                    )
                  }
                </BarStackHorizontal>
            )
          }

        </Group>

        <Group>
          <AxisLeft
            left={element_space_width}
            hideAxisLine
            hideTicks
            scale={ y_axis_scale }
            stroke={ graph_cosmatic.axis.line_color }
            tickStroke={ graph_cosmatic.axis.line_color }
            tickLabelProps={ graph_cosmatic.axis.text_prop }
            tickValues = {graph_data.map(get_driver_scale)}

          />          
        </Group>

        <Group>
          <AxisBottom
            left={element_space_width}
            top={y_axis_max}
            scale={x_axis_scale}
            stroke={ graph_cosmatic.axis.line_color }
            tickStroke={ graph_cosmatic.axis.line_color }
            tickLabelProps={ graph_cosmatic.axis.text_prop }
          />
        </Group>

      </svg>

    </div>
  );
}
