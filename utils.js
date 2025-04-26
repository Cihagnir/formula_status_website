

////
/// Constants Defines Used on Backend
////

const GLOBAL_DEBUG_SETTING = false ; // Set the debug mode to true or false





////
// General Backend Functions
////

const Average_Array = array => array.reduce((a, b) => a + b) / array.length;

// Calculate the upper and lower quartiles from array
function Quartile_Calculater(input_array, lower_filter_rate = 1.5, upper_filter_rate = 1.5) {

  input_array.sort(function (a, b) { return a - b });

  let data_first_quartile = input_array[Math.floor((input_array.length + 1) * 0.25)];
  let data_third_quartile = input_array[Math.floor((input_array.length + 1) * 0.75)];

  let data_iqr = data_third_quartile - data_first_quartile

  let outliers_lower_limit = data_first_quartile - data_iqr * lower_filter_rate;
  let outliers_upper_limit = data_third_quartile + data_iqr * upper_filter_rate;

  return { upper_quart : outliers_upper_limit, lower_quart : outliers_lower_limit }

}

/** Return Structure
  is_race_end : true/false
*/
async function Is_Race_End(session_key) {

  return new Promise( async (resolve, reject) => {

    let is_race_end = false ;
    let current_date = new Date() ;

    let session_time_info_json = await Race_Start_Finish_Time(session_key) ;

    if ( session_time_info_json.finish_time_date_obj === null ) {
      if ( session_time_info_json.session_finish_time_date_obj < current_date ) {
        is_race_end = true ;
      }
    }
    else{
      if ( session_time_info_json.finish_time_date_obj < current_date ) {
        is_race_end = true ;
      }
    }

    resolve(is_race_end) ;
  });
}

async function API_Fetch_Request(url_string) {
  
  return new Promise( async ( resolve, rejects) => {

    let retry_limit = 5 ;
    let retry_count = 0 ; 

    while (retry_count < retry_limit ){

      try{
        
        let api_response = await fetch(url_string) ; 
        
        if ( ! api_response.ok ) {
          retry_count += 1 ;
          // Using a Promise-based timeout since we're in an async function
          await new Promise(resolve => setTimeout(resolve, retry_count * 1000));
          continue ;
        }
        
        const content_type = api_response.headers.get('content-type');
        if ( ! content_type || ! content_type.includes('application/json') ) {
          retry_count += 1 ;
          await new Promise(resolve => setTimeout(resolve, retry_count * 1000));
          continue ;
        }
        resolve( await api_response.json() ) ;
        break ;
      }catch (error) {
        await new Promise(resolve => setTimeout(resolve, retry_count * 1000));
        retry_count += 1 ;
      };
    };

  });
}

async function SQL_Querry_Controler(sql_querry_string, rds_connection) {

  return new Promise( async (resolve, reject) => {


    rds_connection.query( sql_querry_string, (error, results) => {

      if (error) {
        console.error(`DATABASE : Connection Status ${error}`);
        console.log(`SQL QUERRY STRING : ${sql_querry_string}`);
        reject(error);

      }else{
        resolve(results);
      }
    }); 

  });
  
}


////
// API Data Fetch and Handling Functions
////


