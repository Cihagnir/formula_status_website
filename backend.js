
// Import Lib's
require("dotenv").config();
const cors = require('cors');
const mysql = require('mysql');
const express = require('express');

// Handmade Imports
const dataBase = require('./data_base.js');
const utils = require('./utils.js');

const cors_conf_json = {
  origin: ["https://main-frontend.d3rpgxvzsb1xs7.amplifyapp.com", "", "http://localhost:3000",],
}

const backend_app = express();
backend_app.use(cors(cors_conf_json));

/** Local MySQL Connection Config (for development) */
var rds_connection = mysql.createConnection({
  user     : 'root',
  password : 'Cg//1234',
  host     : 'localhost',
  database : 'formula_one'
})


/** AWS RDS Connection  
// RDS Connection Config
var rds_connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
})
*/

rds_connection.connect(
  (error) => {
    if (error) {
      console.error(`DATABASE : Connection Status ${error}`);
      return;
    }
    console.log('DATABASE : Connection Status Done');
  }
)

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
}

setInterval( () => {
  console.log('Fetching Data from API');

  // We check the if race is over or not
  fetch('https://api.openf1.org/v1/sessions?session_key=latest')
  .then(response => response.json())
  .then(data => { 
    let race_data_json = data[0] ; 
    let race_date = new Date(race_data_json.date_end); 
    let current_date = new Date(); 

    // If the race is over we call the fucntion to update the database with new data 
    if (current_date >= race_date) {
      dataBase.Updata_Database(race_data_json, rds_connection);
    }
  })
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
  "/ui/year/:year/", (request, result) => {

    var api_result = [];
    var rds_query_string = `SELECT DISTINCT circuit_name FROM lap_time_table WHERE seassion = ${request.params.year}`;

    rds_connection.query(rds_query_string, (query_error, query_result) => {

      if (query_error) {

        console.error(`DATABASE : Querry Error ${query_error}`);
        result.status(500).send('Database query search failed.');
        return;

      } else {

        query_result.forEach(element => {
          api_result.push(element.circuit_name)
        });

        result.json({ api_response: api_result });
      }
    }
    )
  }
)


//  RACE Seassion Year Fetcher
backend_app.get(
  "/ui/seassion/", (request, result) => {

    var api_result = [];
    var rds_query_string = `SELECT DISTINCT seassion FROM lap_time_table`;

    rds_connection.query(rds_query_string,
      (query_error, query_result) => {

        if (query_error) {

          console.error(`DATABASE : Querry Error ${query_error}`);
          result.status(500).send('Database query search failed.');
          return;

        } else {

          query_result.forEach(element => {
            api_result.push(element.seassion)
          });

          result.json({ api_response: api_result });
        }
      }
    )
  }
)


// QUALIFICATION Session Type Fetcher 
backend_app.get(
  "/ui/session_type/:year/:circuit_name", (request, result) => {

    var api_result = [];
    var rds_query_string = `SELECT DISTINCT session_type FROM lap_time_table WHERE (seassion = ${request.params.year} AND circuit_name = '${request.params.circuit_name}' AND session_type LIKE '%Qualifying%')` ;

    rds_connection.query(rds_query_string, (query_error, query_result) => {

      if (query_error) {

        console.error(`DATABASE : Querry Error ${query_error}`);
        result.status(500).send('Database query search failed.');
        return;

      } else {

        query_result.forEach(element => {
          api_result.push(element.session_type)
        });

        result.json({ api_response: api_result });
      }
    }
    )
  }
)


/********  GRAPH DRAWER BACKEND FUNCTION  *********/


// RACE Lap Time Line Graph Data Transformer 
backend_app.get(
  "/graph/Race/Lap_Time_Line/:seassion/:race_circuit/:is_filter/:upper_bound/:lower_bound", (request, result) => {

    let api_result = {};
    let upper_bound = Number(request.params.upper_bound);
    let lower_bound = Number(request.params.lower_bound);
    let is_filter = Boolean(Number(request.params.is_filter));

    var rds_query_string = ` SELECT driver_name, lap_time, lap_number, team_colour FROM lap_time_table WHERE ( seassion = ${request.params.seassion} AND session_type='Race' AND circuit_name = '${request.params.race_circuit}' AND lap_number > 1 )`

    rds_connection.query(rds_query_string,
      (query_error, query_result) => {

        if (query_error) {

          console.error(`DATABASE : Querry Error ${query_error}`);
          result.status(500).send('Database query search failed.');
          return;

        } else {
          
          let team_colour_json = {};
          let total_laptime_array = [];

          query_result.forEach(element => {
            total_laptime_array.push(element.lap_time);
          });
          
          let quartiles = utils.Quartile_Calculater(total_laptime_array, lower_bound, upper_bound);

          if(is_filter){
            total_laptime_array = total_laptime_array.filter(val => ((quartiles.lower_quart < val) && (val < quartiles.upper_quart)));
          }
          
          query_result.forEach(element => {
          
            let lap_time_data = element.lap_time ; 

            if ( is_filter & ((lap_time_data < quartiles.lower_quart) | ( quartiles.upper_quart < lap_time_data)) ){
              lap_time_data = null ; 
            }
            
            if (api_result.hasOwnProperty(element.driver_name)) {
              
              api_result[element.driver_name].push({
                lap_number: element.lap_number,
                lap_time: lap_time_data,
              });
            
            } else {

              team_colour_json[element.driver_name] = element.team_colour;

              api_result[element.driver_name] = [{
                lap_number: element.lap_number,
                lap_time: lap_time_data,
              }];
            }
          });

          result.json({ api_response: { graph_data : api_result, graph_style : team_colour_json} });
        }
      }
    )
  }
)


// RACE Lap Time Distrubation Graph Data Transformer 
backend_app.get(
  "/graph/Race/Lap_Time_Distr/:seassion/:race_circuit/", (request, result) => {

    let api_result = [];
    var rds_query_string = ` SELECT driver_name, lap_time, team_colour FROM lap_time_table WHERE ( seassion = ${request.params.seassion} AND session_type='Race' AND circuit_name = '${request.params.race_circuit}' AND lap_number > 1 )`

    rds_connection.query(rds_query_string,
      (query_error, query_result) => {

        if (query_error) {

          console.error(`DATABASE : Querry Error ${query_error}`);
          result.status(500).send('Database query search failed.');
          return;

        } else {

          let data_json = {};
          let team_colour_json = {}
          let total_laptime_array = [];

          query_result.forEach(element_json => {

            total_laptime_array.push(element_json.lap_time)

            if (element_json.driver_name in data_json) {

              data_json[element_json.driver_name].push(element_json.lap_time);
            } else {

              data_json[element_json.driver_name] = [element_json.lap_time];
              team_colour_json[element_json.driver_name] = element_json.team_colour;
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
                  color : team_colour_json[key],
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
)


// RACE Tyre Stint Graph Data Transformer
backend_app.get(
  "/graph/Race/Tyre_Stint/:seassion/:circuit_name/", (request, result) => {

    api_result = []
    var rds_query_string = `SELECT driver_name, tyre_compund, stint_duration, stint_number FROM tyre_stint_table WHERE ( seassion = ${request.params.seassion} AND session_type='Race' AND circuit_name = '${request.params.circuit_name}'  )`
    rds_connection.query(rds_query_string,
      (query_error, query_result) => {

        if (query_error) {

          console.error(`DATABASE : Querry Error ${query_error}`);
          result.status(500).send('Database query search failed.');
          return;

        } else {

          let data_json = {};
          query_result.forEach(element_json => {

            let key_string = element_json.tyre_compund + '_' + element_json.stint_number.toString()

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
)


// QUALIFICATION Lap Time Graph Data Transformer
backend_app.get(
  "/graph/Qualification/Lap_Time_Bar/:session_type/:seassion/:circuit_name/", (request, result) => {

    api_result = []

    var rds_query_string = `SELECT driver_name, sector_one, sector_two, sector_three, lap_time, lap_start_time  FROM lap_time_table WHERE ( seassion = ${request.params.seassion} AND session_type = '${request.params.session_type}' AND circuit_name = '${request.params.circuit_name}'  )`

    rds_connection.query(rds_query_string,
      (query_error, query_result) => {

        if (query_error) {

          console.error(`DATABASE : Querry Error ${query_error}`);
          result.status(500).send('Database query search failed.');
          return;

        } else {
          
          let driver_lap_json = {} ;

          query_result.forEach( (sub_element) => {

            if(sub_element.lap_time !== 0) {
              
              if (driver_lap_json.hasOwnProperty(sub_element.driver_name)) {

                if(sub_element.lap_time < driver_lap_json[sub_element.driver_name].lap_time ){
                  
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
)


// Backend Start function 
backend_app.listen(
  8080, () => {
    console.log("Backend server started : Port => 8080");
  }
)






