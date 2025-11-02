### Import Section

# Library Import

import uvicorn
import numpy as np
from json import loads
from fastapi import FastAPI
from mysql import connector
from pandas import DataFrame, concat, Series
from fastapi.middleware.cors import CORSMiddleware

# Project Import
from utils import Utils
from utils_database import Database_Utils

from apscheduler.schedulers.background import BackgroundScheduler

LOCAL_DEBUG = True


### Confs Section

general_confs = Utils.general_config_reader()
database_conf = Utils.database_config_reader(general_confs.database_setting)

# Database Coneection
db_connection = connector.connect(
    port=database_conf.port,
    user=database_conf.user,
    host=database_conf.host,
    password=database_conf.password,
    database=database_conf.database,
)

# CORS Endpoints
allowed_origins = [
    "http://localhost:3000",
    "https://formulatics.com",
]


# Api Confs
formulatics_app = FastAPI(default_response_class=Utils.orjson_response)


formulatics_app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ******** Scheduler Functions  ********
def database_updater():
    Database_Utils.update_database(db_connection)
    print(f"Data Base Updated")


# ******** STATUS TEST PAGES ********


@formulatics_app.get("/")
async def root():
    return {"Api Status": 200}


@formulatics_app.get("/second_page")
async def second_page():
    return {"Api Status": 200}


# ********  UI INFORMATION FETCHER BACKEND FUNCTION  *********#


@formulatics_app.get("/ui/")
async def ui_data_fetcher(year: int | None = None, session_type: str | None = None):
    api_response = []

    db_cursor = db_connection.cursor()

    # When the year is None we mostly want to fetch years
    if year is None:
        sql_string: str = (
            "SELECT DISTINCT year FROM session_data_table WHERE ( is_session_done = 1 )"
        )

        if LOCAL_DEBUG:
            print(f"MAIN : {sql_string}")

        db_cursor.execute(sql_string)

        querry_result = db_cursor.fetchall()

        (api_response,) = zip(*querry_result)

    # When we have year data, we mostly want to fetch the event at that year
    elif year is not None:
        sql_string: str = f"""SELECT DISTINCT race_name, session_type FROM session_data_table WHERE ( is_session_done = 1  AND year = {year} AND session_type = "{session_type}")"""

        if LOCAL_DEBUG:
            print(f"MAIN : {sql_string}")

        db_cursor.execute(sql_string)

        querry_result = db_cursor.fetchall()

        api_response = [
            str(race_name) + "  " + str(session_name)
            for race_name, session_name in querry_result
        ]

    _ = db_cursor.close()
    _ = db_connection.commit()

    return {"api_response": api_response}


@formulatics_app.get("/ui/pos_data_quali/")
async def ui_sub_data_fetcher(year: int, race_name: str):
    api_response = {}

    sql_string = f""" SELECT session_id, session_name  FROM session_data_table WHERE ( year = {year} AND race_name = '{race_name}' AND session_type = 'Qualifying' )  """
    if LOCAL_DEBUG:
        print(f"MAIN : {sql_string}")

    db_cursor = db_connection.cursor()
    _ = db_cursor.execute(sql_string)
    querry_result = db_cursor.fetchall()

    session_id_dict = dict(querry_result)
    session_id_tuple = tuple(session_id_dict.keys())

    sql_string = f"""  SELECT session_id, driver_name  FROM position_cord_table WHERE ( session_id in {session_id_tuple} ) GROUP BY session_id, driver_name; ; """
    if LOCAL_DEBUG:
        print(f"MAIN : {sql_string}")
    _ = db_cursor.execute(sql_string)
    querry_result = db_cursor.fetchall()

    for value in querry_result:
        row = tuple(value)
        driver = row[1]
        session = session_id_dict[row[0]]
        if session not in api_response.keys():
            api_response[session] = []

        if driver not in api_response[session]:
            api_response[session].append(driver)

    return {"api_response": api_response}


# ********  GRAPH DRAWER BACKEND FUNCTION  ********* #


