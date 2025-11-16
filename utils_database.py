# Library Impoert
import time
from datetime import datetime
from typing import Any

# FastF1 Imports
import fastf1
import fastf1.plotting
from fastf1._api import SessionNotAvailableError
from fastf1.core import CircuitInfo, DataNotLoadedError, SessionResults
from fastf1.events import EventSchedule
from numpy import nan as np_nan
from numpy import pi as np_pi
from pandas import DataFrame, Series, concat

fastf1.logger.LoggingManager.debug = True
fastf1.set_log_level("Warning")


# Type Imports
from mysql.connector import ProgrammingError
from mysql.connector.abstracts import MySQLConnectionAbstract
from mysql.connector.pooling import PooledMySQLConnection

from defines import ANSI_Code, ApiFailError

# Project Imoprts
from utils import Utils

# ==== Global Defines ====

# Const Variables
LOCAL_DEBUG = False
MAX_TRY_LIMIT = 5

# Filter & Mapping Defines
position_table_cols_filter = [
    "driver_name",
    "driver_number",
    "lap_number",
    "driver_pos",
    "Time",
]
tyre_stint_table_cols_filter = [
    "driver_name",
    "driver_number",
    "stint_number",
    "tyre_compound",
    "tyre_age",
    "tyre_is_fresh",
]
lap_time_table_cols_filter = [
    "driver_name",
    "driver_number",
    "lap_number",
    "lap_duration",
    "sector_one_duration",
    "sector_two_duration",
    "sector_three_duration",
    "tyre_compound",
    "tyre_is_fresh",
    "lap_start_time",
    "lap_accurcy",
]

quali_lap_time_table_cols_filter = ["driver_name", "driver_number", "Q1", "Q2", "Q3"]

session_type_maping = {
    "Day 1": "Practice",
    "Day 2": "Practice",
    "Day 3": "Practice",
    "Practice": "Practice",
    "Practice 1": "Practice",
    "Practice 2": "Practice",
    "Practice 3": "Practice",
    "Sprint Shootout": "Sprint Qualifying",
    "Sprint Qualifying": "Sprint Qualifying",
    "Qualifying": "Qualifying",
    "Sprint": "Race",
    "Race": "Race",
}

race_session_cols_mapping = {
    "Driver": "driver_name",
    "DriverNumber": "driver_number",
    "LapNumber": "lap_number",
    "Position": "driver_pos",
    "Stint": "stint_number",
    "Compound": "tyre_compound",
    "TyreLife": "tyre_age",
    "FreshTyre": "tyre_is_fresh",
    "LapStartDate": "lap_start_time",
    "LapTime": "lap_duration",
    "Sector1Time": "sector_one_duration",
    "Sector2Time": "sector_two_duration",
    "Sector3Time": "sector_three_duration",
    "IsAccurate": "lap_accurcy",
}

quali_session_cols_mapping = {
    "Abbreviation": "driver_name",
    "DriverNumber": "driver_number",
}

quali_position_session_cols_mapping = {
    "RPM": "rpm",
    "Speed": "speed",
    "nGear": "nth_gear",
    "Throttle": "throttle_rate",
    "Brake": "brake_rate",
    "X": "x",
    "Y": "y",
}


