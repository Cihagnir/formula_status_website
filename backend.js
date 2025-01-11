
// Import Lib's
require("dotenv").config();
const cors = require('cors');
const mysql   = require('mysql');
const express = require('express') ;
const { Console } = require("console");

const cors_conf_json = {
  origin : ["https://main-frontend.d3rpgxvzsb1xs7.amplifyapp.com", "https://formulatics.onrender.com", "http://localhost:3000",],
}

const backend_app = express();
backend_app.use(cors(cors_conf_json));


// RDS Connection Config
var rds_connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port : process.env.DB_PORT, 
})

rds_connection.connect( 
  (error) => {
    if(error){
      console.error(`DATABASE : Connection Status ${error}`);
      return ;
    }
    console.log('DATABASE : Connection Status Done');
  } 
)

// Return the number of the element on the list 
function countElements(array) {
  const elementCountMap = array.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1; // Increment count or initialize it
    return acc;
  }, {});

  // Convert the count map into an array of JSON objects
  return Object.entries(elementCountMap).map(([value, count]) => ({
    value: isNaN(Number(value)) ? value : Number(value), // Convert string keys to numbers if numeric
    count,
  }));
}


// Status Test Function
backend_app.get( 
  "/", (request, result) => {
    
    result.json( { "Api Status" : 200 } ); 
  }
) ;

// Status Test Function Second Page 
backend_app.get(
  "/second", (request, result) => {
    
    result.json( {"Api Status" : 200} );
  }
);

// Track Name Fetcher
backend_app.get(
  "/ui/year/:year/", (request, result) => {

    var api_result = [] ;
    var rds_query_string = `SELECT DISTINCT circuit_name FROM lap_time_table WHERE seassion = ${ request.params.year }` ; 

    rds_connection.query(rds_query_string, (query_error, query_result) => {

        if(query_error) {
          
          console.error(`DATABASE : Querry Error ${query_error}`);
          result.status(500).send('Database query search failed.');
          return ;
        
        }else{

          query_result.forEach( element => {
            api_result.push(element.circuit_name)
          });

          result.json({api_response : api_result});
        }
      }  
    )
  }
)

// Seassion Year Fetcher
backend_app.get(
  "/ui/seassion/", (request, result) => {

    var api_result = [] ;
    var rds_query_string = `SELECT DISTINCT seassion FROM lap_time_table` ; 
    
    rds_connection.query(rds_query_string, 
      (query_error, query_result) => {

        if(query_error) {
            
          console.error(`DATABASE : Querry Error ${query_error}`);
          result.status(500).send('Database query search failed.');
          return ;
        
        }else{

          query_result.forEach( element => {
            api_result.push(element.seassion)
          });

          result.json({api_response : api_result});
        }
      }
    )
  }
)

// Lap Time Graph Data Transformer 
backend_app.get(
  "/graph/Lap_Time/:session_type/:seassion/:race_circuit/" , (request, result) => {

    let api_result = [] ;
    var rds_query_string = ` SELECT driver_name, lap_time FROM lap_time_table WHERE ( seassion = ${request.params.seassion} AND session_type='${request.params.session_type}' AND circuit_name = '${request.params.race_circuit}' AND lap_number > 1 )`

    rds_connection.query(rds_query_string, 
      (query_error, query_result) => {

        if(query_error) {
            
          console.error(`DATABASE : Querry Error ${query_error}`);
          result.status(500).send('Database query search failed.');
          return ;
        
        }else{

          let data_json = {} ;
          let total_laptime_array = [] ;
          
          query_result.forEach( element_json => {
            
            total_laptime_array.push(element_json.lap_time)

            if ( element_json.driver_name in data_json ) {
              
              data_json[element_json.driver_name].push( element_json.lap_time ) ;
            }else{

              data_json[element_json.driver_name] = [ element_json.lap_time ] ;
            }

          });

          total_laptime_array.sort(function(a,b){return a - b});
          
          let data_first_quartile = total_laptime_array[ Math.floor(( total_laptime_array.length + 1 ) * 0.25) ]; 
          let data_third_quartile = total_laptime_array[ Math.floor(( total_laptime_array.length + 1 ) * 0.75) ]; 

          let data_iqr = data_third_quartile - data_first_quartile

          let outliers_upper_limit = data_third_quartile + data_iqr * 1.5 ; 
          let outliers_lower_limit = data_first_quartile - data_iqr * 1.5

          for (let key in data_json) {
            
            let lap_time_array = data_json[key] ; 
            if (lap_time_array.length < 8) {
              continue ;
            }
            lap_time_array.sort(function(a,b){return a - b}); 
            
            lap_time_array =  lap_time_array.filter( val => ( (outliers_lower_limit < val )  && ( val < outliers_upper_limit ))) ;

            let first_quartile = lap_time_array[ Math.floor(( lap_time_array.length + 1 ) * 0.25) ]; 
            let third_quartile = lap_time_array[ Math.floor(( lap_time_array.length + 1 ) * 0.75) ]; 
                  
            outliers = lap_time_array.filter( val => (( first_quartile > val ) || ( val > third_quartile )))

            
            api_result.push(
              {
                violin_plot  : countElements( lap_time_array.map(num => Math.round(num)) ) ,
                box_plot : {
                  x : key, 
                  min : lap_time_array[ 0 ],
                  max : lap_time_array[ lap_time_array.length -1 ], 
                  median : lap_time_array[ Math.round(lap_time_array.length /2) ],
                  first_quartile  : first_quartile , 
                  third_quartile  : third_quartile ,
                  outliers : outliers, 
                },
              } 
            )
          }

          result.json({api_response : api_result});
        }
      }
    )
  }
)

// Tyre Stint Graph Data Transformer
backend_app.get(
  "/graph/Tyre_Stint/:session_type/:seassion/:circuit_name/", (request, result) => {

    api_result = []
    var rds_query_string =  `SELECT driver_name, tyre_compund, stint_duration, stint_number FROM tyre_stint_table WHERE ( seassion = ${request.params.seassion} AND session_type='${request.params.session_type}' AND circuit_name = '${request.params.circuit_name}'  )`
    rds_connection.query(rds_query_string, 
      (query_error, query_result) => {

        if(query_error) {
            
          console.error(`DATABASE : Querry Error ${query_error}`);
          result.status(500).send('Database query search failed.');
          return ;
        
        }else{  
          
          let data_json = {} ;
          query_result.forEach( element_json => {
            
            let key_string = element_json.tyre_compund + '_' + element_json.stint_number.toString()

            if ( !(element_json.driver_name in data_json) ) {
            
              data_json[element_json.driver_name] = { }; 
              data_json[element_json.driver_name][ 'driver_name' ] = element_json.driver_name ; 

            }
            
            data_json[element_json.driver_name][ key_string ] = element_json.stint_duration ;              
              
          });

          Object.values(data_json).forEach(element => {
            api_result.push([element])
          });

          result.json( { api_response : api_result } ) ; 

        } 
      }
    )
  }
)




// Backend Start function
backend_app.listen( 
  8080, () => {
    console.log("Backend server started : Port => 8080");
  }
)