# Race Lap Time Line -> Lap Time Line
@formulatics_app.get("/graph/race_laps_line/")
async def race_lap_time(
    year: int,
    race_name: str,
    session_name: str,
    user_upper_bound: float,
    user_lower_bound: float,
    is_filter: bool,
):
    graph_data = {}
    color_map = {}

    db_cursor = db_connection.cursor()

    # Retrive the session id from session_data_table.
    sql_string = f""" SELECT session_id FROM session_data_table WHERE ( year = {year} AND race_name = '{race_name}' AND session_name = '{session_name}' ) """

    if LOCAL_DEBUG:
        print(f"MAIN : {sql_string}")

    _ = db_cursor.execute(sql_string)
    querry_result = db_cursor.fetchall()
    session_id = tuple(querry_result[0])[0]

    sql_string = f"""  SELECT driver_name, lap_duration, lap_number, team_color, lap_accurcy FROM lap_time_table WHERE ( session_id = {session_id} ) ; """

    if LOCAL_DEBUG:
        print(f"MAIN : {sql_string}")

    _ = db_cursor.execute(sql_string)

    querry_result = db_cursor.fetchall()

    laps_df = DataFrame(
        data=querry_result,
        columns=Series(
            [
                "driver_name",
                "lap_duration",
                "lap_number",
                "team_color",
                "lap_accurcy",
            ]
        ),
    )

    if is_filter:
        lower_quant, upper_quant = laps_df.lap_duration.quantile([0.25, 0.75])

        lower_bound, upper_bound = Utils.quantile_to_bound(
            lower_quant,
            1.5,
            upper_quant,
            1.5,
        )

        filter_vals = (
            (lower_bound < laps_df.lap_duration) & (laps_df.lap_duration < upper_bound)
        ).values

        laps_df["lap_accurcy"] = filter_vals * laps_df.lap_accurcy
        laps_df["lap_duration"] = (filter_vals * laps_df.lap_duration).replace(
            0.0, None
        )

        laps_df["lap_duration"] = (
            laps_df.lap_duration.infer_objects(copy=False)
            .interpolate(method="linear")
            .round(3)
        )

    for index, data_point in laps_df.iterrows():
        if data_point.driver_name not in graph_data.keys():
            graph_data[data_point.driver_name] = []

        graph_data[data_point.driver_name].append(
            {
                "lap_number": data_point.lap_number,
                "lap_duration": data_point.lap_duration,
                "lap_accurcy": data_point.lap_accurcy,
            }
        )

        color_map[data_point.driver_name] = data_point.team_color

    del laps_df

    _ = db_cursor.close()
    _ = db_connection.commit()

    return {"api_response": {"graph_data": graph_data, "color_map": color_map}}


# Tyre Stint Bar
@formulatics_app.get("/graph/race_tyre_stint/")
async def tyre_stint(year: int, race_name: str, session_name: str):
    graph_data = []
    graph_color_map = {}
    legend_color_map = {}

    db_cursor = db_connection.cursor()

    # Retrive the session id from session_data_table.
    sql_string = f""" SELECT session_id FROM session_data_table WHERE ( year = {year} AND race_name = '{race_name}' AND session_name = '{session_name}' ) """

    if LOCAL_DEBUG:
        print(f"MAIN : {sql_string}")

    _ = db_cursor.execute(sql_string)
    querry_result = db_cursor.fetchall()
    session_id = tuple(querry_result[0])[0]

    sql_string = f""" SELECT driver_name, tyre_compound, stint_number, stint_duration, tyre_is_fresh, tyre_color  FROM tyre_stint_table WHERE ( session_id = {session_id} ) ; """

    if LOCAL_DEBUG:
        print(f"MAIN : {sql_string}")

    _ = db_cursor.execute(sql_string)

    querry_result = db_cursor.fetchall()

    tyre_df = DataFrame(
        data=querry_result,
        columns=Series(
            [
                "driver_name",
                "tyre_compound",
                "stint_number",
                "stint_duration",
                "tyre_is_fresh",
                "tyre_color",
            ]
        ),
    )

    tyre_df = (
        tyre_df.assign(
            stint_name=tyre_df.tyre_compound + "_" + tyre_df.stint_number.astype(str)
        )
        .set_index(tyre_df.driver_name.values)
        .drop(["stint_number", "driver_name"], axis=1)
    )

    graph_color_map = dict(zip(tyre_df.stint_name, tyre_df.tyre_color))
    legend_color_map = dict(zip(tyre_df.tyre_compound, tyre_df.tyre_color))

    for driver_name in tyre_df.index.unique():
        driver_df = tyre_df.loc[driver_name]

        try:
            stint_data = dict(zip(driver_df.stint_name, driver_df.stint_duration))

        except TypeError:
            stint_data = {driver_df.stint_name: int(driver_df.stint_duration)}

        stint_data["driver_name"] = driver_name

        graph_data.append([stint_data])

    del tyre_df

    _ = db_cursor.close()
    _ = db_connection.commit()

    return {
        "api_response": {
            "graph_data": graph_data,
            "color_maps": {
                "graph_color_map": graph_color_map,
                "legend_color_map": legend_color_map,
            },
        }
    }


