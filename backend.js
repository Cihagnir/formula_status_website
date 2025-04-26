
// Import Lib's
require("dotenv").config();
const cors = require('cors');
const mysql = require('mysql');
const express = require('express');

// Handmade Imports
const utils = require('./utils.js');
const dataBase = require('./data_base.js');

// Debug Setting 
const LOCAL_DEBUG_SETTING = false ; // It's is exist in order to debug the each file indivually. 
const DEBUG_SETTING = utils.GLOBAL_DEBUG_SETTING || LOCAL_DEBUG_SETTING ;

const cors_conf_json = {
  origin: [
    "https://formulatics.ssoli.app", 
    "http://localhost:3000"
  ],
}

const backend_app = express();
backend_app.use(cors(cors_conf_json));

/** Local MySQL Connection Config (for development)
var rds_connection = mysql.createConnection({
  user     : 'root',
  password : 'Cg//1234',
  host     : 'localhost',
  database : 'formula_one'
});
 */
/** AWS RDS Connection   
// RDS Connection Config
*/

var rds_connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
})


rds_connection.connect(
  (error) => {
    if (error) {
      console.error(`DATABASE : Connection Status ${error}`);
      return;
    }
    console.log('DATABASE : Connection Status Done');
  }
);


// Return the number of the element on the list 
function Count_Elements(array) {
  const elementCountMap = array.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1; // Increment count or initialize it
    return acc;
  }, {});

  // Convert the count map into an array of JSON objects
  return Object.entries(elementCountMap).map(([value, count]) => ({
    value: isNaN(Number(value)) ? value : Number(value), // Convert string keys to numbers if numeric
    count,
  }));
};


setInterval( async () => {
  ( DEBUG_SETTING ) ? ( console.log('Fetching Data from API') ) : null;

  let session_response = await utils.API_Fetch_Request('https://api.openf1.org/v1/sessions?session_key=latest');
  let session_info_json = session_response[0];


  let is_race_end = utils.Is_Race_End(session_info_json.session_key);
  
  if ( is_race_end ) {
    dataBase.Updata_Database(session_info_json, rds_connection);
  }
  
},  180000); // Chane the time into a minute or 5 minutes  




// Status Test Function
backend_app.get(
  "/", (request, result) => {

    result.json({ "Api Status": 200 });
  }
);


// Status Test Function Second Page 
backend_app.get(
  "/second", (request, result) => {

    result.json({ "Api Status": 200 });
  }
);



/********  UI INFORMATION FETCHER BACKEND FUNCTION  *********/

// RACE Track Name Fetcher
backend_app.get(
  "/ui/year/:year/:session_type/", (request, result) => {

    var api_result = [];
    var rds_query_string = `SELECT DISTINCT country, session_name FROM lap_time_table WHERE ( year = ${ request.params.year } AND session_type = '${ request.params.session_type }' )`;
    (DEBUG_SETTING) ? ( console.log(rds_query_string) ) : null;
    
    rds_connection.query(rds_query_string, (query_error, query_result) => {

      if (query_error) {

        console.error(`DATABASE : Querry Error ${query_error}`);
        result.status(500).send('Database query search failed.');
        return;

      } else {

        query_result.forEach(element => {
          api_result.push(element.country + "   " + element.session_name) ;
        });

        result.json({ api_response: api_result });
      }
    }
    )
  }
);


//  RACE Seassion Year Fetcher
backend_app.get(
  "/ui/year/", (request, result) => {

    var api_result = [];
    var rds_query_string = `SELECT DISTINCT year FROM lap_time_table`;
    (DEBUG_SETTING) ? ( console.log(rds_query_string) ) : null;

    rds_connection.query(rds_query_string,
      (query_error, query_result) => {

        if (query_error) {

          console.error(`DATABASE : Querry Error ${query_error}`);
          result.status(500).send('Database query search failed.');
          return;

        } else {

          query_result.forEach(element => {
            api_result.push(element.year)
          });

          result.json({ api_response: api_result });
        }
      }
    )
  }
);


