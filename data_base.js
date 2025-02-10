
// Import Section 
const mysql = require('mysql');


function Update_Race_Table(session_data_json, rds_connection) {

  // Fetch the lap time data from the API

  fetch(`https://api.openf1.org/v1/drivers?session_key=${session_data_json.session_key}`)
  .then(response => response.json())
  .then(data => {
    let driver_map_json = {};

    data.forEach(element => {
      driver_map_json[element.driver_number] = element.name_acronym;
    });

    // Session json datas 
    let year         = session_data_json.year;
    let session_key  = session_data_json.session_key;
    let country_name = session_data_json.country_name;
    let session_type = session_data_json.session_name;
    let circuit_name = session_data_json.circuit_short_name;

    fetch(`https://api.openf1.org/v1/laps?session_key=${session_key}`)
    .then(response => response.json())
    .then(data => {
    
      data.forEach(sub_data => {
        
        // Lap time json datas 
        let lap_number   = sub_data.lap_number;
        let lap_duration = sub_data.lap_duration;
        let sector_one   = sub_data.duration_sector_1;
        let sector_two   = sub_data.duration_sector_2;
        let sector_three = sub_data.duration_sector_3; 
        let sector_one_segments = '['+String(sub_data.segments_sector_1)+']';
        let sector_two_segments = '['+String(sub_data.segments_sector_2)+']';
        let sector_three_segments = '['+String(sub_data.segments_sector_3)+']';
        
        // Driver number to driver name
        let driver_number = String(sub_data.driver_number);
        let driver_name = driver_map_json[driver_number];

        // Insert the data into the database
        let rds_query_string = `INSERT INTO lap_time_table VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        rds_connection.query(rds_query_string, [
          session_key,
          country_name,
          circuit_name,
          session_type,
          year,
          driver_name,
          lap_number,
          lap_duration,
          sector_one,
          sector_two,
          sector_three,
          sector_one_segments,
          sector_two_segments,
          sector_three_segments
        ], (query_error, query_result) => {
          if (query_error) {
            console.error(`DATABASE : Querry Error ${query_error}`);
            return;
          }
        });
      });

      let rds_query_string = `INSERT INTO session_keys_table VALUES ( ${session_key} )` ; 

      rds_connection.query(rds_query_string, (query_error, query_result) => {
        if (query_error) {
          console.error(`DATABASE : Querry Error ${query_error}`);
          return;
        }
      });

    });
  });
};



// Data base update function
function Updata_Database(session_data_json, rds_connection) {

  rds_connection.query(`SELECT session_keys FROM session_keys_table WHERE session_keys = ${session_data_json.session_key}`, (query_error, query_result) => {
    if (query_error) {
      console.error(`BASE : Querry Error : ${query_error}`);
      return;
    }
    
    if(query_result.length == 0) { 
      
      if(session_data_json.session_name == 'Race'){
        Update_Race_Table(session_data_json, rds_connection);
      }

    }

  });
  

};


module.exports = {
  Updata_Database
};
