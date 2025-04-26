
// Import Section 
const utils = require('./utils.js');

const LOCAL_DEBUG_SETTING = false ; // It's is exist in order to debug the each file indivually. 
const DEBUG_SETTING = utils.GLOBAL_DEBUG_SETTING || LOCAL_DEBUG_SETTING ;

// Race Data Handler
async function Handle_Race_Data( session_data_json, rds_connection ) {
  
 return new Promise( async (resolve, reject) => {

    // Data Retrival Section
    let race_time_info_json = await utils.Race_Start_Finish_Time( session_data_json.session_key );
    ( DEBUG_SETTING ) ? ( console.log(`Session Key : ${session_data_json.session_key}: Step 1 `) ) : null ;

    let driver_info_json = await utils.Driver_Info( session_data_json.session_key );
    ( DEBUG_SETTING ) ? ( console.log(`Session Key : ${session_data_json.session_key}: Step 2 `) ) : null ;

    let raw_lap_time_info_json = await utils.Driver_Lap_Time( session_data_json.session_key, driver_info_json.driver_name_json );
    ( DEBUG_SETTING ) ? ( console.log(`Session Key : ${session_data_json.session_key}: Step 3 `) ) : null ;

    let fixed_lap_time_info_json = await utils.Lap_Time_Cleaner( raw_lap_time_info_json.driver_lap_time_json, race_time_info_json.start_time_date_obj, race_time_info_json.finish_time_date_obj ); 
    ( DEBUG_SETTING ) ? ( console.log(`Session Key : ${session_data_json.session_key}: Step 4 `) ) : null ;

    let driver_position_info_json = await utils.Driver_Position( session_data_json.session_key, driver_info_json.driver_name_json, fixed_lap_time_info_json.fixed_lap_time_json, race_time_info_json.start_time_date_obj ); 
    ( DEBUG_SETTING ) ? ( console.log(`Session Key : ${session_data_json.session_key}: Step 5 `) )  : null ;

    let driver_interval_info_json = await utils.Driver_Interval( session_data_json.session_key, driver_info_json.driver_name_json, fixed_lap_time_info_json.fixed_lap_time_json, race_time_info_json.finish_time_date_obj ) ;
    ( DEBUG_SETTING ) ? ( console.log(`Session Key : ${session_data_json.session_key}: Step 6 `) ) : null ;

    let tyre_stint_info_json = await utils.Tyre_Stint_Lap_Cleaner( session_data_json.session_key, driver_info_json.driver_name_json,  fixed_lap_time_info_json.missing_lap_json );
    ( DEBUG_SETTING ) ? ( console.log(`Session Key : ${session_data_json.session_key}: Step 7 `) ) : null ;


    // Data Insertion Section
    for ( const [ driver_number, driver_name ] of Object.entries( driver_info_json.driver_name_json ) ) {
      
      let driver_lap_time_json = fixed_lap_time_info_json.fixed_lap_time_json[ driver_number ];

      // Lap time for loop
      for ( const [ _, lap_time_info_json ] of Object.entries( driver_lap_time_json ) ) {

        let sql_querry_string  = ` INSERT INTO lap_time_table VALUES ( 
          ${ session_data_json.session_key }, 
          ${ session_data_json.year }, 
          '${ session_data_json.country_name }', 
          '${ session_data_json.circuit_short_name }', 
          '${ session_data_json.session_type }', 
          '${ session_data_json.session_name }', 
          '${ 'Race' }', 
          '${ driver_name }', 
          ${ driver_number }, 
          '#${ driver_info_json.driver_color_json[ driver_name ] }', 
          ${ lap_time_info_json.is_missing }, 
          ${ lap_time_info_json.lap_number_api },
          ${ lap_time_info_json.lap_number_fix }, 
          '${ lap_time_info_json.date_start }', 
          ${ lap_time_info_json.lap_duration }, 
          ${ lap_time_info_json.duration_sector_1 }, 
          ${ lap_time_info_json.duration_sector_2 }, 
          ${ lap_time_info_json.duration_sector_3 } 
         )` ;

        await utils.SQL_Querry_Controler( sql_querry_string, rds_connection ) ;

      }; // End of Lap Time For Loop

      let driver_tyre_stint_array = tyre_stint_info_json.tyre_stint_json[ driver_number ];

      // Tyre stint for loop 
      if (driver_tyre_stint_array ) {
        

        driver_tyre_stint_array.forEach( async ( stint_json ) => {

          let sql_querry_string  = `INSERT INTO tyre_stint_table VALUES (
            ${ session_data_json.session_key }, 
            ${ session_data_json.year }, 
            '${ session_data_json.country_name }', 
            '${ session_data_json.circuit_short_name }', 
            '${ session_data_json.session_type }', 
            '${ session_data_json.session_name }', 
            '${ driver_name }', 
            ${ driver_number }, 
            '#${ driver_info_json.driver_color_json[ driver_name ] }', 
            ${ stint_json.tyre_age }, 
            '${ stint_json.compound }', 
            ${ stint_json.stint_number }, 
            ${ stint_json.stint_duration } 
          )`;

          await utils.SQL_Querry_Controler( sql_querry_string, rds_connection ) ;
        }); // End of Tyre Stint For Loop
      }

      if ( driver_position_info_json.driver_position_json.hasOwnProperty( driver_number) ) {

        let driver_position_json = driver_position_info_json.driver_position_json[ driver_number ] ; 

        for ( const [ lap_number, driver_position ] of Object.entries( driver_position_json ) ){ 

          let sql_querry_string = ` INSERT INTO position_interval_table VALUES ( 
            ${ session_data_json.session_key },
            ${ session_data_json.year },
            '${ session_data_json.country_name }',
            '${ session_data_json.circuit_short_name }',
            '${ session_data_json.session_type }',
            '${ session_data_json.session_name }',
            '${ driver_name }',
            ${ driver_number },
            '#${ driver_info_json.driver_color_json[ driver_name ] }',
            ${ lap_number },
            ${ driver_position },
            ${ -2 },
            '${ 0 }'
           );`
 
           await utils.SQL_Querry_Controler( sql_querry_string, rds_connection ) ;
         };
      }

      if ( (  driver_interval_info_json.interval_json.hasOwnProperty(driver_number) ) ) {

        let driver_interval_array = driver_interval_info_json.interval_json[ driver_number ];
        
        
        driver_interval_array.forEach( async ( interval_json ) => {

          let sql_querry_string = ` INSERT INTO position_interval_table VALUES ( 
           ${ session_data_json.session_key },
           ${ session_data_json.year },
           '${ session_data_json.country_name }',
           '${ session_data_json.circuit_short_name }',
           '${ session_data_json.session_type }',
           '${ session_data_json.session_name }',
           '${ driver_name }',
           ${ driver_number },
           '#${ driver_info_json.driver_color_json[ driver_name ] }',
           ${ interval_json.lap_number },
           ${ interval_json.position },
           ${ interval_json.interval },
           '${ interval_json.date }'
          );`

          await utils.SQL_Querry_Controler( sql_querry_string, rds_connection ) ;

        }); // End of Lap Number For Loop
      } // End of Driver Interval If Chain
    } // End of Driver Number For Loop

    resolve(true); // Resolve the Promise
 }) // End of Promise 
}

