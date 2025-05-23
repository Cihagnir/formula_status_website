
### Import Section 

# Library Import
import uvicorn
import numpy as np 
import pandas as pd
from mysql import connector

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Project Import
from utils import Utils, Types
from utils_database import Database_Utils 

from apscheduler.schedulers.background import BackgroundScheduler 


LOCAL_DEBUG = True


### Confs Section

general_confs : Types.general_config  = Utils.general_config_reader()
database_conf : Types.database_config = Utils.database_config_reader(general_confs.database_setting)

# Database Coneection
db_connection = connector.connect(
  port = database_conf.port,
  user = database_conf.user,
  host = database_conf.host,
  password = database_conf.password,
  database = database_conf.database
)

# CORS Endpoints
allowed_origins = [
  "http://localhost:3000",
  "https://formulatics.ssoli.app",
]


# Api Confs
formulatics_app = FastAPI( default_response_class= Utils.orjson_response)



formulatics_app.add_middleware(
  CORSMiddleware,
  allow_origins = allowed_origins, 
  allow_credentials = True,
  allow_methods = ['*'],
  allow_headers = ['*'],
)




#******** Scheduler Functions  ********
def database_updater() : 
  
  # -- Will be tried at local first
  # Database_Utils.update_database(db_connection)
  #

  pass


#******** STATUS TEST PAGES ********

@formulatics_app.get("/")
async def root():
  return { 'Api Status' : 200 }


@formulatics_app.get("/second_page")
async def second_page() : 
  return { 'Api Status' : 200 }



#********  UI INFORMATION FETCHER BACKEND FUNCTION  *********#

@formulatics_app.get("/ui/")
async def ui_data_fetcher( year : int | None = None, session_type : str | None = None ) :
  
  api_response = []

  db_cursor = db_connection.cursor()

  # When the year is None we mostly want to fetch years 
  if year is None : 
    
    sql_string : str = "SELECT DISTINCT year FROM session_data_table WHERE ( is_session_done = 1 )"
    
    if LOCAL_DEBUG : print(sql_string)

    db_cursor.execute(sql_string)

    querry_result = db_cursor.fetchall()

    api_response, = zip(*querry_result)

  # When we have year data, we mostly want to fetch the event at that year 
  elif year is not None : 
        
    sql_string : str = f"""SELECT DISTINCT race_name, session_name FROM session_data_table WHERE ( is_session_done = 1  AND year = {year} AND session_type = "{session_type}")"""
    
    if LOCAL_DEBUG : print(sql_string)

    db_cursor.execute(sql_string)

    querry_result = db_cursor.fetchall()

    api_response = [ race_name + "  " + session_name  for race_name, session_name in querry_result  ]
  
  db_cursor.close()
  db_connection.commit()

  return { "api_response" : api_response }



# ********  GRAPH DRAWER BACKEND FUNCTION  ********* #

# Race Lap Time Line -> Lap Time Line
@formulatics_app.get("/graph/race_laps_line/")
async def race_lap_time( year : int, race_name : str, session_name : str, user_upper_bound : float, user_lower_bound : float, is_filter : bool ) : 

  graph_data = {}
  color_map = {}

  db_cursor = db_connection.cursor()

  sql_string = f"""  SELECT driver_name, lap_duration, lap_number, team_color, lap_accurcy FROM lap_time_table WHERE ( year = {year} AND race_name = "{race_name}" AND session_name = "{session_name}" ) ; """

  if LOCAL_DEBUG : print(sql_string)

  db_cursor.execute(sql_string)

  querry_result = db_cursor.fetchall()

  laps_df = pd.DataFrame(data= querry_result, columns=[ 'driver_name', 'lap_duration', 'lap_number', 'team_color', 'lap_accurcy' ] )

  if is_filter : 
    lower_quant, upper_quant = laps_df.lap_duration.quantile([0.25,0.75])

    lower_bound, upper_bound = Utils.quantile_to_bound(lower_quant,1.5, upper_quant, 1.5)

    filter_vals = ( ( lower_bound < laps_df.lap_duration ) & ( laps_df.lap_duration < upper_bound ) ).values

    laps_df['lap_accurcy'] = (filter_vals * laps_df.lap_accurcy)
    laps_df['lap_duration']  = ( filter_vals  * laps_df.lap_duration ) .replace(0.0, None) 

    laps_df['lap_duration'] = laps_df.lap_duration.infer_objects(copy=False).interpolate(method='linear') .round(3)


  for index, data_point in laps_df.iterrows() : 

    if data_point.driver_name not in graph_data.keys() : 

      graph_data[data_point.driver_name] = []

    graph_data[data_point.driver_name].append({'lap_number' : data_point.lap_number, 'lap_duration' : data_point.lap_duration, 'lap_accurcy' : data_point.lap_accurcy})

    color_map[data_point.driver_name] = data_point.team_color

  del laps_df

  db_cursor.close()
  db_connection.commit()

  return {'api_response' : { 'graph_data' : graph_data, 'color_map' : color_map  }}


