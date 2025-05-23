
"""
> utils.py

  That folder contains the `Utils` class. Under 
  that class I wrote the general utility function 
  used at certian point of the project. I try to 
  put the function into segments depeing on what 
  they are coded for [ With the commend of course ]. 

  _ Configuration Utils : 
    Main goal is read the `config.ini` folder and 
    handle these configuration. 

  _ Descriptive Function Utils :
    These are mostly aim for enhance the code 
    readablity. Function mostly contain the 
    complex calculation, control steatment or 
    whatsoever will look weird in the main code. 
    So we gave the function descriptive name about 
    what it's handleing and than use our main code.  

  _ General Utils : 
    These section contains the basic utility 
    function. We are free to write any function 
    at that section.  
  
"""





# Library Imports 
import orjson
import configparser
from pandas import Timedelta

from fastapi.responses import JSONResponse


# Project Imports

from defines import Types


LOCAL_DEBUG = True


# General Utils Functions
class Utils : 

# ==== Configuration Utils ====

  def general_config_reader():

    config_parser = configparser.ConfigParser()
    config_parser.read('config.ini')

    Types.general_config.global_debug = config_parser.getboolean('General', 'global_debug')
    Types.general_config.database_setting = config_parser.get('General', 'database_setting')

    del config_parser

    return Types.general_config


  def database_config_reader(database_setting : str) : 

    config_parser = configparser.ConfigParser()
    config_parser.read('config.ini')

    if 'local' in database_setting : 
      
      if LOCAL_DEBUG : print("UTILS ::: Local database connection config hold") 
      
      Types.database_config.user = config_parser.get('Database', 'local_user')
      Types.database_config.host = config_parser.get('Database', 'local_host')
      Types.database_config.port = config_parser.getint('Database', 'local_port')
      Types.database_config.password = config_parser.get('Database', 'local_password')
      Types.database_config.database = config_parser.get('Database', 'local_database') 


    elif 'AWS' in database_setting : 

      if LOCAL_DEBUG : print("UTILS ::: AWS database connection config hold") 
      
      Types.database_config.user = config_parser.get('Database', 'aws_user')
      Types.database_config.host = config_parser.get('Database', 'aws_host')
      Types.database_config.port = config_parser.getint('Database', 'aws_port')
      Types.database_config.password = config_parser.get('Database', 'aws_password')
      Types.database_config.database = config_parser.get('Database', 'aws_database') 

    del config_parser

    return Types.database_config

# ==== Descriptive Function Utils ====

  def quantile_to_bound(lower_quant : float, user_lower_bound : float, upper_quant : float, user_upper_bound : float) : 
    """
    Re-calculate the uppor or lower quartile, depending of the user filter 
    setting at website. 
    """

    iqr = upper_quant - lower_quant

    lower_bound = lower_quant - user_lower_bound * iqr
    upper_bound = upper_quant + user_upper_bound * iqr
    
    return (lower_bound, upper_bound)
  
  def Time_Delto_To_Seconds(time_delta : Timedelta) :
    return round( (time_delta.seconds + time_delta.microseconds * 1e-6), ndigits=3  ) 


# ==== Utils Classes ====

  class orjson_response(JSONResponse):
    media_type = "application/json"

    def render(self, content: any) -> bytes:
        return orjson.dumps(content)


# ==== General Utils ====

  def log_writer( log_msg : str ) : 

    log_file = 'log.txt'

    # Write to file
    with open(log_file, "a") as file:
      file.write(log_msg)