# Race Interval Line
@formulatics_app.get("/graph/race_interval/")
async def interval(year: int, race_name: str, session_name: str):
    graph_data = {}
    color_map = {}
    lap_max_interval = {}

    db_cursor = db_connection.cursor()

    # Retrive the session id from session_data_table.
    sql_string = f""" SELECT session_id FROM session_data_table WHERE ( year = {year} AND race_name = '{race_name}' AND session_name = '{session_name}' ) """

    if LOCAL_DEBUG:
        print(f"MAIN : {sql_string}")

    _ = db_cursor.execute(sql_string)
    querry_result = db_cursor.fetchall()
    session_id = tuple(querry_result[0])[0]

    sql_string = f""" SELECT driver_name, lap_number, interval_leader, team_color FROM position_interval_table WHERE ( session_id = {session_id} ) ;"""

    if LOCAL_DEBUG:
        print(f"MAIN : {sql_string}")

    _ = db_cursor.execute(sql_string)

    querry_result = db_cursor.fetchall()

    interval_df = DataFrame(
        data=querry_result,
        columns=Series(["driver_name", "lap_number", "interval_leader", "team_color"]),
    )

    for index_, data_point in interval_df.iterrows():
        if data_point.driver_name not in graph_data.keys():
            graph_data[data_point.driver_name] = []

        graph_data[data_point.driver_name].append(
            {
                "lap_number": data_point.lap_number,
                "interval_leader": data_point.interval_leader,
            }
        )

        color_map[data_point.driver_name] = data_point.team_color

        try:
            if (
                lap_max_interval[str(data_point.lap_number)]
                < data_point.interval_leader
            ):
                lap_max_interval[str(data_point.lap_number)] = (
                    data_point.interval_leader
                )

        except KeyError:
            lap_max_interval[str(data_point.lap_number)] = data_point.interval_leader

    del interval_df

    _ = db_cursor.close()
    _ = db_connection.commit()

    return {
        "api_response": {
            "graph_data": graph_data,
            "color_map": color_map,
            "lap_max_interval": lap_max_interval,
        }
    }


# Race Lap Distrubation
@formulatics_app.get("/graph/race_lap_dstrb/")
async def race_lap_time_dstrb(year: int, race_name: str, session_name: str):
    api_response = []

    db_cursor = db_connection.cursor()

    sql_string = f""" SELECT session_id FROM session_data_table WHERE ( year = {year} AND race_name = '{race_name}' AND session_name = '{session_name}' ) """

    if LOCAL_DEBUG:
        print(f"MAIN : {sql_string}")

    _ = db_cursor.execute(sql_string)
    querry_result = db_cursor.fetchall()
    session_id = tuple(querry_result[0])[0]

    sql_string = f""" SELECT driver_name, lap_duration, team_color FROM lap_time_table WHERE ( session_id = {session_id} ) """

    if LOCAL_DEBUG:
        print(f"MAIN : {sql_string}")

    _ = db_cursor.execute(sql_string)

    querry_result = db_cursor.fetchall()

    laps_df = DataFrame(
        data=querry_result,
        columns=Series(["driver_name", "lap_duration", "team_color"]),
    )

    lap_duration_std = laps_df.lap_duration.std()
    lap_duration_mean = laps_df.lap_duration.mean()

    z_score = (laps_df.lap_duration - lap_duration_mean) / lap_duration_std

    laps_df = laps_df[(-1 < z_score) & (z_score < 4.5)]

    laps_df = laps_df.set_index(laps_df.driver_name).dropna(axis=0)

    for driver_name in laps_df.index.unique():
        driver_data = laps_df.loc[driver_name]

        if type(driver_data) == DataFrame:
            laps = driver_data.lap_duration.astype(float)

            lower_quant, upper_quant = laps.quantile([0.25, 0.75])

            lower_bound, upper_bound = Utils.quantile_to_bound(
                lower_quant, 1.5, upper_quant, 1.5
            )

            laps = laps[(lower_bound < laps) & (laps < upper_bound)]

            value_counts = laps.round().value_counts().sort_index()

            violin_plot = []

            for lap_duration, count in zip(
                value_counts.index.tolist(), value_counts.values.tolist()
            ):
                violin_plot.append({"value": lap_duration, "count": count})

            api_response.append(
                {
                    "box_plot": {
                        "x": driver_name,
                        "first_quart": lower_quant,
                        "third_quart": upper_quant,
                        "max": upper_bound,
                        "min": lower_bound,
                        "median": float(np.median(laps)),
                        "color": driver_data.team_color.unique()[0],
                        "outliers": laps[
                            (laps < lower_quant) | (upper_quant < laps)
                        ].tolist(),
                    },
                    "violin_plot": violin_plot,
                }
            )

    del laps_df

    _ = db_cursor.close()
    _ = db_connection.commit()

    return {"api_response": api_response}