/** Return Json Structure
  { 
   lap_number : race_lap_number
   start_time_date_obj : start_time_date_obj,   
   finish_time_date_obj : finish_time_date_obj, 
   session_finish_time_date_obj : session_finish_time_date_obj,
  }
*/
async function Race_Start_Finish_Time(session_key) {

  return new Promise( async (resolve, reject) => {

    let race_lap_number = null ;
    let start_time_date_obj = null ;
    let finish_time_date_obj = null ;

    let session_url_string = `https://api.openf1.org/v1/sessions?session_key=${session_key}`;
    let json_data_array = await API_Fetch_Request(session_url_string) ;

    let session_info_json = json_data_array[0] ;
    let session_time_start_date_obj = new Date( session_info_json.date_start ) ;
    let session_finish_time_date_obj = new Date( session_info_json.date_end ) ;

    let race_control_url_string = `https://api.openf1.org/v1/race_control?session_key=${session_key}` ;
    let race_control_array = await API_Fetch_Request(race_control_url_string)

    
    race_control_array.forEach( current_json => {

      // Check the if message null or not. Just to be sure 
      if ( current_json.message != null ) {
        
        if ( current_json.message.includes( "GREEN LIGHT" ) ) {
          let temp_start_time_date_obj = new Date( current_json.date ) ;

          if ( temp_start_time_date_obj > session_time_start_date_obj ) {
            start_time_date_obj = temp_start_time_date_obj ;
          }
        }
        
        if ( current_json.message.includes( "CHEQUERED FLAG" ) ) {
          finish_time_date_obj = new Date( current_json.date ) ;
          race_lap_number = current_json.lap_number ; 
        }
      }
    });

    if ( start_time_date_obj === null ) {
      start_time_date_obj = session_time_start_date_obj ;
    }


  resolve( { start_time_date_obj : start_time_date_obj, finish_time_date_obj : finish_time_date_obj, session_finish_time_date_obj :session_finish_time_date_obj, lap_number : race_lap_number } ) 
  })
}


/** Return Json Structure
  { 
   quali_time_json : quali_time_json   -> quali_sub_session_name : { start_time, end_time } || Q1 : { start_time_date_obj, end_time_date_obj }
  }
*/
async function Quali_Start_Finish_Time(session_key) {

  return new Promise( async (resolve, reject) => {

    let quali_time_json = {};
    let sub_session_number = 1 ;

    const sub_session_string = () => 'Q' + String(sub_session_number);

    let race_control_url_string = `https://api.openf1.org/v1/race_control?session_key=${session_key}` ;

    let race_control_array = await API_Fetch_Request(race_control_url_string)

    race_control_array.forEach( current_json => {

      if ( current_json.message.includes( "GREEN LIGHT" ) ){
        quali_time_json[ sub_session_string() ] = {}
        quali_time_json[ sub_session_string() ][ 'start_time' ] = new Date( current_json.date );
      }
      else if ( current_json.message.includes( "CHEQUERED FLAG" ) ){

        if (quali_time_json.hasOwnProperty( sub_session_string() )) {
          quali_time_json[ sub_session_string() ][ 'end_time' ] = new Date( current_json.date );
          sub_session_number += 1 ;
        }
      } 
    });

    resolve( { quali_time_json : quali_time_json } );

  });
}


/** Return Json Structure
  { 
   driver_name_json : driver_name_json,       -> driver_number : driver_name_acronym
   driver_color_json : driver_color_json      -> driver_name_acronym : team_color
  }
*/
async function Driver_Info(session_key) {

  return new Promise( async (resolve, rejects) => {

    let driver_info_url_string = `https://api.openf1.org/v1/drivers?session_key=${session_key}` ;
    let driver_info_array = await API_Fetch_Request(driver_info_url_string) ;

    // let driver_info_response = await fetch(driver_info_url_string);
    // let driver_info_array = await driver_info_response.json();

    let driver_name_json = {} ; 
    let driver_color_json = {} ;

    driver_info_array.forEach( current_json => {

      driver_name_json[ current_json.driver_number ] = current_json.name_acronym ; 
      driver_color_json[ current_json.name_acronym ] = current_json.team_colour ;
    });

    resolve( { driver_name_json : driver_name_json, driver_color_json : driver_color_json } ) ; 
  });
}