// Qualifying Data Handler
async function Handle_Qualifying_Data( session_data_json, rds_connection ) {
  
  return new Promise( async (resolve, reject) => {
    
    let qualifying_time_info_json = await utils.Quali_Start_Finish_Time( session_data_json.session_key );
    ( DEBUG_SETTING ) ? ( console.log(`Session Key : ${session_data_json.session_key}: Step 1 `) ) : null ;

    let driver_info_json = await utils.Driver_Info( session_data_json.session_key );
    ( DEBUG_SETTING ) ? ( console.log(`Session Key : ${session_data_json.session_key}: Step 2 `) ) : null ;

    let raw_lap_time_info_json = await utils.Driver_Lap_Time( session_data_json.session_key, driver_info_json.driver_name_json );
    ( DEBUG_SETTING ) ? ( console.log(`Session Key : ${session_data_json.session_key}: Step 3 `) ) : null ;


    for (const [ driver_number, driver_name ] of Object.entries( driver_info_json.driver_name_json ) ) {

      let driver_lap_time_array = raw_lap_time_info_json.driver_lap_time_json[ driver_number ];

      driver_lap_time_array.forEach( async ( lap_time_json ) => {
        
        let lap_subsession = null ; 
        let lap_start_time_date_obj = new Date( lap_time_json.date_start );


        for ( const [ subsession_name, subsession_time_dict ] of Object.entries( qualifying_time_info_json.quali_time_json ) ){

          if ( (subsession_time_dict.start_time <= lap_start_time_date_obj ) && ( lap_start_time_date_obj <= subsession_time_dict.end_time ) ) {
            lap_subsession = subsession_name;
            break;
          }
        }

        let sql_querry_string  = `INSERT INTO lap_time_table VALUES ( 
          ${ session_data_json.session_key }, 
          ${ session_data_json.year }, 
          '${ session_data_json.country_name }', 
          '${ session_data_json.circuit_short_name }', 
          '${ session_data_json.session_type }', 
          '${ session_data_json.session_name }', 
          '${ lap_subsession }', 
          '${ driver_name }', 
          ${ driver_number }, 
          '#${ driver_info_json.driver_color_json[ driver_name ] }', 
          ${ null }, 
          ${ lap_time_json.lap_number }, 
          ${ lap_time_json.lap_number }, 
          '${ lap_time_json.date_start }', 
          ${ lap_time_json.lap_duration }, 
          ${ lap_time_json.duration_sector_1 }, 
          ${ lap_time_json.duration_sector_2 }, 
          ${ lap_time_json.duration_sector_3 } 
        )` ;

        await utils.SQL_Querry_Controler( sql_querry_string, rds_connection ) ;


      }); // End of Lap Time For Each Loop
    }; // End of Driver Number For Loop
    resolve(true); // Resolve the Promises
  }); // End of Promise
}