# Race Position
@formulatics_app.get("/graph/race_position/")
async def race_position(year: int, race_name: str, session_name: str):
    color_map = {}
    graph_data = {}

    db_cursor = db_connection.cursor()

    # Retrive the session id from session_data_table.
    sql_string = f""" SELECT session_id FROM session_data_table WHERE ( year = {year} AND race_name = '{race_name}' AND session_name = '{session_name}' ) """

    if LOCAL_DEBUG:
        print(f"MAIN : {sql_string}")

    _ = db_cursor.execute(sql_string)
    querry_result = db_cursor.fetchall()

    session_id = tuple(querry_result[0])[0]

    sql_string = f""" SELECT driver_name, lap_number, driver_pos, team_color FROM position_interval_table WHERE ( session_id = {session_id} )  ; """

    if LOCAL_DEBUG:
        print(f"MAIN : {sql_string}")

    _ = db_cursor.execute(sql_string)

    querry_result = db_cursor.fetchall()

    pos_df = DataFrame(
        data=querry_result,
        columns=Series(["driver_name", "lap_number", "driver_pos", "team_color"]),
    )

    for index, data_point in pos_df.iterrows():
        if data_point.driver_name not in graph_data.keys():
            graph_data[data_point.driver_name] = []

        graph_data[data_point.driver_name].append(
            {"lap_number": data_point.lap_number, "driver_pos": data_point.driver_pos}
        )

        color_map[data_point.driver_name] = data_point.team_color

    del pos_df

    _ = db_cursor.close()
    _ = db_connection.commit()

    return {"api_response": {"graph_data": graph_data, "color_map": color_map}}


# Qualifiying Lap Duration
@formulatics_app.get("/graph/qualifying_laps_bar/")
async def quali_lap_time(year: int, race_name: str, session_type: str):
    color_map = {}
    graph_data = {}

    db_cursor = db_connection.cursor()

    # Retrive the session id from session_data_table.
    sql_string = f""" SELECT session_id, session_name FROM session_data_table WHERE ( year = {year} AND race_name = '{race_name}' AND session_type = '{session_type}' )  """

    if LOCAL_DEBUG:
        print(f"MAIN : {sql_string}")

    _ = db_cursor.execute(sql_string)
    querry_result = db_cursor.fetchall()

    session_id_dict = dict(querry_result)
    session_id_tuple = tuple(session_id_dict.keys())

    sql_string = f"""  SELECT driver_name, session_id, lap_duration, team_color  FROM lap_time_table WHERE ( session_id in {session_id_tuple} ) ; """

    if LOCAL_DEBUG:
        print(f"MAIN : {sql_string}")

    _ = db_cursor.execute(sql_string)

    querry_result = db_cursor.fetchall()

    laps_df = DataFrame(
        data=querry_result,
        columns=Series(["driver_name", "session_id", "lap_duration", "team_color"]),
    )

    laps_df["session_id"] = laps_df["session_id"].map(session_id_dict)

    laps_df = laps_df.set_index(laps_df.session_id.values).sort_values(
        by="lap_duration"
    )

    color_map = dict(zip(laps_df.driver_name, laps_df.team_color))

    for session_id in laps_df.index.unique():
        session_df = laps_df.loc[session_id]

        graph_data[session_id] = dict(
            zip(session_df.driver_name, session_df.lap_duration)
        )

    return {"api_response": {"graph_data": graph_data, "color_map": color_map}}