/** Return Json Structure
  { 
   driver_lap_time_json : driver_lap_time_json      -> driver_number : lap_time_array
  }
*/
async function Driver_Lap_Time(session_key, driver_dict) {

  return new Promise( async (resolve, reject) => {

    let driver_lap_time_json = {}

      
    for (const [driver_number, driver_name] of Object.entries(driver_dict)) {

      let driver_info_url_string = `https://api.openf1.org/v1/laps?session_key=${session_key}&driver_number=${driver_number}` ; 

      try {
        
        // That is not transfered into the API_Fetch_Request function because we need to catch the error if the driver has no lap time
        let lap_time_info_response = await fetch(driver_info_url_string) ; 
        let lap_time_info_array = await lap_time_info_response.json() ;

        driver_lap_time_json[driver_number] = lap_time_info_array ; 
  
      }catch (error) {
        driver_lap_time_json[driver_number] = [] ;
      }

    };

    resolve( {driver_lap_time_json : driver_lap_time_json} );
  });
}


/** Return Json Structure
  { 
   driver_lap_time_json : driver_lap_time_json,           ->  lap_number : lap_info_json
   driver_missing_lap_json : driver_missing_lap_json      ->  driver_number : [ { lap_number_start, number_of_lap_missing } ]
  }
*/
async function Lap_Time_Fixer (driver_lap_time_array, race_start_time_date_obj, race_finish_time_date_obj) {

  return new Promise( ( resolve, reject ) => {

    let lap_number = 1 ;
    let driver_lap_time_json = {};
    let driver_missing_lap_json = {};

    const sec_to_milisec = ( seconds ) => seconds * 1000 ;  

    /** Edge Case Defines 
      Edge Case 1 : 
        > When the driver be dnf at that lap " lap_duration " will be null 
        > Also it's happeds when the API fucked up. We could fill the missing laps with the chequered flag time but we have to find way to disquinsh it from the upper case 

      Edge Case 2 :
        > When it's start lap it's will be missing the lap duration and the start time. We calculate that from the " Green Light " message from race control.

      Edge Case 3 :
        > Some of the laps are missing in the API. We need to fill that with the other lap's duration and the start time information. 
     */


    for (let index = 0; index < driver_lap_time_array.length; index++) {
      
      const current_json = driver_lap_time_array[index];
      
      let lap_start_time_iso = current_json.date_start ;
      let lap_duration_number = current_json.lap_duration ;
      
      if (lap_start_time_iso && lap_duration_number) {
        
        let lap_duration_date_obj = new Date( sec_to_milisec( lap_duration_number ) );
        let lap_start_time_date_obj = new Date( lap_start_time_iso );

        let lap_json = {
          'driver_number' : current_json.driver_number, 
          'lap_duration' : lap_duration_number,
          'date_start' : lap_start_time_iso, 
          "lap_number_api" : current_json.lap_number,
          "lap_number_fix" : lap_number,  
          "is_missing" : 0,
          "is_pit_out_lap" : current_json.is_pit_out_lap,
          "duration_sector_1" : current_json.duration_sector_1, 
          "duration_sector_2" : current_json.duration_sector_2, 
          "duration_sector_3" : current_json.duration_sector_3,
        }

        driver_lap_time_json[ lap_number.toString() ] = lap_json ; 

        lap_number += 1 ;
        
        let next_lap_json = driver_lap_time_array[ index + 1 ] ;
        
        if ( next_lap_json ) {
          
          let next_lap_start_time_date_obj = new Date( next_lap_json.date_start ) ;
          
          let time_diff_btwn_laps_date_obj = new Date( next_lap_start_time_date_obj - lap_start_time_date_obj ) ;

          if ( ( lap_duration_date_obj * 1.1 ) < time_diff_btwn_laps_date_obj ) {
            
            let missing_lap_number = Math.round(time_diff_btwn_laps_date_obj / lap_duration_date_obj) - 1 ;

            // Missing lap json chekc for the Tyre Stint Data 
            if (driver_missing_lap_json.hasOwnProperty( missing_lap_number.toString() ) ) {
              driver_missing_lap_json[ current_json.driver_number.toString() ].push( 
                {
                  "lap_number" : current_json.lap_number, 
                  "missing_lap" : missing_lap_number,
                }
               ) ;
            }

            else {
              driver_missing_lap_json[ current_json.driver_number.toString() ] = [] ;
              driver_missing_lap_json[ current_json.driver_number.toString() ].push( 
                {
                  "lap_number" : current_json.lap_number, 
                  "missing_lap" : missing_lap_number,
                }
               ) ;
            }

            let temp_lap_start_time_date_obj = lap_start_time_date_obj ; 

            for( let _ = 0 ; _ < missing_lap_number ; _++ ){
              
              temp_lap_start_time_date_obj = new Date( temp_lap_start_time_date_obj.getTime() + lap_duration_date_obj.getTime() ) ;

              if ( new Date( temp_lap_start_time_date_obj.getTime() + lap_duration_date_obj.getTime() ) < next_lap_start_time_date_obj ) {
                
                let lap_json = {
                  'driver_number' : current_json.driver_number, 
                  'lap_duration' : lap_duration_number,
                  'date_start' : temp_lap_start_time_date_obj.toISOString(), 
                  "lap_number_api" : current_json.lap_number,
                  "lap_number_fix" : lap_number,  
                  "is_missing" : 1,
                  "is_pit_out_lap" : current_json.is_pit_out_lap,
                  "duration_sector_1" : current_json.duration_sector_1, 
                  "duration_sector_2" : current_json.duration_sector_2, 
                  "duration_sector_3" : current_json.duration_sector_3,
                }

                driver_lap_time_json[ lap_number.toString() ] = lap_json ; 

                lap_number += 1 ;                 
              } // If Condition End  
            } // For Loop End 
          } // If Condition End
        } // If Condition End
      } // If Condition End

      else if ( ( lap_start_time_iso === null ) && ( driver_lap_time_array[ index + 1 ] !== undefined ) ) {

 
          let next_lap_start_time_iso = driver_lap_time_array[ index + 1 ].date_start ;
          let next_lap_start_time_date_obj = new Date( next_lap_start_time_iso ) ;

          let lap_duration_number = ( next_lap_start_time_date_obj - race_start_time_date_obj ) / 1000 ;
          
          let lap_json = {
            'driver_number' : current_json.driver_number, 
            'lap_duration' : lap_duration_number,
            'date_start' : race_start_time_date_obj.toISOString(), 
            "lap_number_api" : current_json.lap_number,
            "lap_number_fix" : lap_number,   
            "is_missing" : 0,
            "is_pit_out_lap" : current_json.is_pit_out_lap,
            "duration_sector_1" : current_json.duration_sector_1, 
            "duration_sector_2" : current_json.duration_sector_2, 
            "duration_sector_3" : current_json.duration_sector_3,
          }
          
          // We fill the sector one if it's only null sector we have on the lap. [ That is the case when we are at the start lap of the race ]
          if ( ( current_json.duration_sector_1 === null ) &&  current_json.duration_sector_2 && current_json.duration_sector_3)   {
            let sector_one_duration = ( lap_duration_number - current_json.duration_sector_2 - current_json.duration_sector_3 )  ;
            lap_json.duration_sector_1 = sector_one_duration ;
          }
          
          driver_lap_time_json[ lap_number.toString() ] = lap_json ; 
          lap_number += 1 ;    
          
      }// Else If Condition End
    } // General For Loop End

    resolve( { driver_lap_time_json : driver_lap_time_json, driver_missing_lap_json : driver_missing_lap_json } ) ;
  }); // Promise End 
}

