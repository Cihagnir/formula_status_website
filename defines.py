
"""
> defines.py

  That folder contains the classes defines 
  shorcut or type defines for increase the 
  code writing experiences or core readablity.
  
  I -kinda- aware of these type defines 
  are not use as an type check at the 
  python. However they allow us to easily 
  acces the attributes of the object. 
  That is the main reason I wrote these types. 
  
"""




#==== User Defined Error Types ====
class ApiFailError(Exception) : ...




#====  Print Color Class ====
class ANSI_Code:
  red     = "\033[0;31m"
  cyan    = "\033[0;36m"
  blue    = "\033[0;34m"
  green   = "\033[0;32m"
  brown   = "\033[0;33m"
  black   = "\033[0;30m"
  purple  = "\033[0;35m"
  yellow  = "\033[1;33m"
  light_red     = "\033[1;31m"
  dark_gray     = "\033[1;30m"
  light_blue    = "\033[1;34m"
  light_cyan    = "\033[1;36m"
  light_gray    =  "\033[0;37m"
  light_green   = "\033[1;32m"
  light_white   = "\033[1;37m"
  light_purple  = "\033[1;35m"



#==== Type Define Class ====
class Types : 

  class general_config : 
    global_debug = None
    database_setting = None

  class database_config : 
    user = None
    host = None
    port = None
    password = None
    database = None