# Tyre Stint Bar
@formulatics_app.get("/graph/race_tyre_stint/")
async def tyre_stint( year : int, race_name : str, session_name : str  ) :  
  
  graph_data = []
  graph_color_map = {}
  legend_color_map = {}

  sql_string = f""" SELECT driver_name, tyre_compound, stint_number, stint_duration, tyre_is_fresh, tyre_color  FROM tyre_stint_table WHERE ( year = {year} AND race_name = "{race_name}" AND session_name = "{session_name}" ) ; """

  if LOCAL_DEBUG : print(sql_string)

  db_cursor = db_connection.cursor()

  db_cursor.execute( sql_string )

  querry_result = db_cursor.fetchall()

  tyre_df = pd.DataFrame( data= querry_result, columns=['driver_name', 'tyre_compound', 'stint_number', 'stint_duration', 'tyre_is_fresh', 'tyre_color'] ) 

  tyre_df = tyre_df.assign( stint_name = tyre_df.tyre_compound + '_' + tyre_df.stint_number.astype(str) ) .set_index( tyre_df.driver_name.values ) .drop( [ 'stint_number', 'driver_name' ], axis=1 )

  graph_color_map = dict( zip( tyre_df.stint_name, tyre_df.tyre_color ) )
  legend_color_map = dict( zip( tyre_df.tyre_compound, tyre_df.tyre_color ) )

  for driver_name in tyre_df.index.unique() : 

    driver_df = tyre_df.loc[ driver_name ] 

    try : 
      stint_data = dict( zip( driver_df.stint_name, driver_df.stint_duration ) )

    except TypeError : 
      stint_data = {driver_df.stint_name : int(driver_df.stint_duration) }

    stint_data['driver_name'] = driver_name

    graph_data.append( [ stint_data ] )


  del tyre_df

  db_cursor.close()
  db_connection.commit()

  return { 'api_response' : { 'graph_data' : graph_data, 'color_maps' : { 'graph_color_map' : graph_color_map, 'legend_color_map' : legend_color_map } } }  


# Race Interval Line
@formulatics_app.get("/graph/race_interval/")
async def interval( year : int, race_name : str, session_name : str  ) : 

  graph_data = {}
  color_map = {}
  lap_max_interval = {}

  sql_string = f""" SELECT driver_name, lap_number, interval_leader, team_color FROM position_interval_table WHERE ( year = {year} AND race_name = '{race_name}' AND session_name = '{session_name}' ) ;"""

  if LOCAL_DEBUG : print(sql_string) 

  db_cursor = db_connection.cursor()

  db_cursor.execute(sql_string)

  querry_result = db_cursor.fetchall()

  interval_df = pd.DataFrame(data= querry_result, columns= [ 'driver_name', 'lap_number', 'interval_leader', 'team_color' ] )

  for index_, data_point in interval_df.iterrows() : 


    if data_point.driver_name not in graph_data.keys() : 
      
      graph_data[data_point.driver_name] = []

    graph_data[ data_point.driver_name ].append( {'lap_number' : data_point.lap_number, 'interval_leader' : data_point.interval_leader} )

    color_map[ data_point.driver_name ] = data_point.team_color 

    try : 

      if lap_max_interval[ str( data_point.lap_number ) ] < data_point.interval_leader : 
        
        lap_max_interval[ str( data_point.lap_number ) ] = data_point.interval_leader 

    except KeyError : 

      lap_max_interval[ str( data_point.lap_number ) ] = data_point.interval_leader 

  
  del interval_df

  db_cursor.close()
  db_connection.commit()

  return  { 'api_response' : { 'graph_data' : graph_data, 'color_map' : color_map, 'lap_max_interval' : lap_max_interval } }

  