// QUALIFICATION Session Type Fetcher 
backend_app.get(
  "/ui/session_name/:year/:circuit_name", (request, result) => {

    var api_result = [];
    var rds_query_string = `SELECT DISTINCT session_name FROM lap_time_table WHERE (year = ${request.params.year} AND circuit_name = '${request.params.circuit_name}' AND session_name LIKE '%Qualifying%')` ;
    (DEBUG_SETTING) ? ( console.log(rds_query_string) ) : null;

    rds_connection.query(rds_query_string, (query_error, query_result) => {

      if (query_error) {

        console.error(`DATABASE : Querry Error ${query_error}`);
        result.status(500).send('Database query search failed.');
        return;

      } else {

        query_result.forEach(element => {
          api_result.push(element.session_name)
        });

        result.json({ api_response: api_result });
      }
    }
    )
  }
);


/********  GRAPH DRAWER BACKEND FUNCTION  *********/


// RACE Lap Time Line Graph Data Transformer 
backend_app.get(
  "/graph/Race/Lap_Time_Line/:year/:country/:session_name/:is_filter/:upper_bound/:lower_bound", (request, result) => {

    let api_result = {};
    let upper_bound = Number(request.params.upper_bound);
    let lower_bound = Number(request.params.lower_bound);
    let is_filter = Boolean(Number(request.params.is_filter));

    var rds_query_string = ` SELECT driver_name, lap_duration, lap_number_fix, team_color FROM lap_time_table WHERE ( year = ${request.params.year} AND country='${request.params.country}' AND session_name='${request.params.session_name}'  )`;
    
    (DEBUG_SETTING) ? ( console.log(rds_query_string) ) : null;
    
    rds_connection.query(rds_query_string,
      (query_error, query_result) => {

        if (query_error) {

          console.error(`DATABASE : Querry Error ${query_error}`);
          result.status(500).send('Database query search failed.');
          return;

        } else {
          
          let team_color_json = {};
          let total_laptime_array = [];

          query_result.forEach(element => {
            total_laptime_array.push(element.lap_duration);
          });
          
          let quartiles = utils.Quartile_Calculater(total_laptime_array, lower_bound, upper_bound);

          if(is_filter){
            total_laptime_array = total_laptime_array.filter(val => ((quartiles.lower_quart < val) && (val < quartiles.upper_quart)));
          }
          
          query_result.forEach(element => {
          
            let lap_time_data = element.lap_duration ; 

            if ( is_filter & ((lap_time_data < quartiles.lower_quart) | ( quartiles.upper_quart < lap_time_data)) ){
              lap_time_data = null ; 
            }
            
            if (api_result.hasOwnProperty(element.driver_name)) {
              
              api_result[element.driver_name].push({
                lap_number: element.lap_number_fix,
                lap_time: lap_time_data,
              });
            
            } else {

              team_color_json[element.driver_name] = element.team_color;

              api_result[element.driver_name] = [{
                lap_number: element.lap_number_fix,
                lap_time: lap_time_data,
              }];
            }
          });

          result.json({ api_response: { graph_data : api_result, graph_style : team_color_json} });
        }
      }
    )
  }
);