// Data base update function
async function Updata_Database(session_data_json, rds_connection) {

  return new Promise( async (resolve, reject) => { 

    let sql_querry_string = `SELECT session_key FROM session_keys_table WHERE session_key = ${session_data_json.session_key}` ; 

    let querry_result = await utils.SQL_Querry_Controler( sql_querry_string, rds_connection ) ;

    if(querry_result.length == 0) { 

      let is_handled = false ;
        
      // That if chain for to decided to which seassion data we have . 
      if( session_data_json.session_type.includes('Race') ){
        
        await Handle_Race_Data(session_data_json, rds_connection);
        is_handled = true ;

        ( DEBUG_SETTING ) ?( console.log(`Race Data Inserted session_key : ${session_data_json.session_key}`) ) : null ;
      }
      
      if( session_data_json.session_type.includes('Qualifying') ){

        await Handle_Qualifying_Data(session_data_json, rds_connection);
        is_handled = true ;
        
        ( DEBUG_SETTING ) ? ( console.log(`Qualification Data Inserted session_key : ${session_data_json.session_key}`) ) : null ;
      }
      // Insert the session key into the session_keys_table

      if (is_handled) {
        let sql_querry_string  = `INSERT INTO session_keys_table VALUES ( ${session_data_json.session_key} )` ;

        let querry_result = await utils.SQL_Querry_Controler( sql_querry_string, rds_connection ) ;
  
        if(! querry_result){
          resolve(false); 
        }
        ( DEBUG_SETTING ) ? ( console.log(`Session Key Inserted : ${session_data_json.session_key}`) ) : null ;
  
        resolve(true); // Resolve the Promises
      }
      else {
        resolve(false); // Resolve the Promises
      }


    }
    else {
      resolve(false); // Resolve the Promises
    }
    

  });
};


module.exports = {
  Updata_Database
};