# Race Lap Distrubation
@formulatics_app.get("/graph/race_lap_dstrb/")
async def race_lap_time_dstrb( year : int, race_name : str, session_name : str ) : 
  
  api_response = [ ]

  sql_string = f""" SELECT driver_name, lap_duration, team_color FROM lap_time_table WHERE ( year = {year} AND race_name = '{race_name}' AND session_name = '{session_name}' ) """
  
  if LOCAL_DEBUG : print(sql_string) 

  db_cursor = db_connection.cursor() 
  db_cursor.execute(sql_string)

  querry_result = db_cursor.fetchall()

  laps_df = pd.DataFrame( data= querry_result, columns=[ 'driver_name', 'lap_duration', 'team_color' ] )

  laps_df = laps_df.set_index( laps_df.driver_name ) .dropna( axis= 0 )

  for driver_name in laps_df.index.unique() : 

    driver_data = laps_df.loc[ driver_name ]
      
    if type(driver_data) == pd.DataFrame :

      laps = driver_data.lap_duration.astype(float)
      
      lower_quant, upper_quant = laps.quantile([0.25, 0.75])

      lower_bound, upper_bound = Utils.quantile_to_bound(lower_quant, 1.5, upper_quant, 1.5)

      laps = laps[ ( lower_bound < laps  ) & (laps < upper_bound) ] 

      value_counts = laps.round().value_counts() .sort_index()
      
      violin_plot = [ ]
      
      for lap_duration, count in zip(value_counts.index.tolist(), value_counts.values.tolist()) : 

        violin_plot.append({
          'value' : lap_duration,
          'count' : count
        })

      api_response.append({
        'box_plot' : {
          'x' : driver_name,
          'first_quart' : lower_quant,
          'third_quart' : upper_quant, 
          'max' : upper_bound,
          'min' : lower_bound,
          'median' : float(np.median(laps)),
          'color' : driver_data.team_color.unique()[0], 
          'outliers' : laps[ ( laps < lower_quant ) | ( upper_quant < laps) ].tolist(),
        },
        'violin_plot' : violin_plot,
      })

  
  del laps_df

  db_cursor.close()
  db_connection.commit()

  return {'api_response' : api_response }


# Race Position 
@formulatics_app.get("/graph/race_position/")
async def race_position( year : int, race_name : str, session_name : str ) : 

  color_map = {}
  graph_data = {}

  db_cursor = db_connection.cursor() 

  sql_string = f""" SELECT driver_name, lap_number, driver_pos, team_color FROM position_interval_table WHERE ( year = {year} AND race_name = "{race_name}" AND session_name = "{session_name}" )  ; """

  if LOCAL_DEBUG : print(sql_string)

  db_cursor.execute(sql_string)

  querry_result = db_cursor.fetchall()

  pos_df = pd.DataFrame( data=querry_result, columns=[ 'driver_name', 'lap_number', 'driver_pos', 'team_color' ] )

  for index, data_point in pos_df.iterrows() : 

    if  data_point.driver_name not in  graph_data.keys() : 
      
      graph_data[ data_point.driver_name ] = []

    graph_data[data_point.driver_name].append( { 'lap_number' : data_point.lap_number, 'driver_pos' : data_point.driver_pos } )

    color_map[ data_point.driver_name ] = data_point.team_color

  del pos_df

  db_cursor.close()
  db_connection.commit()

  return{ 'api_response' : { 'graph_data' : graph_data, 'color_map' : color_map} }


# Qualifiying Lap Duration
@formulatics_app.get("/graph/qualifying_laps_bar")
async def quali_lap_time( year : int, race_name : str, session_type : str ) : 

  color_map = {}
  graph_data = {}

  sql_string = f"""  SELECT driver_name, session_name, lap_duration, team_color  FROM lap_time_table WHERE ( year = {year} AND race_name = "{race_name}" AND session_type = "{session_type}" ) ; """

  if LOCAL_DEBUG : print(sql_string)

  db_cursor = db_connection.cursor()
  db_cursor.execute(sql_string)

  querry_result = db_cursor.fetchall()

  laps_df = pd.DataFrame(data= querry_result, columns=[ 'driver_name', 'session_name', 'lap_duration', 'team_color' ] )

  laps_df = laps_df.set_index(laps_df.session_name.values) .sort_values(by='lap_duration')

  color_map = dict( zip( laps_df.driver_name, laps_df.team_color ) )

  for session_name in laps_df.index.unique() : 

    session_df = laps_df.loc[session_name]

    graph_data[session_name] = dict(zip(session_df.driver_name, session_df.lap_duration))


  return { 'api_response' : { 'graph_data' : graph_data, 'color_map' : color_map} }





#******** Scheduler Settıngs  ********

#  


if __name__ == "__main__" : 

  uvicorn.run("main:formulatics_app", host="127.0.0.1", port=8080, workers=4, use_colors=True)