// RACE Driver Interval Graph Data Transformer
backend_app.get( 
  "/graph/Race/Driver_Interval/:year/:country/:session_name/:is_per_lap/", ( request, result ) => {

    let api_result = {};
    const is_per_lap = Boolean(Number(request.params.is_per_lap));

    let sql_querry_string = `SELECT driver_name, driver_number, lap_number, driver_pos, driver_interval, team_color, sample_time FROM position_interval_table WHERE ( year = ${request.params.year} AND country = '${request.params.country}' AND session_name = '${request.params.session_name}' ) ORDER BY sample_time`;

    (DEBUG_SETTING) ? ( console.log(sql_querry_string) ) : null;

    rds_connection.query(sql_querry_string, (query_error, query_result) => { 

      if (query_error) {

        console.error(`DATABASE : Querry Error ${query_error}`);
        result.status(500).send('Database query search failed.');
        return;

      }else {

        let team_color_json = {};

        let lap_position_json = {};
        let temp_graph_data_json = {};
        let lap_max_interval_json = {};

        // If is_per_lap is true
        if ( is_per_lap ) {


          query_result.forEach( (interval_json) => {

            const lap_number = interval_json.lap_number;
            const driver_pos = interval_json.driver_pos;
            const team_color = interval_json.team_color;
            const driver_name = interval_json.driver_name;
            const driver_number = interval_json.driver_number;
            const driver_interval = interval_json.driver_interval;

            if (! team_color_json.hasOwnProperty(driver_name)) {
              team_color_json[driver_name] = team_color;
            };

            if ( ! lap_position_json.hasOwnProperty( lap_number ) ) {
              lap_position_json[ lap_number ] = {};
            }

            if ( ! temp_graph_data_json.hasOwnProperty( lap_number ) ) {
              temp_graph_data_json[ lap_number ] = {};
            }

            // If it's new we add the json 
            if ( ! temp_graph_data_json[ lap_number ].hasOwnProperty( driver_number )  ) {
              temp_graph_data_json[ lap_number][ driver_number ] = {
                driver_interval : [],
                driver_pos : driver_pos,
                driver_name : driver_name,
              };
            }

            // If the driver position is changed 
            if ( temp_graph_data_json[ lap_number ][ driver_number ].driver_pos !== driver_pos ){

              lap_position_json[ lap_number ][ temp_graph_data_json[ lap_number][ driver_number ].driver_pos ] = undefined ; 

              temp_graph_data_json[ lap_number][ driver_number ] = {
                driver_name : driver_name,
                driver_pos : driver_pos,
                driver_interval : [],
              };
            }

            lap_position_json[ lap_number ][ driver_pos ] = driver_number ;
            temp_graph_data_json[ lap_number ][ driver_number ].driver_interval.push( driver_interval );

          }); // Query Result ForEach Loop End 


          for ( const [ lap_number, driver_pos_json ] of Object.entries( lap_position_json ) ){

            let prev_pos_interval = 0 ;

            for ( const [ driver_pos, driver_number ] of Object.entries( driver_pos_json ) ){

              if (driver_number !== undefined) {

                let interval_array = temp_graph_data_json[ lap_number ][ driver_number ].driver_interval;
                
                let avrg_interval =  utils.Average_Array(interval_array);
                const driver_name = temp_graph_data_json[ lap_number ][ driver_number ].driver_name ;
                
                if( driver_pos == 1 ){
                  avrg_interval += 0.001 ;
                }
                
                avrg_interval += prev_pos_interval ;
                
                if ( ! api_result.hasOwnProperty( driver_name ) ) {
                  api_result[ driver_name ] = [];
                }
                if (! lap_max_interval_json.hasOwnProperty( +lap_number ) ) {
                  lap_max_interval_json[ +lap_number ] = 0;
                }

                if ( lap_max_interval_json[ +lap_number ] < avrg_interval ) {
                  lap_max_interval_json[ +lap_number ] = avrg_interval ;
                }

                api_result[ driver_name ].push( { lap_number : +lap_number, driver_interval : avrg_interval, is_missing : false, stacked_interval : null } );
              }
            }
          }

          result.json( { api_response : { graph_data : api_result, graph_style : team_color_json, lap_max_interval_json, lap_max_interval_json } } )
        }; // is_per_lap If Ends 

      };// Querry Error Else Ends 
    });// RDS Connection Ends 
  }
);// Function Ends 


