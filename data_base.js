
// Import Section 
const mysql = require('mysql');

// Update the Race Data Tables
function Update_Race_Table(session_data_json, rds_connection) {``

  fetch(`https://api.openf1.org/v1/drivers?session_key=${session_data_json.session_key}`)
  .then(response => response.json())
  .then(data => {

    let driver_map_json = {};
    let team_color_json = {}

    data.forEach(element => {
      driver_map_json[element.driver_number] = element.name_acronym;
      team_color_json[element.name_acronym] = "#" + element.team_colour;
    });

    // Session json datas 
    let year         = session_data_json.year;
    let session_key  = session_data_json.session_key;
    let country_name = session_data_json.country_name;
    let session_type = session_data_json.session_name;
    let circuit_name = session_data_json.circuit_short_name;


    // API call and MySQL Database update for LAP_TIME_TABLE 
    let lap_time_table_status  = fetch(`https://api.openf1.org/v1/laps?session_key=${session_key}`)
    .then(response => response.json())
    .then(data => {
    
      data.forEach(sub_data => {
        
        // Lap time json datas 
        let lap_number   = sub_data.lap_number;
        let lap_duration = sub_data.lap_duration;
        let sector_one   = sub_data.duration_sector_1;
        let sector_two   = sub_data.duration_sector_2;
        let sector_three = sub_data.duration_sector_3; 
        let lap_time_start = 0 ; 

        if (sub_data.date_start !== undefined) {
          lap_time_start = sub_data.date_start;
        }

        
        // Driver number to driver name
        let driver_number = String(sub_data.driver_number);
        let driver_name = driver_map_json[driver_number];
        let team_color = team_color_json[driver_name];

        // Update the LAP_TIME_TABLE 
        let rds_query_string = `INSERT INTO lap_time_table VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        rds_connection.query(rds_query_string, [
          session_key,
          year,
          country_name,
          circuit_name,
          session_type,
          driver_name,
          team_color,
          lap_number,
          lap_duration,
          sector_one,
          sector_two,
          sector_three,
          lap_time_start,
        ], (query_error, query_result) => {
          if (query_error) {
            console.error(`DATABASE : Querry Error for Lap Time Table ${query_error}`);
            return false;
          }
        }); // End of the rds query
      }); // End of the for loop 
      return true
    }); // End of whole update

    // API call and MySQL Database update for  TYRE_STINT_TABLE
    fetch(`https://api.openf1.org/v1/stints?session_key=${session_key}`)
    .then(response => response.json())
    .then(data => {

      data.forEach( sub_data => {

        let driver_number = String(sub_data.driver_number);
        let driver_name = driver_map_json[driver_number];
        let compound = sub_data.compound;
        let stint_number = sub_data.stint_number;
        let tyre_age = sub_data.tyre_age_at_start;
        let stint_duration = sub_data.lap_end - sub_data.lap_start;

        let rds_query_string = `INSERT INTO tyre_stint_table VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        rds_connection.query(rds_query_string, [
          session_key,
          country_name,
          circuit_name,
          session_type,
          year,
          driver_name,
          compound,
          tyre_age,
          stint_duration,
          stint_number,
        ], (query_error, query_result) => {
          if (query_error) {
            console.error(`DATABASE : Querry Error for Tyre Stint Table  ${query_error}`);
            return;
          }
        }); // End of the rds querry
      }) // End of for loop
      return true
    }); // End of whole update


    // Update the SEASSION_KEYS Table to create legit check section 
    let rds_query_string = `INSERT INTO session_keys_table VALUES ( ${session_key} )` ; 

    rds_connection.query(rds_query_string, (query_error, query_result) => {
      if (query_error) {
        console.error(`DATABASE : Querry Error for Session Keys Table  ${query_error}`);
        return false;
      }
    }); // End of the rds querry

  });// End of the ENTIRE updata 


};


// Update the Qualificatoin Data Tables
function Update_Race_Table(session_data_json, rds_connection) {

  fetch(`https://api.openf1.org/v1/drivers?session_key=${session_data_json.session_key}`)
  .then(response => response.json())
  .then(data => {

    let driver_map_json = {};
    let team_color_json = {}

    data.forEach(element => {
      driver_map_json[element.driver_number] = element.name_acronym;
      team_color_json[element.name_acronym] = "#" + element.team_colour;
    });

    // Session json datas 
    let year         = session_data_json.year;
    let session_key  = session_data_json.session_key;
    let country_name = session_data_json.country_name;
    let session_type = session_data_json.session_name;
    let circuit_name = session_data_json.circuit_short_name;


    // API call and MySQL Database update for LAP_TIME_TABLE 
    let lap_time_table_status  = fetch(`https://api.openf1.org/v1/laps?session_key=${session_key}`)
    .then(response => response.json())
    .then(data => {
    
      data.forEach(sub_data => {
        
        // Lap time json datas 
        let lap_number   = sub_data.lap_number;
        let lap_duration = sub_data.lap_duration;
        let sector_one   = sub_data.duration_sector_1;
        let sector_two   = sub_data.duration_sector_2;
        let sector_three = sub_data.duration_sector_3; 
        let lap_time_start = 0 ; 

        if (sub_data.date_start !== undefined) {
          lap_time_start = sub_data.date_start;
        }

        
        // Driver number to driver name
        let driver_number = String(sub_data.driver_number);
        let driver_name = driver_map_json[driver_number];
        let team_color = team_color_json[driver_name];

        // Update the LAP_TIME_TABLE 
        let rds_query_string = `INSERT INTO lap_time_table VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        rds_connection.query(rds_query_string, [
          session_key,
          year,
          country_name,
          circuit_name,
          session_type,
          driver_name,
          team_color,
          lap_number,
          lap_duration,
          sector_one,
          sector_two,
          sector_three,
          lap_time_start,
        ], (query_error, query_result) => {
          if (query_error) {
            console.error(`DATABASE : Querry Error for Lap Time Table ${query_error}`);
            return false;
          }
        }); // End of the rds query
      }); // End of the for loop 
      return true
    }); // End of whole update

    // Update the SEASSION_KEYS Table to create legit check section 
    let rds_query_string = `INSERT INTO session_keys_table VALUES ( ${session_key} )` ; 

    rds_connection.query(rds_query_string, (query_error, query_result) => {
      if (query_error) {
        console.error(`DATABASE : Querry Error for Session Keys Table  ${query_error}`);
        return false;
      }
    }); // End of the rds querry
  });// End of the ENTIRE updata 
};



// Data base update function
function Updata_Database(session_data_json, rds_connection) {

  rds_connection.query(`SELECT session_keys FROM session_keys_table WHERE session_keys = ${session_data_json.session_key}`, (query_error, query_result) => {
    if (query_error) {
      console.error(`BASE : Querry Error : ${query_error}`);
      return;
    }
    
    if(query_result.length == 0) { 
      
      // That if chain for to decided to which seassion data we have . 
      if(session_data_json.session_name == 'Race'){
        Update_Race_Table(session_data_json, rds_connection);
      }
      if(session_data_json.session_name.includes('Qualifying')){
        Update_Race_Table(session_data_json, rds_connection);
      }

    }
  });
};


module.exports = {
  Updata_Database
};