# Database Utils Class
class Database_Utils:
    ### Database update control flow function

    @classmethod
    def update_database(
        cls,
        rds_connection: PooledMySQLConnection | MySQLConnectionAbstract,
    ):
        """
        Function white paper :

        > Check : Is the database has the event schedule of current year
          _ No  - Check the api has the event schedule of that year.

          _ Yes - Next State

        > Check : Is there any future race at schedule
          _ No - Soo we have nothing to do with that.- We are fine -

          _ Yes - Try to scrap the next session data from Api [ If it's finish ]

        """

        current_year = datetime.now().year

        sql_string = f""" SELECT * FROM session_data_table WHERE year = {current_year} ORDER BY round_number,
              CASE CONCAT(session_type, '-', session_name)
                WHEN 'Practice-Practice 1' THEN 1
                WHEN 'Practice-Practice 2' THEN 2
                WHEN 'Practice-Practice 3' THEN 3
                WHEN 'Sprint Qualifying-Q1' THEN 4
                WHEN 'Sprint Qualifying-Q2' THEN 5
                WHEN 'Sprint Qualifying-Q3' THEN 6
                WHEN 'Race-Sprint' THEN 7
                WHEN 'Qualifying-Q1' THEN 8
                WHEN 'Qualifying-Q2' THEN 9
                WHEN 'Qualifying-Q3' THEN 10
                WHEN 'Race-Race' THEN 11
                ELSE 99
              END; """

        if LOCAL_DEBUG:
            print(f"DATABASE UPDATA : SQL string >   {sql_string}")

        db_cursor = rds_connection.cursor()
        db_cursor.execute(sql_string)

        querry_result = db_cursor.fetchall()

        result_df = DataFrame(
            querry_result,
            columns=Series(
                [
                    "session_id",
                    "round_number",
                    "year",
                    "country",
                    "race_name",
                    "session_type",
                    "is_session_done",
                    "session_name",
                    "is_error_occur",
                ]
            ),
        )

        if len(result_df) > 0:
            future_session_df = result_df[
                (result_df.is_session_done == 0) & (result_df.is_error_occur != 1)
            ].reset_index()

            if LOCAL_DEBUG:
                print(
                    f"DATABASE UPDATE : Length of the future sessions is -> {len(future_session_df)}"
                )

            if len(future_session_df) > 0:
                session_info = future_session_df.loc[0]

                if LOCAL_DEBUG:
                    print(
                        f"DATABASE UPDATE : Next future session infos are  -> {session_info}"
                    )

                try:
                    datascrapper_result = cls.event_data_scraper(
                        session_info, current_year
                    )

                    print("We are at the inserter ")

                    cls.data_base_inserter(
                        datascrapper_result, session_info, current_year, rds_connection
                    )

                except ApiFailError as error:
                    log_msg = f"""
          ================
          Time : {datetime.now()}
          API_FAIL_ERROR | update_database | event_data_scraper -> raise
          Error msg : {error}
          ================
          """

                    Utils.log_writer(log_msg)

                    sql_string = f"""UPDATE session_data_table set is_error_occur = 1 where ( year = {current_year} and race_name = '{session_info.race_name}' and session_name = '{session_info.session_name}' ) ;  """

                    try:
                        db_cursor.execute(sql_string)

                    except Exception as error:
                        log_msg = f"""
            ================
            Time : {datetime.now()}
            SQL_ERROR | update_database | event_data_scraper -> raise -> 'is_error_occur' update
            SQL Commend : {sql_string}
            Error msg : {error}
            ================
            """

                        Utils.log_writer(log_msg)

                except SessionNotAvailableError:
                    return True

        else:
            Database_Utils.event_scheduler_updater(current_year, rds_connection)

    ### Scrap the event schedule data from the FastF1 API | Return as Dataframe version we want
    @classmethod
    def event_scheduler_updater(
        cls,
        current_year: int,
        rds_connection: PooledMySQLConnection | MySQLConnectionAbstract,
    ):
        try:
            event_schedule_df: DataFrame | None = cls.event_schedule_collecter(
                current_year
            )

            db_cursor = rds_connection.cursor()

            if type(event_schedule_df) == DataFrame:
                if len(event_schedule_df) > 0:
                    for index, data_point in event_schedule_df.iterrows():
                        session_table_sql_string = f"""INSERT INTO session_data_table ( round_number, year, country, race_name, session_type, session_name, is_session_done ) VALUES ( "{data_point.RoundNumber}", {current_year}, "{data_point.Country}", "{data_point.Location}", "{session_type_maping[data_point.session_name]}", "{data_point.session_name}", {0} )"""

                        try:
                            _ = db_cursor.execute(session_table_sql_string)
                            _ = rds_connection.commit()

                        except Exception as error:
                            log_msg = f"""
                    ================
                    Time : {datetime.now()}
                    SQL_ERROR | event_scheduler_updater | Database insert
                    Sql Commend : {session_table_sql_string}
                    Error msg : {error}
                    ================
                    """

                            Utils.log_writer(log_msg)

                    _ = db_cursor.close()

        except ApiFailError as error:
            log_msg = f"""
      ================
      Time : {datetime.now()}
      API_FAIL_ERROR |  event_scheduler_updater | event_schedule_collecter -> raise
      Error msg : {error}
      ================
      """
            Utils.log_writer(log_msg)

    ### We modify the event schedule dataframe into what we need while we are scrabing data
    @staticmethod
    def event_schedule_collecter(current_year: int) -> DataFrame | None:
        try_index = 0
        while try_index < MAX_TRY_LIMIT:
            try:
                event_schedule_df: EventSchedule = fastf1.get_event_schedule(
                    current_year
                )

                event_schedule_df.EventFormat = event_schedule_df.EventFormat.map(
                    lambda val: val if val == "testing" else "grand_prix"
                )

                col_filter_event_schedule = [
                    "RoundNumber",
                    "Country",
                    "Location",
                    "EventFormat",
                    "Session1",
                    "Session2",
                    "Session3",
                    "Session4",
                    "Session5",
                ]

                df_list = []

                base_cols = col_filter_event_schedule[:4]
                session_cols = col_filter_event_schedule[4:]

                for session_col in session_cols:
                    session_df = event_schedule_df[
                        base_cols + [session_col, session_col + "Date"]
                    ]
                    session_df = session_df.rename(
                        {
                            str(session_col): "session_name",
                            str(session_col) + "Date": "SessionDate",
                        }
                    )
                    df_list.append(session_df)

                final_event_df = concat(
                    df_list,
                    axis=0,
                )
                final_event_df = (
                    final_event_df.replace({"None": np_nan})
                    .dropna(axis=0)
                    .sort_values(by="SessionDate")
                    .reset_index(drop=True)
                )

                return final_event_df

            except Exception as error:
                try_index += 1
                time.sleep(0.2)

                if LOCAL_DEBUG:
                    print(
                        f"{ANSI_Code.red}EVENT_SCHEDULE_COLLECTER : get_event_schedule() return error we will try again | try count : {try_index} "
                    )
                if LOCAL_DEBUG:
                    print(f"{ANSI_Code.red}EVENT_SCHEDULE_COLLECTER : Error \n{error}")

                continue

            break

        if try_index == MAX_TRY_LIMIT:
            raise ApiFailError(
                f"Max try limit triggered during event schedule fetching of {current_year} year ."
            )

    ### Scrap the given session data from FastF1 API
    @classmethod
    def event_data_scraper(cls, session_info: DataFrame, current_year: int):
        """
        The function is scraping the session data at given session info dataframe [ json ].

          Parameters
          ----------
          **session_info** :  DataFrame
                          Data frame including session information
          **current_year** :  int
                          Current year at the most upper loop

          Returns
          -------
          Dict
            {  "is_session_done" : 1, 'session_type' : session_type, "dfs" : {"lap_time_table" : lap_time_df, "tyre_stint_table" : tyre_stint_df, "position_interval_table" : position_interval_df } | None }
        """

        print(f"FAST F1 DATA SCRAPING IS STARTED ")

        lap_time_df = None
        tyre_stint_df = None
        position_cord_df = None
        position_interval_df = None

        session_type = session_type_maping[session_info.session_type]

        # if session_info.EventFormat == "testing" :
        #   session_data = fastf1.get_testing_session(current_year, 1, session_info.session_name.split(" ")[1])

        # else :
        #   session_data = fastf1.get_session(current_year, session_info.race_name, session_info.session_name)

        if session_info.session_name in ["Q1", "Q2", "Q3"]:
            try:
                session_data = fastf1.get_session(
                    session_info.year, session_info.race_name, session_info.session_type
                )

            except ValueError as error:
                session_data = fastf1.get_session(
                    session_info.year, session_info.race_name, "Sprint Shootout"
                )

        else:
            session_data = fastf1.get_session(
                session_info.year, session_info.race_name, session_info.session_name
            )

        try:
            session_data.load()

        except SessionNotAvailableError:
            raise SessionNotAvailableError

        except Exception as error:
            raise ApiFailError(
                str(error)
                + f""" at {current_year} | {session_info.race_name} | {session_info.session_name}"""
            )

        try:
            driver_color_map = fastf1.plotting.get_driver_color_mapping(session_data)

        except SessionNotAvailableError as error:
            raise ApiFailError(
                f"Api Fail durign the driver color map extraction at {current_year} | {session_info.race_name} | {session_info.session_name}"
            )

        except Exception as error:
            raise ApiFailError(
                str(error)
                + f""" at {current_year} | {session_info.race_name} | {session_info.session_name}"""
            )

        if ("Qualifying" in session_type) or ("Shootout" in session_type):
            # UPDATE START POINT
            session_laps_df = session_data.laps.copy()
            session_result_df = session_data.results.copy()

            session_result_df.rename(columns=quali_session_cols_mapping, inplace=True)

            circuit_info = session_data.get_circuit_info()

            circuit_angle = 45 / 180 * np_pi

            if type(circuit_info) == CircuitInfo:
                circuit_angle = circuit_info.rotation / 180 * np_pi

            #### Lap Time Table Data Frame Prep Code  ####

            session_result_df: DataFrame = session_result_df[
                quali_lap_time_table_cols_filter
            ]

            base_cols = quali_lap_time_table_cols_filter[:2]

            session_result_df = session_result_df[
                base_cols + [session_info.session_name]
            ].dropna()

            session_result_df.rename(
                columns={session_info.session_name: "lap_duration"}, inplace=True
            )

            laps = []

            for quali_lap in session_result_df.itertuples():
                lap: DataFrame | None = None

                lap = session_laps_df[
                    (session_laps_df["Driver"] == quali_lap.driver_name)
                    & (session_laps_df["DriverNumber"] == quali_lap.driver_number)
                    & (session_laps_df["LapTime"] == quali_lap.lap_duration)
                ]

                if not lap.empty:
                    try:
                        lap_telemetry = lap.telemetry[
                            quali_position_session_cols_mapping.keys()
                        ]

                    except ValueError:
                        continue

                    positions = lap_telemetry.loc[:, ("X", "Y")].to_numpy()

                    rotated_positions = Utils.position_rotater(positions, circuit_angle)

                    lap_telemetry = lap_telemetry.assign(
                        X=rotated_positions[:, 0],
                        Y=rotated_positions[:, 1],
                        driver_name=quali_lap.driver_name,
                        session_id=session_info.session_id,
                        team_color=driver_color_map[quali_lap.driver_name],
                        Brake=lap_telemetry.Brake.astype(int),
                    )

                    laps.append(lap_telemetry)

            position_cord_df = concat(laps, axis=0).dropna()
            position_cord_df.rename(
                columns=quali_position_session_cols_mapping, inplace=True
            )

            lap_time_df = session_result_df.assign(
                session_id=session_info.session_id,
                tyre_is_fresh="NULL",
                team_color=session_result_df.driver_name.map(driver_color_map),
                lap_duration=session_result_df.lap_duration.map(
                    lambda val: Utils.Time_Delto_To_Seconds(val)
                ),
                sector_one_duration="NULL",
                sector_two_duration="NULL",
                sector_three_duration="NULL",
                lap_start_time="NULL",
            ).fillna("NULL")

        ######## Qualifying Section Ends

        else:
            if LOCAL_DEBUG:
                print(f"SESSION is not Qualifying")
            try:
                session_laps_df = session_data.laps

            except DataNotLoadedError:
                raise ApiFailError(
                    f"Api Fail during laps info loading at {current_year} | {session_info.race_name} | {session_info.session_name} "
                )

            session_laps_df.rename(columns=race_session_cols_mapping, inplace=True)

            #### Lap Time Table Data Frame Prep Code  ####

            lap_time_df = session_laps_df[lap_time_table_cols_filter]

            lap_time_df = lap_time_df.assign(
                session_id=session_info.session_id,
                tyre_is_fresh=lap_time_df.tyre_is_fresh.astype(int),
                team_color=lap_time_df.driver_name.map(driver_color_map),
                lap_duration=lap_time_df.lap_duration.map(
                    lambda val: Utils.Time_Delto_To_Seconds(val)
                ),
                sector_one_duration=lap_time_df.sector_one_duration.map(
                    lambda val: Utils.Time_Delto_To_Seconds(val)
                ),
                sector_two_duration=lap_time_df.sector_two_duration.map(
                    lambda val: Utils.Time_Delto_To_Seconds(val)
                ),
                sector_three_duration=lap_time_df.sector_three_duration.map(
                    lambda val: Utils.Time_Delto_To_Seconds(val)
                ),
                lap_start_time=lap_time_df.lap_start_time.map(
                    lambda val: val.isoformat()
                ),
                lap_accurcy=lap_time_df.lap_accurcy.astype(int),
            ).fillna("NULL")

            ########

            if session_type == "Race":
                try:
                    tyre_color_map = fastf1.plotting.get_compound_mapping(session_data)

                except SessionNotAvailableError as error:
                    raise ApiFailError(
                        f"Api Fail durign the tyre color map extraction at {current_year} | {session_info.race_name} | {session_info.session_name}"
                    )

                except Exception as error:
                    raise ApiFailError(
                        str(error)
                        + f""" at {current_year} | {session_info.race_name} | {session_info.session_name}"""
                    )

                #### Tyre Stint Table Data Frame Prep Code ####

                tyre_stint_df = session_laps_df[tyre_stint_table_cols_filter]
                tyre_stint_df = tyre_stint_df.groupby(
                    [
                        "driver_name",
                        "driver_number",
                        "stint_number",
                        "tyre_compound",
                        "tyre_is_fresh",
                    ]
                ).count()

                tyre_stint_df = tyre_stint_df.reset_index().rename(
                    columns={"tyre_age": "stint_duration"}
                )

                tyre_stint_df = tyre_stint_df.assign(
                    session_id=session_info.session_id,
                    tyre_is_fresh=tyre_stint_df.tyre_is_fresh.astype(int),
                    team_color=tyre_stint_df.driver_name.map(driver_color_map),
                    tyre_color=tyre_stint_df.tyre_compound.map(tyre_color_map),
                ).fillna("NULL")

                ########

                #### Driver Position Interval Table Data Frame Prep Code ####

                position_interval_df = session_laps_df[position_table_cols_filter]

                position_leader_df = position_interval_df.query(
                    "driver_pos == 1"
                ).sort_values("lap_number")

                position_leader_df = position_leader_df.set_index(
                    position_leader_df.lap_number.astype(int)
                )

                def Interval_Calculator(driver_info: DataFrame):
                    try:
                        leader_info = position_leader_df.loc[driver_info.lap_number]

                    except KeyError:
                        return "NULL"

                    gap = driver_info.Time - leader_info.Time

                    return Utils.Time_Delto_To_Seconds(gap)

                position_interval_df = (
                    position_interval_df.assign(
                        session_id=session_info.session_id,
                        team_color=position_interval_df.driver_name.map(
                            driver_color_map
                        ),
                        interval_leader=position_interval_df.apply(
                            Interval_Calculator, axis=1
                        ),
                    )
                    .drop(columns="Time")
                    .fillna("NULL")
                )

                ########

        return {
            "is_session_done": 1,
            "session_type": session_type,
            "dfs": {
                "lap_time_table": lap_time_df,
                "tyre_stint_table": tyre_stint_df,
                "position_interval_table": position_interval_df,
                "position_cord_table": position_cord_df,
            },
        }

    ### Insert the scraped session data into sql database
    @classmethod
    def data_base_inserter(
        cls,
        database_data: dict[str, Any],
        session_info: DataFrame,
        current_year: int,
        rds_connection: PooledMySQLConnection | MySQLConnectionAbstract,
    ):
        def Sql_String_Converter(data_point, table_name):
            cols_string, value_string = "", ""

            for cols, vals in data_point.items():
                cols_string += cols + ", "

                if vals == "NULL":
                    value_string += vals + ", "

                elif (type(vals) == int) or (type(vals) == float):
                    value_string += str(vals) + ", "

                else:
                    value_string += '"' + str(vals) + '"' + ", "

            return f"INSERT INTO {table_name} ({cols_string[:-2]}) VALUES ({value_string[:-2]}) ; "

        db_cursor = rds_connection.cursor()

        if database_data["is_session_done"]:
            for table_name, df in database_data["dfs"].items():
                if LOCAL_DEBUG:
                    print(f"DATABASE UPDATE :: Updated table is {table_name}")
                if df is not None:
                    for index, data_point in df.iterrows():
                        sql_string = Sql_String_Converter(data_point, table_name)

                        try:
                            db_cursor.execute(sql_string)

                        except ProgrammingError as error:
                            print(f"{ANSI_Code.red} SQL EROOR {sql_string}")

                            log_msg = f"""
              ================
              Time : {datetime.now()}
              SQL_ERROR | data_base_inserter | insert the session data into table
              SQL Commend : {sql_string}
              Error msg : {error}
              ================
              """

                            Utils.log_writer(log_msg)

        # sql_string = f""" UPDATE session_data_table set is_session_done = 1 where ( year = {current_year} and race_name = '{session_info.race_name}' and session_type = '{session_info.session_type}' and session_name = '{session_info.session_name}' ) ; """
        sql_string = f""" UPDATE session_data_table set is_session_done = 1 where ( session_id = {session_info.session_id} and race_name = '{session_info.race_name}' and session_type = '{session_info.session_type}' and session_name = '{session_info.session_name}' ) ; """

        print(f"SQL string for the update  :::: {sql_string}")

        _ = db_cursor.execute(sql_string)

        _ = db_cursor.close()
        _ = rds_connection.commit()

        return True