// RACE Driver Position Grpah Data Transformer
backend_app.get(
  "/graph/Race/Driver_Position/:year/:country/:session_name/", (request, result) => {

    let api_result = {};
    let rds_query_string = `SELECT driver_name, driver_number, lap_number, driver_pos, team_color FROM position_interval_table WHERE ( year = ${request.params.year} AND country = '${request.params.country}' AND session_name = '${request.params.session_name}' AND driver_interval=-2 ) ORDER BY lap_number` ;

    (DEBUG_SETTING) ? ( console.log(rds_query_string) ) : null ;

    rds_connection.query( rds_query_string, (query_error, query_result) => {

      if ( query_error ) {

        console.error(`DATABASE : Querry Error ${query_error}`);
        result.status(500).send('Database query search failed.');
        return;
      
      }else{

        let team_color_json = {}
        let lap_position_json = {}

        query_result.forEach( ( position_json ) => { 

          if ( position_json.driver_pos !== null ){
           
            const driver_pos = position_json.driver_pos ;
            const team_color = position_json.team_color ;
            const lap_number = position_json.lap_number ;
            const driver_name = position_json.driver_name ;
            const driver_number = position_json.driver_number ;

            if ( ! team_color_json.hasOwnProperty( driver_name ) ) {
              team_color_json[ driver_name ] = team_color ;
            }

            if ( ! lap_position_json.hasOwnProperty( lap_number ) ) {
              lap_position_json[ lap_number ] = {};

            }

            if ( ! lap_position_json[ lap_number ].hasOwnProperty( driver_number ) ) {
              lap_position_json[ lap_number ][ driver_name ] = null;
            }

            lap_position_json[ lap_number ][ driver_name ] = driver_pos ;
          }
        });// Query Loop Ends 


        for( const [lap_number, position_json] of Object.entries(lap_position_json) ){

          for( const [driver_name, driver_pos] of Object.entries(position_json) ){


            if ( ! api_result.hasOwnProperty( driver_name ) ) {
              api_result[ driver_name ] = [];
            }

            api_result[ driver_name ].push( { lap_number : +lap_number, driver_pos : driver_pos } );
          }// Postion For Loop End 
        }// Lap Number Postion End 
        
        result.json( { api_response : { graph_data : api_result, graph_style : team_color_json } } )
      
      }// Query Else End
    });// Query Ends
  }
);// Function Ends


// RACE Lap Time Distrubation Graph Data Transformer 
backend_app.get(
  "/graph/Race/Lap_Time_Distr/:year/:country/:session_name/", (request, result) => {

    let api_result = [];
    var rds_query_string = ` SELECT driver_name, lap_duration, team_color FROM lap_time_table WHERE ( year = ${request.params.year} AND country='${request.params.country}' AND session_name='${request.params.session_name}' )` ;
    (DEBUG_SETTING) ? ( console.log(rds_query_string) ) : null;

    rds_connection.query(rds_query_string,
      (query_error, query_result) => {

        if (query_error) {

          console.error(`DATABASE : Querry Error ${query_error}`);
          result.status(500).send('Database query search failed.');
          return;

        } else {

          let data_json = {};
          let team_color_json = {}
          let total_laptime_array = [];

          query_result.forEach(element_json => {

            total_laptime_array.push(element_json.lap_duration)

            if (element_json.driver_name in data_json) {

              data_json[element_json.driver_name].push(element_json.lap_duration);
            } else {

              data_json[element_json.driver_name] = [element_json.lap_duration];
              team_color_json[element_json.driver_name] = element_json.team_color;
            }

          });
          
          quartiles = utils.Quartile_Calculater(total_laptime_array);

          for (let key in data_json) {

            let lap_time_array = data_json[key];
            if (lap_time_array.length < 8) {
              continue;
            }
            lap_time_array.sort(function (a, b) { return a - b });

            lap_time_array = lap_time_array.filter(val => ((quartiles.lower_quart < val) && (val < quartiles.upper_quart)));

            let first_quartile = lap_time_array[Math.floor((lap_time_array.length + 1) * 0.25)];
            let third_quartile = lap_time_array[Math.floor((lap_time_array.length + 1) * 0.75)];

            outliers = lap_time_array.filter(val => ((first_quartile > val) || (val > third_quartile)))


            api_result.push(
              {
                violin_plot: Count_Elements(lap_time_array.map(num => Math.round(num))),
                box_plot: {
                  x: key,
                  color : team_color_json[key],
                  min: lap_time_array[0],
                  max: lap_time_array[lap_time_array.length - 1],
                  median: lap_time_array[Math.round(lap_time_array.length / 2)],
                  first_quartile: first_quartile,
                  third_quartile: third_quartile,
                  outliers: outliers,
                },
              }
            )
          }

          result.json({ api_response: api_result });
        }
      }
    )
  }
);


