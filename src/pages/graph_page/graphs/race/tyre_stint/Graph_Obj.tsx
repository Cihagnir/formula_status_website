import { Group } from '@visx/group';
import { LegendOrdinal } from '@visx/legend';
import { BarStackHorizontal } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';



// CSS Import 
import './Tyre_Stint_Page.css'

// ==========================================================

const driver_scale = (data_json  : Array<any> ) => Object.values(data_json)[0].driver_name ;
const driver = (data_json : {driver_name : string}) => data_json.driver_name; 
const keys = (data_json : any ) => Object.keys(data_json).slice(1,) ;
 
// Interface Defines
interface graph_interface {
  graph_data : Array<any>,
}

interface TooltipData {
  [key: string]: string
} 

// Constant Variable Defines
const color_scale_graph = { 
  SOFT : '#FF0000', 
  MEDIUM : '#FFD900', 
  HARD : '#FFFFFF', 
  INTERMEDIATE  : '#00A808', 
  WET : '#000EA8', 
  null : "#858585" 
}

const color_scale_legend  = { 
  Soft : '#FF0000', 
  Medium : '#FFD900', 
  Hard : '#FFFFFF', 
  Intermediate  : '#00A808', 
  Wet : '#000EA8', 
  Unknown : "#858585" 
}

function Color_Scale_Seperator({ graph_data } : graph_interface) {

  let range : string[] = [] ; 
  let domain : string[] = [] ;

  graph_data.forEach(element => {

    Object.keys(element[0]).slice(1,).forEach(sub_element => {
      if (!domain.includes(sub_element)) {
        
        let key_element  = sub_element.split("_")[0] ; 
        let color_element = color_scale_graph[key_element as keyof typeof color_scale_graph ] ; 
        
        domain.push(sub_element) ; 
        range.push(color_element) ; 
      }
    });
  });
  return {range, domain}
}

function Lap_Number_Calculator({ graph_data } : graph_interface) {

  let driver_lap_number : number[] = []

  graph_data.forEach(element => {
    let sum : number = Object.values(element[0]).slice(1,).reduce((accumulator:number, currentValue:any) => accumulator + currentValue, 0);
    driver_lap_number.push(sum)
  });
  return driver_lap_number ; 
}

export function Tyre_Stint_Graph( {
   graph_data 
  } : graph_interface) {

  // Tooltip Constant Defines 
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

  // Update window size calculation
  let window_width = Math.min(document.documentElement.clientWidth, 1200); // Cap max width
  let window_height = Math.min(document.documentElement.clientHeight, 800); // Cap max height

  // Adjust graph dimensions based on screen size
  let graph_width = window_width < 1024 ? window_width * 0.9 : window_width * 0.70;
  let graph_height = window_height < 1024 ? window_height * 0.80 : window_height * 0.80;
  
  // Adjust spacing for smaller screens
  let element_space_width = window_width < 1024 ? window_width * 0.1 : window_width * 0.08;
  let element_space_height = window_height < 1024 ? window_height * 0.15 : window_height * 0.1;

  let x_axis_max = graph_width - element_space_width ; 
  let y_axis_max = graph_height - element_space_height ;

  let driver_lap_array = Lap_Number_Calculator({graph_data})
  let driver_name_array = graph_data.map(driver_scale)

  const sorted_driver_array = driver_name_array
  .map((name, index) => ({ name, score: driver_lap_array[index] })) 
  .sort((a, b) => a.score - b.score)                     
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

  // Update font sizes for smaller screens
  const graph_cosmatic = {
    axis: {
      line_color: '#F5F5F5',
      label_props : {
        fill: '#F5F5F5',
        fontSize: window_width < 1024 ? 14 : 20,
        fontFamily: 'Electrolize',
      },
      tick_props: {
        fill: '#F5F5F5',
        fontSize: window_width < 1024 ? 10 : 14,
        fontFamily: 'Electrolize',
      }
    },
    grid : {
      opacity : 0.6,
      stroke_color : "#F5F5F5"
    },
  }

  // Tooltip Arrow Function
  const Handle_Tooltip = (
    event: React.MouseEvent<SVGRectElement>,
    graph_data: any
  ) => {
    if (event) {

      let tooltip_data_json: { [key: string]: string } = {};

      Object.keys(graph_data.bar.data).slice(1,).forEach( (keys) => {
        tooltip_data_json[ keys.split("_")[1] ] = keys.split("_")[0] + "_" + graph_data.bar.data[keys] 
      })

      tooltip_data_json["driver"] = graph_data.bar.data.driver_name ; 

      showTooltip({
        tooltipData: tooltip_data_json,
        tooltipLeft: event.pageX, 
        tooltipTop: event.pageY,  
      });

    }
  };


  return (
    <div className='TS_Graph_Div' >
      
      <div className='TS_Graph_Legend_Div'>
        <LegendOrdinal scale={legend_color_scale} direction="row" labelMargin="0 15px 0 0" />
      </div>

      <svg width={graph_width} height={graph_height}>

        <Group left={element_space_width} width={x_axis_max} height={y_axis_max}>


          {
            graph_data.map(

              (driver_stint) => 
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
                      width={bar.width - 3}
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
          }

          
          {/* Graph Axis */}
          <AxisLeft
            hideAxisLine
            hideTicks

            label= "Drivers"
            labelOffset= {48}
            labelProps={graph_cosmatic.axis.label_props}

            scale={ y_axis_scale }
            stroke={ graph_cosmatic.axis.line_color }
            tickStroke={ graph_cosmatic.axis.line_color }
            tickLabelProps={ graph_cosmatic.axis.tick_props }
            tickValues = {graph_data.map(driver_scale)}

          />  
        
          <AxisBottom
            label= 'Lap Number'
            labelOffset= { 20 }
            labelProps={graph_cosmatic.axis.label_props}

            top={y_axis_max}
            scale={x_axis_scale}
            stroke={ graph_cosmatic.axis.line_color }
            tickStroke={ graph_cosmatic.axis.line_color }
            tickLabelProps={ graph_cosmatic.axis.tick_props }
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
            backdropFilter: 'blur(4px)',
            background: 'rgba(245, 245, 245, 0.9)',
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
            <>
            { 
              Object.values(tooltipData).slice(0,-1).map((values, index)=> (
                <div className= 'capitalize' > 
                {values.split('_')[0].toLowerCase()} : 
                {values.split('_')[1].toLowerCase()}
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