/** Return Json Structure 
  { 
    fixed_lap_time_json : fixed_lap_time_json,      -> driver_number : lap_time_info_json 
    missing_lap_json : missin_lap_json              -> driver_number : [ { lap_number_start, number_of_lap_missing } ]
  }
*/
async function Lap_Time_Cleaner (lap_time_json, race_start_time_date_obj) {

  return new Promise( async (resolve, reject) => {


    let fixed_lap_time_json = {};
    let missin_lap_json = {} ; 

    for (const [driver_number, values] of Object.entries(lap_time_json)) {
      
      let lap_time_json = await Lap_Time_Fixer(values, race_start_time_date_obj) ;

      fixed_lap_time_json[ driver_number ] = lap_time_json.driver_lap_time_json ;

      if ( lap_time_json.driver_missing_lap_json.hasOwnProperty( driver_number ) ) {
        missin_lap_json[ driver_number ] = lap_time_json.driver_missing_lap_json[ driver_number ] ;
      }
      else {
        missin_lap_json[ driver_number ] = [] ;
      }

    }
    
    resolve( { fixed_lap_time_json : fixed_lap_time_json, missing_lap_json : missin_lap_json } )  ;

  });

}


/** Return Json Structure 
  { 
    tyre_stint_json : tyre_stint_json     -> driver_number : [ tyre_stint_info_json, ... ]
  }
*/
async function Tyre_Stint_Lap_Cleaner(session_key, driver_json, missing_lap_json) {
  
  return new Promise( async (resolve, reject) => { 

    let tyre_stint_json = {} ;

    for ( const [driver_number, driver_name] of Object.entries(driver_json) ) {

      let tyre_stint_info_url_string = `https://api.openf1.org/v1/stints?session_key=${session_key}&driver_number=${driver_number}` ;
      let tyre_stint_info_array = await API_Fetch_Request(tyre_stint_info_url_string) ;

      // let tyre_stint_info_response = await fetch(tyre_stint_info_url_string) ;
      // let tyre_stint_info_array = await tyre_stint_info_response.json() ;
      
      let prev_stint_end_lap_number = 0 ;

      tyre_stint_info_array.forEach( current_json => {
        
        let stint_end_lap_number = current_json.lap_end ;
        let stint_start_lap_number = current_json.lap_start ;

        if ( stint_start_lap_number === 1 ) {
          stint_start_lap_number = 0 ;
        }

        if ( stint_start_lap_number != prev_stint_end_lap_number ) {
          stint_start_lap_number = prev_stint_end_lap_number ;          
        }


        // try catch block at python code || Check if driver has missing lap 
        if ( missing_lap_json.hasOwnProperty( driver_number ) ) {

          missing_lap_json[ driver_number ].forEach( current_missing_lap_json => {
            
            if ( ( stint_start_lap_number < missing_lap_json.lap_number ) && ( missing_lap_json.lap_number < stint_end_lap_number ) ) {
              stint_end_lap_number += missing_lap_json.lap_number
            }
          });
        }

        let stint_json = { 
          'driver_number' : driver_number,
          'compound' : current_json.compound,
          'tyre_age' : current_json.tyre_age_at_start,
          'lap_start' : stint_start_lap_number,
          'lap_end' : stint_end_lap_number,
          'stint_duration' : stint_end_lap_number - stint_start_lap_number,
          'stint_number' : current_json.stint_number,
        }

        if ( ! tyre_stint_json.hasOwnProperty( driver_number ) ) {
          tyre_stint_json[ driver_number ] = [] ;
        }

        tyre_stint_json[ driver_number ].push( stint_json ) ;

        prev_stint_end_lap_number = stint_end_lap_number ;
      }); // Stint For Loop End
    }; // Driver For Loop End

    resolve( { tyre_stint_json : tyre_stint_json } ) ;
  });

}


