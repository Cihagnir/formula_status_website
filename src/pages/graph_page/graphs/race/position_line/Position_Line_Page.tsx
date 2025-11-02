// Import
import axios from "axios";
import React, { useState, useEffect } from "react";

// Hand Made Import
import { Position_Line_Graph } from "./Graph_Obj";
import {
    BASE_URL,
    position_graph_input_interface,
} from "../../../Commen_Utils";

// CSS Import
import "./Position_Line_Page.css";
import home_page_backgraound from "../../../../img/home_page_back.jpg";

const LOCAL_DEBUG = false;

// Page Export Funciton
function Position_Line_Page() {
    // =========== UseState Section ===========

    // Graph State Area
    const [selected_race_state, set_selected_race_state] = useState("");
    const [selected_year_state, set_selected_year_state] = useState("");

    // Graph Data
    const [graph_data_state, set_graph_data_state] =
        useState<position_graph_input_interface | null>(null);

    // Dropdown Box Datas
    const [seassion_array_state, set_seassion_array_state] = useState([]);
    const [track_name_array_state, set_track_name_array_state] = useState([
        "Select the Race",
    ]);

    // Api Fetch Function
    const api_fetch_func = async (
        sub_url: string,
        state_setter: React.Dispatch<React.SetStateAction<any>>,
    ) => {
        if (LOCAL_DEBUG) console.log(BASE_URL + sub_url);
        const api_response = await axios.get(BASE_URL + sub_url);
        state_setter(api_response.data.api_response);
        if (LOCAL_DEBUG) console.log(api_response.data.api_response);
    };

    // =========== UseEffect Section ===========
    // Fetch the Seassion Year Data
    useEffect(() => {
        let backend_input_string = "/ui/";
        api_fetch_func(backend_input_string, set_seassion_array_state);
    }, []);

    // Set the race track to zero again
    useEffect(() => {
        let race_select_box = document.getElementById(
            "Race_Select_Box",
        ) as HTMLSelectElement;
        race_select_box.selectedIndex = 0;
    }, [track_name_array_state]);

    // Fetch the Track Name Data
    useEffect(() => {
        if (!(selected_year_state === "")) {
            let backend_input_string = `/ui?year=${selected_year_state}&session_type=${"Race"}`;
            api_fetch_func(backend_input_string, set_track_name_array_state);
        }
    }, [selected_year_state]);

    // Fetch the Graph Data
    useEffect(() => {
        if (!(selected_race_state === "")) {
            let backend_input_string = `/graph/race_position/?year=${selected_year_state}&race_name=${selected_race_state.split("  ")[0]}&session_name=${selected_race_state.split("  ")[1]}`;
            api_fetch_func(backend_input_string, set_graph_data_state);
        }
    }, [selected_race_state]);

    // =========== Return Section ===========
    return (
        <div className="PL_Main_Div">
            <img
                src={home_page_backgraound}
                alt="Formula 1 Background"
                className="PL_Background_Image"
            />
            <div className="PL_Blur_Div"></div>

            <div className="PL_Window_Div">
                <div className="PL_Combined_Div">
                    <div className="PL_Info_Div">
                        <h3 className="PL_Info_Title">Driver Postition</h3>

                        <span className="PL_Info_Text">
                            This graph displays each driver's position on every
                            lap, letting you follow their progress through the
                            race. You can also highlight a specific driver using
                            the legend on the right. <i>-- Just hover it -- </i>
                        </span>
                    </div>

                    <div className="PL_Divider"></div>

                    <div className="PL_Control_Div">
                        <div className="PL_Control_Upper_Div">
                            <p className="PL_Select_Title_Span"> Season : </p>
                            <select
                                className="PL_Select_Box"
                                id="Season_Select_Box"
                                onChange={() => {
                                    set_selected_year_state(
                                        (
                                            document.getElementById(
                                                "Season_Select_Box",
                                            ) as HTMLInputElement
                                        ).value,
                                    );
                                }}
                            >
                                <option value={""}>
                                    {" "}
                                    {"Select the Seassion"}{" "}
                                </option>
                                {seassion_array_state.map(
                                    (track_name, index) => (
                                        <option value={track_name}>
                                            {" "}
                                            {track_name}{" "}
                                        </option>
                                    ),
                                )}
                            </select>

                            <p className="PL_Select_Title_Span LT_Race">
                                {" "}
                                Races :{" "}
                            </p>
                            <select
                                className="PL_Select_Box PL_Race_Box"
                                id="Race_Select_Box"
                                onChange={() => {
                                    set_selected_race_state(
                                        (
                                            document.getElementById(
                                                "Race_Select_Box",
                                            ) as HTMLInputElement
                                        ).value,
                                    );
                                }}
                            >
                                <option value={""}>
                                    {" "}
                                    {"Select the Seassion"}{" "}
                                </option>
                                {track_name_array_state.map(
                                    (track_name, index) => (
                                        <option value={track_name}>
                                            {" "}
                                            {track_name}{" "}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>
                    </div>
                </div>

                {graph_data_state !== null ? (
                    <Position_Line_Graph
                        graph_data={graph_data_state.graph_data}
                        color_map={graph_data_state.color_map}
                    />
                ) : null}
            </div>
        </div>
    );
}

export default Position_Line_Page;
