
# Import section 
import pandas as pd 
from flask import Flask
from flaskext.mysql import MySQL

# Import Plotly
import plotly
import plotly.express as px
import plotly.graph_objects as go 

flask_app = Flask(__name__)

data_base = MySQL()

# Configure the database credential
flask_app.config['MYSQL_DATABASE_USER'] = 'root'
flask_app.config['MYSQL_DATABASE_PASSWORD'] = 'Cg++1234'
flask_app.config['MYSQL_DATABASE_DB'] = 'formula_website'
flask_app.config['MYSQL_DATABASE_HOST'] = 'formula-web.cjgeimauk4r6.eu-north-1.rds.amazonaws.com'

# Initilize and connect the data base
data_base.init_app(flask_app)


# Color Schema for Graph 

tyre_color_dict = { 'SOFT' : '#FF0000', 'MEDIUM' : '#FFD900', 'HARD' : '#FFFFFF', 'INTERMEDIATE'  : '#00A808', 'WET' : '#000EA8', 'None' : "#000000" }

@flask_app.route("/")
def Status_Test():
  return{"Api_Status" : 200}

@flask_app.route("/graph/Lap_Time/<seassion_type>/<year>/<race_circuit>/<divider>")
def Lap_Time_Graph_Drawer(seassion_type, year, race_circuit, divider ) :
  """
  Function fetch the lap time in the given races from database.
  And return it as a graph into frontend.  
  """

  # We retrive the data from the Sql Data Base 
  lap_time_sql_query = f"SELECT driver_name, lap_time, tyre_type FROM races WHERE ( seassion = {year} AND session_type='{seassion_type}' AND circuit_name = '{race_circuit}' AND lap_number > 1 )"

  lap_time_sub_conn = data_base.connect()
  lap_time_cursor =lap_time_sub_conn.cursor()

  lap_time_cursor.execute( lap_time_sql_query )  
  lap_time_data = lap_time_cursor.fetchall()

  # Transform the data into datafream
  data_frame_columns_list = ['driver', 'lap_time', 'tyre_type']
  
  data_frame = pd.DataFrame(lap_time_data, columns= data_frame_columns_list) 

  # Clean the outliers from the data 
  upper_quintile_float = data_frame["lap_time"].quantile(0.75)
  lower_quintile_float = data_frame["lap_time"].quantile(0.25)

  upper_bound = upper_quintile_float + 1.5 * (upper_quintile_float - lower_quintile_float)
  lower_bound = lower_quintile_float - 1.5 * (upper_quintile_float - lower_quintile_float)

  data_frame = data_frame[( data_frame["lap_time"] < upper_bound ) & ( data_frame["lap_time"] > lower_bound ) ]

  
  # Graph Drawing section 
  graph = px.box(
    data_frame, x="driver", y="lap_time",
    width= 1700, color= divider, 
    color_discrete_map= tyre_color_dict,
    ).update_layout( 
      paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
      )
  
  graph.update_traces( opacity = 1)
  graph.update_yaxes( title_text = "Lap Times", title_font=dict(size=18,  color='#E9ECEF'), color='#E9ECEF' )
  graph.update_xaxes( title_text = "Drivers", title_font=dict(size=18,  color='#E9ECEF'), color='#E9ECEF', categoryorder= "category ascending")
  graph.update_legends(  title_text = "Drivers", font= dict( color = "#E9ECEF" ))

  graph_Json = plotly.io.to_json(graph, pretty=True)

  return graph_Json


@flask_app.route("/graph/Tyre_Stint/<seassion_type>/<year>/<race_circuit>/")
def Tyre_Stint_Graph_Drawer(seassion_type, year, race_circuit) :

  # We retrive the data from the Sql Data Base 
  lap_time_sql_query = f"SELECT driver_name, tyre_type, lap_number FROM races  WHERE ( seassion = {year} AND session_type='{seassion_type}' AND circuit_name = '{race_circuit}' )"

  lap_time_sub_conn = data_base.connect()
  lap_time_cursor =lap_time_sub_conn.cursor()

  lap_time_cursor.execute( lap_time_sql_query )  
  lap_time_data = lap_time_cursor.fetchall()

  # Transform the data into datafream
  data_frame_columns_list = ['driver', 'tyre_type', 'lap_number']
  
  data_frame = pd.DataFrame(lap_time_data, columns= data_frame_columns_list) 


  data_frame = data_frame.sort_values(['driver', 'lap_number'], ascending=[True, True])
  
  filter_one = (( data_frame['tyre_type'] != data_frame['tyre_type'].shift() ) | ( data_frame['driver'] != data_frame['driver'].shift(-1) ) | ( data_frame['driver'] != data_frame['driver'].shift(1) ) )
  
  data_frame = data_frame[filter_one]

  data_frame['tyre_stint'] = ( data_frame['lap_number'].shift(-1) - data_frame['lap_number'] )
  data_frame = data_frame[data_frame['tyre_stint'] > 0]

  data_frame['indv_tyre_type'] = ( data_frame.groupby(["driver", "tyre_type"]).cumcount().astype(str) + "_" + data_frame["tyre_type"] )

  # Graph Drawing section 
  graph = px.bar( data_frame, x="tyre_stint", y='driver', color='indv_tyre_type', orientation="h",  )

  graph.for_each_trace( lambda trace: trace.update( marker_color= tyre_color_dict[ trace.name.split("_")[1] ], hovertemplate= trace.name.split("_")[1] ) )

  graph.update_layout( 
    height=800, width=800, barmode="stack", showlegend=False, 
    paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',)

  graph.update_traces( opacity = 1, width = 0.4, )
  graph.update_yaxes( title_text = "Driver", title_font=dict(size=18,  color='#E9ECEF'), color='#E9ECEF' , categoryorder= "total ascending")
  graph.update_xaxes( title_text = "Lap Number", title_font=dict(size=18,  color='#E9ECEF'), color='#E9ECEF')

  graph_Json = plotly.io.to_json(graph, pretty=True)

  return graph_Json


@flask_app.route("/ui/<year>/")
def Mysql_Track_Name_Requester(year) :
  """
  Function fetch the track names in the given year from database. 
  """
  
  sql_query = f"SELECT DISTINCT circuit_name FROM races WHERE seassion = {year} "

  track_name_sub_conn = data_base.connect()
  track_name_cursor =track_name_sub_conn.cursor()
  
  track_name_cursor.execute( sql_query )  
  query_return = track_name_cursor.fetchall()

  return {"query_return" : query_return }


@flask_app.route("/ui/seassion/")
def Mysql_Seassion_Requester() : 
  """
  Function fetch the distinct years from database. 
  """
  
  sql_query = f"SELECT DISTINCT seassion FROM races"
  
  seassion_sub_conn = data_base.connect()
  seassin_cursor =seassion_sub_conn.cursor()

  seassin_cursor.execute(sql_query)
  query_return = seassin_cursor.fetchall()

  return {"query_return" : query_return }

if __name__ == '__main__' : 

  flask_app.run(debug=True)