/** Return Json Structure 
  { 
    driver_position_json : driver_position_json   -> driver_number : { lap_number : position }
  }
*/
async function Driver_Position(session_key, driver_json, driver_lap_time_json, start_time_date_obj) {

  return new Promise( async (resolve, reject) => {
    
    let driver_position_json = {} ;
    let driver_position_detiled_json = {} ;

    for ( const [driver_number, driver_name] of Object.entries(driver_json) ) {
      
      
      let driver_position_url_string = `https://api.openf1.org/v1/position?session_key=${session_key}&driver_number=${driver_number}` ;
      let driver_position_array = await API_Fetch_Request(driver_position_url_string) ;

      let driver_lap_json = driver_lap_time_json[ driver_number ] ;

      driver_position_array.forEach( current_json => {
        
        let position_sample_time_iso_string = current_json.date ; 
        let position_sample_time_date_obj = new Date( position_sample_time_iso_string ) ;
        

        if ( position_sample_time_date_obj <= start_time_date_obj ) {

          driver_position_json[ driver_number.toString() ] = {} ;
          driver_position_json[ driver_number.toString() ][ '0' ] = current_json.position ;
          
          driver_position_detiled_json[ driver_number.toString() ] = {} ;
          driver_position_detiled_json[ driver_number.toString() ][ '0' ] = current_json.position ;

        
        }else{

          for( const [ lap_number, lap_info_json ]  of Object.entries( driver_lap_json ) ) {

            let lap_start_time_date_obj = new Date( lap_info_json.date_start ) ;
            
            let lap_end_time_date_obj = new Date ( lap_info_json.date_start );
            lap_end_time_date_obj.setSeconds( lap_end_time_date_obj.getSeconds() + lap_info_json.lap_duration ) ;

            if ( ( lap_start_time_date_obj <= position_sample_time_date_obj ) && ( position_sample_time_date_obj <= lap_end_time_date_obj ) ) {
              
              if ( ! driver_position_json.hasOwnProperty( driver_number.toString() ) ) {
                driver_position_json[ driver_number.toString() ] = {} ;
                driver_position_detiled_json[ driver_number.toString() ] = {} ;
              }

              if ( ! driver_position_detiled_json[ driver_number.toString() ].hasOwnProperty( lap_number ) ) {              
                driver_position_detiled_json[ driver_number.toString() ][ lap_number ] = [] ;
              }

            driver_position_json[ driver_number.toString() ][ lap_number ] = current_json.position ;
            driver_position_detiled_json[ driver_number.toString() ][ lap_number ].push( current_json.position ) ;


            break ;
            }
          }
        }

      }); // Driver Position For Loop End
      
      for (let lap_index = 1; lap_index <= Object.values(driver_lap_json).length; lap_index++) {
        
        if ( ! driver_position_json[ driver_number.toString() ].hasOwnProperty( lap_index ) ) {
          driver_position_json[ driver_number.toString() ][ lap_index ] = driver_position_json[ driver_number.toString() ][ lap_index - 1 ] ;
        }
      }
    }

    resolve( { driver_position_json : driver_position_json, driver_position_detiled_json : driver_position_detiled_json } ) ;
  });
}