// RACE Tyre Stint Graph Data Transformer
backend_app.get(
  "/graph/Race/Tyre_Stint/:year/:country/:session_name/", (request, result) => {

    api_result = []
    var rds_query_string = `SELECT driver_name, tyre_compound, stint_duration, stint_number FROM tyre_stint_table WHERE ( year = ${request.params.year} AND country='${request.params.country}' AND session_name='${request.params.session_name}'  )`;
    
    (DEBUG_SETTING) ? ( console.log("Tyre stint query : ", rds_query_string) ) : null;
    
    rds_connection.query(rds_query_string,
      (query_error, query_result) => {

        if (query_error) {

          console.error(`DATABASE : Querry Error ${query_error}`);
          result.status(500).send('Database query search failed.');
          return;

        } else {

          let data_json = {};
          query_result.forEach(element_json => {

            let key_string = element_json.tyre_compound + '_' + element_json.stint_number.toString()

            if (!(element_json.driver_name in data_json)) {

              data_json[element_json.driver_name] = {};
              data_json[element_json.driver_name]['driver_name'] = element_json.driver_name;

            }

            data_json[element_json.driver_name][key_string] = element_json.stint_duration;

          });

          Object.values(data_json).forEach(element => {
            api_result.push([element])
          });

          result.json({ api_response: api_result });

        }
      }
    )
  }
);


// QUALIFICATION Lap Time Graph Data Transformer
backend_app.get(
  "/graph/Qualification/Lap_Time_Bar/:year/:country/:session_name/:sub_session_name", (request, result) => {

    api_result = []

    var rds_query_string = `SELECT driver_name, sector_one, sector_two, sector_three, lap_duration, lap_start_time  FROM lap_time_table WHERE ( year = ${request.params.year} AND session_name = '${request.params.session_name}' AND country = '${request.params.country}' AND sub_session_name = '${request.params.sub_session_name}'  )` ;
    (DEBUG_SETTING) ? ( console.log(rds_query_string) ) : null;

    rds_connection.query(rds_query_string,
      (query_error, query_result) => {

        if (query_error) {

          console.error(`DATABASE : Querry Error ${query_error}`);
          result.status(500).send('Database query search failed.');
          return;

        } else {
          
          let driver_lap_json = {} ;

          query_result.forEach( (sub_element) => {

            if(sub_element.lap_duration) {
              
              if (driver_lap_json.hasOwnProperty(sub_element.driver_name)) {

                if(sub_element.lap_duration < driver_lap_json[sub_element.driver_name].lap_duration ){
                  
                  driver_lap_json[sub_element.driver_name] = sub_element ;
                }
              } else {
                driver_lap_json[sub_element.driver_name] = sub_element ;
              }
            }
          })

          api_result = Object.values(driver_lap_json);

          result.json({ api_response: api_result });
        }
      }
    )
  }
);


// Backend Start function 
backend_app.listen(
  8080, () => {
    console.log("Backend server started : Port => 8080");
  }
);