@formulatics_app.get("/graph/qualifying_laps_compr/")
async def quali_lap_compr(
    year: int,
    race_name: str,
    lap_one_session_name: str,
    lap_one_driver: str,
    lap_two_session_name: str,
    lap_two_driver: str,
):
    graph_data = []
    graph_info = {}
    db_cursor = db_connection.cursor()

    # Retrive the session id from session_data_table.
    sql_string = f""" SELECT session_id, session_name FROM session_data_table WHERE ( year = {year} AND race_name = "{race_name}" AND session_name = "{lap_one_session_name}" ) """

    _ = db_cursor.execute(sql_string)
    querry_result = db_cursor.fetchall()
    session_id_one = tuple(querry_result[0])[0]
    session_name_one = tuple(querry_result[0])[1]

    sql_string = f""" SELECT session_id, session_name FROM session_data_table WHERE ( year = {year} AND race_name = "{race_name}" AND session_name = "{lap_two_session_name}" ) """

    if LOCAL_DEBUG:
        print(f"MAIN : {sql_string}")
        print("=============================")
        print(f"MAIN : {sql_string}")

    _ = db_cursor.execute(sql_string)
    querry_result = db_cursor.fetchall()
    session_id_two = tuple(querry_result[0])[0]
    session_name_two = tuple(querry_result[0])[1]

    lap_one_sql_string = f""" SELECT speed, x, y, team_color, driver_name FROM position_cord_table WHERE ( session_id = {session_id_one} AND driver_name = '{lap_one_driver}') ; """

    lap_two_sql_string = f""" SELECT speed, x, y, team_color, driver_name FROM position_cord_table WHERE ( session_id = {session_id_two} AND driver_name = '{lap_two_driver}') ; """

    if LOCAL_DEBUG:
        print(lap_one_sql_string)
        print("=============================")
        print(lap_two_sql_string)

    # Retrive the lap one data from the db
    _ = db_cursor.execute(lap_one_sql_string)
    lap_one_querry = db_cursor.fetchall()

    _ = db_cursor.execute(lap_two_sql_string)
    lap_two_querry = db_cursor.fetchall()

    lap_one_df = DataFrame(
        data=lap_one_querry,
        columns=Series(["speed", "x", "y", "team_color", "driver_name"]),
    )
    lap_one_df["session_name"] = session_name_one

    lap_two_df = DataFrame(
        data=lap_two_querry,
        columns=Series(["speed", "x", "y", "team_color", "driver_name"]),
    )
    lap_two_df["session_name"] = session_name_two

    lap_one_res_cords, lap_two_res_cords = Utils.position_matcher(
        lap_one_df, lap_two_df
    )

    lap_one_filter_df = lap_one_res_cords[
        lap_one_res_cords.speed >= lap_two_res_cords.speed
    ]

    lap_two_filter_df = lap_two_res_cords[
        lap_two_res_cords.speed > lap_one_res_cords.speed
    ]

    total_df = concat([lap_one_filter_df, lap_two_filter_df]).sort_index()

    graph_info["x_axis"] = {
        "max_val": float(total_df.x.max()),
        "min_val": float(total_df.x.min()),
    }

    graph_info["y_axis"] = {
        "max_val": float(total_df.y.max()),
        "min_val": float(total_df.y.min()),
    }

    graph_info["circuit"] = {"start": float(total_df.x.values[0])}

    total_df = total_df.assign(
        filter_col=total_df.driver_name + "_" + total_df.session_name
    )

    filter_series = total_df.filter_col.shift(periods=1) != total_df.filter_col

    segmentatin_info = list(filter_series.index[filter_series.values]) + [
        len(total_df) - 1
    ]

    for index in range(1, len(segmentatin_info)):
        end_index = segmentatin_info[index] + 1
        start_index = segmentatin_info[index - 1]
        data = total_df[start_index:end_index]

        driver = data.filter_col.values[0]
        team_color = data.team_color.values[0]

        data_json = loads((data[["x", "y"]]).to_json(orient="records"))

        if (end_index - start_index) <= 3:
            try:
                graph_data[-1]["data"] = graph_data[-1]["data"] + data_json

            except IndexError:
                graph_data.append(
                    {"team_color": team_color, "driver": driver, "data": data_json}
                )

        else:
            graph_data.append(
                {"team_color": team_color, "driver": driver, "data": data_json}
            )

    return {"api_response": {"graph_data": graph_data, "graph_info": graph_info}}


if __name__ == "__main__":
    #  ******** Scheduler Settıngs  ********
    database_scheduler = BackgroundScheduler()
    database_job = database_scheduler.add_job(database_updater, "interval", minutes=5)
    database_scheduler.start()

    uvicorn.run(
        "main:formulatics_app", host="127.0.0.1", port=8080, workers=2, use_colors=True
    )