/** Return Json Structure 
  { 
    interval_json : interval_json,      -> interval_json : { driver_number : [ { 'date','lap_number' ,'position' ,'interval' }, .... ] }  
  }
*/

async function Driver_Interval(session_key, driver_json, driver_lap_time_json, finish_time_date_obj ) {

  return new Promise( async (resolve, reject) => {
    let interval_json = {} ;

    for ( const [driver_number, driver_name] of Object.entries(driver_json) ) {

      let interval_url_string = `https://api.openf1.org/v1/intervals?session_key=${session_key}&driver_number=${driver_number}` ;
      let interval_info_array = await API_Fetch_Request(interval_url_string) ;
            
      let driver_position_url_string = `https://api.openf1.org/v1/position?session_key=${session_key}&driver_number=${driver_number}` ;
      let position_info_array = await API_Fetch_Request(driver_position_url_string) ;

      let lap_index = 1 ;
      let position_index = 0 ; 

      let lap_time_json = driver_lap_time_json[ driver_number ] ;
      let lap_time_array = Object.keys(lap_time_json);

      if (lap_time_array.length > 0) {

        let prev_interval_number = null ; 
        
        for ( const current_json of interval_info_array ) {

          let interval_sample_time_iso_string = current_json.date ;
          let interval_sample_time_date_obj = new Date( interval_sample_time_iso_string ) ;

          let interval_lap = null ; 
          let interval_position = null ;

          let lap_comp_end_time = null ;
          let lap_comp_start_time = null ;
          let position_comp_time_sample = null ;

          // Interval Lap Detection
          
          // We assign the lap_complate_time_sample || 
          // Edge case 1 : If we are at the last lap -> Assign the finish with the finish time || 
          // Edge case 2 : If finish time is null -> Assign with the lap duration ||
          // Edge case 3 : If lap duration is missing -> WE FUCKED UP ||
          if ( lap_time_json[ lap_index.toString() ] !== undefined ) {
            
            lap_comp_start_time = new Date( lap_time_json[ lap_index.toString() ].date_start ) ;

            lap_comp_end_time = new Date( lap_time_json[ lap_index.toString() ].date_start ) ;
            lap_comp_end_time.setSeconds( lap_comp_end_time.getSeconds() + lap_time_json[ lap_index.toString() ].lap_duration ) ;
          }
          else{
            // Edge Case QUIT :: Lap array are finish, Even if we have interval data and lap data we couldn't fit the lap in it.
            break
          }


          if ( ( lap_comp_start_time < interval_sample_time_date_obj ) &&  ( interval_sample_time_date_obj <= lap_comp_end_time ) ) {
            interval_lap = lap_time_json[ lap_index.toString() ][ 'lap_number_fix' ] ;
          }
          else if ( lap_comp_end_time < interval_sample_time_date_obj ){
            
            if ( lap_time_json[ ( lap_index + 1 ).toString() ] !== undefined ) {
              interval_lap = lap_time_json[ (lap_index + 1).toString() ][ 'lap_number_fix' ] ;
              lap_index += 1 ;
            }else{
              // Edge Case QUIT :: Interval sample out of the our lap time and next lap time is not available. We need to break the loop.
              break ;
            }
          }

          // -------------------------------------------------------

          // Interval Position Detection
          
          // Compare time detection 
          // We test the same edge case as the lap time in here .
          if ( position_info_array[ (position_index +1).toString() ] !== undefined ) {
            position_comp_time_sample = new Date( position_info_array[ (position_index + 1).toString() ].date ) ;
          }
          else{
              position_comp_time_sample = lap_comp_end_time ; 
          }

          // We assign the interval position
          if ( interval_sample_time_date_obj <= position_comp_time_sample ) {

            interval_position = position_info_array[ position_index ].position ;
          }
          else if ( interval_sample_time_date_obj > position_comp_time_sample ) {

            if ( position_info_array[ (position_index + 1).toString() ] !== undefined ) {
              
              interval_position = position_info_array[ (position_index + 1).toString() ].position ;
              position_index += 1 ;
            }else{
              
              interval_position = position_info_array[ (position_index ).toString() ].position ;
            }
          }
                    
          // -------------------------------------------------------


          // Interval JSON Creation

          if ( current_json.interval !== null) {
            
            if ( interval_lap !== null  ) {
              
              // Interval Section 

              if ( ! interval_json.hasOwnProperty( driver_number) ){
                interval_json[ driver_number ] = [] ;
              }

              if ( (typeof(current_json.interval) === 'string') && ( prev_interval_number !== null ) ) {
                current_json.interval = prev_interval_number * 1.1 ;
              }

              let interval_data_json = {
                'date' : current_json.date,
                'lap_number' : interval_lap,
                'position' : interval_position,
                'interval' : current_json.interval,
              }

              prev_interval_number = current_json.interval ;

              interval_json[ driver_number ].push( interval_data_json ) ;

            }
          }
        } // For Loop End
      } // Lap time array lenght check
    } // Main For Loop End 
    resolve( { interval_json : interval_json} )
  }); // Promise end 
}



// Export the functions
module.exports = {
  GLOBAL_DEBUG_SETTING,

  Is_Race_End,
  Average_Array,
  API_Fetch_Request,
  Quartile_Calculater,
  SQL_Querry_Controler,


  Driver_Info,
  Lap_Time_Fixer,
  Driver_Interval,
  Driver_Lap_Time, 
  Driver_Position,
  Lap_Time_Cleaner,
  Tyre_Stint_Lap_Cleaner,
  Race_Start_Finish_Time,
  Quali_Start_Finish_Time,

};

