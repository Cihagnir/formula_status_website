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


# ==== User Defined Error Types ====
class ApiFailError(Exception): ...


# ====  Print Color Class ====
class ANSI_Code:
    red: str = "\033[0;31m"
    cyan: str = "\033[0;36m"
    blue: str = "\033[0;34m"
    green: str = "\033[0;32m"
    brown: str = "\033[0;33m"
    black: str = "\033[0;30m"
    purple: str = "\033[0;35m"
    yellow: str = "\033[1;33m"
    light_red: str = "\033[1;31m"
    dark_gray: str = "\033[1;30m"
    light_blue: str = "\033[1;34m"
    light_cyan: str = "\033[1;36m"
    light_gray: str = "\033[0;37m"
    light_green: str = "\033[1;32m"
    light_white: str = "\033[1;37m"
    light_purple: str = "\033[1;35m"


# ==== Type Define Class ====
class Types:
    class general_config:
        global_debug: bool | None = None
        database_setting: str | None = None

    class database_config:
        user: str | None = None
        host: str | None = None
        port: int | None = None
        password: str | None = None
        database: str | None = None
