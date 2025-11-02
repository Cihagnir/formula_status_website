// Import
import axios from "axios";
import React, { useState, useEffect } from "react";

// Hand Made Import
import { BASE_URL } from "../../../Commen_Utils";
import { Lap_Compare_Graph } from "./Graph_Obj";
import { quali_lap_compre_graph_input_interface } from "../../../Commen_Utils";

// CSS Import
import "./Lap_Time_Comp_Page.css";
import home_page_backgraound from "../../../../img/home_page_back.jpg";

const LOCAL_DEBUG = true;

// Return function
function Lap_Compr_Page() {
    // ======== UseState Section ========

    // Dropdown Box Selection and Sliders
    const [selected_race_state, set_selected_race_state] = useState<string>("");
    const [selected_year_state, set_selected_year_state] = useState<string>("");
    const [selected_first_driver_state, set_selected_first_driver_state] =
        useState<string>("");
    const [selected_first_session_state, set_selected_first_session_state] =
        useState<string>("");
    const [selected_second_driver_state, set_selected_second_driver_state] =
        useState<string>("");
    const [selected_second_session_state, set_selected_second_session_state] =
        useState<string>("");

    // Graph Data
    const [graph_data_state, set_graph_data_state] =
        useState<quali_lap_compre_graph_input_interface | null>(null);

    // Dropdown Box Datas
    const [seassion_array_state, set_seassion_array_state] = useState([]);
    const [session_info_json_state, set_session_info_json_state] = useState<{
        [keys: string]: Array<string>;
    }>({});
    const [race_name_array_state, set_race_name_array_state] = useState([
        "Select the Race",
    ]);

    // ======== Api Fetch Function ========
    const api_fetch_func = async (
        sub_url: string,
        state_setter: React.Dispatch<React.SetStateAction<any>>,
    ) => {
        if (LOCAL_DEBUG) console.log(BASE_URL + sub_url);
        const api_response = await axios.get(BASE_URL + sub_url);
        state_setter(api_response.data.api_response);
        if (LOCAL_DEBUG) console.log(api_response.data.api_response);
    };

    // ======== UseEffect Section ========

    // Fetch the Seassion Year Data
    useEffect(() => {
        let backend_input_string = "/ui/";
        api_fetch_func(backend_input_string, set_seassion_array_state);
    }, []);

    // Fetch the Track Name Data
    useEffect(() => {
        if (!(selected_year_state === "")) {
            let backend_input_string = `/ui/?year=${selected_year_state}&session_type=${"Qualifying"}`;
            api_fetch_func(backend_input_string, set_race_name_array_state);
        }
    }, [selected_year_state]);

    // Fetch the Driver Name Data
    useEffect(() => {
        if (!(selected_race_state === "")) {
            set_session_info_json_state({});
            let backend_input_string = `/ui/pos_data_quali/?year=${selected_year_state}&race_name=${selected_race_state.split("  ")[0]}`;
            api_fetch_func(backend_input_string, set_session_info_json_state);
        }
    }, [selected_race_state]);

    // Fetch the Graph Data
    useEffect(() => {
        if (
            !(selected_first_driver_state === "") &&
            !(selected_second_driver_state === "")
        ) {
            let backend_input_string: string = `/graph/qualifying_laps_compr/?year=${selected_year_state}&race_name=${selected_race_state.split("  ")[0]}&lap_one_session_name=${selected_first_session_state}&lap_one_driver=${selected_first_driver_state}&lap_two_session_name=${selected_second_session_state}&lap_two_driver=${selected_second_driver_state} `;
            api_fetch_func(backend_input_string, set_graph_data_state);
        }
    }, [selected_first_driver_state, selected_second_driver_state]);

    // ======== Local Arrow Functions ========

    const race_change_handler = () => {
        set_selected_race_state(
            (document.getElementById("Race_Select_Box") as HTMLInputElement)
                .value,
        );

        // Reset session and driver selections for first lap
        set_selected_first_session_state("");
        set_selected_first_driver_state("");

        // Reset the select boxes
        (
            document.getElementById(
                "Session_Select_Box_One",
            ) as HTMLSelectElement
        ).value = "";
        (
            document.getElementById(
                "Driver_Select_Box_One",
            ) as HTMLSelectElement
        ).value = "";

        // Also reset second lap selections to maintain consistency
        set_selected_second_session_state("");
        set_selected_second_driver_state("");
        (
            document.getElementById(
                "Session_Select_Box_Two",
            ) as HTMLSelectElement
        ).value = "";
        (
            document.getElementById(
                "Driver_Select_Box_Two",
            ) as HTMLSelectElement
        ).value = "";
    };

    // ======== Return Section ========

    return (
        <div className="LTC_Main_Div">
            <img
                src={home_page_backgraound}
                alt="Formula 1 Background"
                className="LTC_Background_Image"
            />
            <div className="LTC_Blur_Div" />

            <div className="LTC_Window_Div">
                <div className="LTC_Combined_Div">
                    <div className="LTC_Combined_Upper_Div">
                        <h3 className="LTC_Info_Title">
                            On Track Lap Comperation
                        </h3>

                        <span className="LTC_Info_Text">
                            Basic comparison between the driver qualification
                            laps, provide us more understanding about car's
                            limits and characteristics. You could select the any
                            two driver's laps you want from the each qualifying
                            session.
                        </span>
                    </div>

                    <div className="LTC_Divider"></div>

                    <div className="LTC_Combined_Middle_Div">
                        <p className="LTC_Select_Title_Span"> Season : </p>
                        <select
                            className="LTC_Select_Box"
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
                            <option value={"None"}>
                                {" "}
                                {"Select the Seassion"}{" "}
                            </option>{" "}
                            ;
                            {seassion_array_state.map((track_name, index) => (
                                <option value={track_name}>
                                    {" "}
                                    {track_name}{" "}
                                </option>
                            ))}
                        </select>

                        <p className="LTC_Select_Title_Span LTC_Race">
                            {" "}
                            Qualification :{" "}
                        </p>
                        <select
                            className="LTC_Select_Box LTC_Race_Box"
                            id="Race_Select_Box"
                            onChange={race_change_handler}
                        >
                            <option value={""}>
                                {" "}
                                {"Select the Seassion"}{" "}
                            </option>{" "}
                            ;
                            {race_name_array_state.map((track_name, index) => (
                                <option value={track_name}>
                                    {" "}
                                    {track_name}{" "}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="LTC_Combined_Bottom_Div">
                        <div className="LTC_Combined_Bottom_First_Lap_Div">
                            <span>Lap One :</span>

                            <select
                                className="LTC_Select_Box LTC_Select_Bottom"
                                id="Session_Select_Box_One"
                                onChange={() =>
                                    set_selected_first_session_state(
                                        (
                                            document.getElementById(
                                                "Session_Select_Box_One",
                                            ) as HTMLInputElement
                                        ).value,
                                    )
                                }
                            >
                                <option value={""}> Session </option>

                                {!(selected_race_state === "") &&
                                    Object.keys(session_info_json_state).map(
                                        (session_name, index) => (
                                            <option value={session_name}>
                                                {" "}
                                                {session_name}{" "}
                                            </option>
                                        ),
                                    )}
                            </select>

                            <select
                                className="LTC_Select_Box LTC_Select_Bottom"
                                id="Driver_Select_Box_One"
                                onChange={() =>
                                    set_selected_first_driver_state(
                                        (
                                            document.getElementById(
                                                "Driver_Select_Box_One",
                                            ) as HTMLInputElement
                                        ).value,
                                    )
                                }
                            >
                                <option value={""}> Driver </option>

                                {session_info_json_state[
                                    selected_first_session_state
                                ] &&
                                    session_info_json_state[
                                        selected_first_session_state
                                    ].map((driver_name, index) => (
                                        <option value={driver_name}>
                                            {" "}
                                            {driver_name}{" "}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="LTC_Combined_Bottom_Second_Lap_Div">
                            <span>Lap Two :</span>

                            <select
                                className="LTC_Select_Box LTC_Select_Bottom"
                                id="Session_Select_Box_Two"
                                onChange={() =>
                                    set_selected_second_session_state(
                                        (
                                            document.getElementById(
                                                "Session_Select_Box_Two",
                                            ) as HTMLInputElement
                                        ).value,
                                    )
                                }
                            >
                                <option value={""}> Session </option>

                                {!(selected_race_state === "") &&
                                    Object.keys(session_info_json_state).map(
                                        (session_name, index) => (
                                            <option value={session_name}>
                                                {" "}
                                                {session_name}{" "}
                                            </option>
                                        ),
                                    )}
                            </select>

                            <select
                                className="LTC_Select_Box LTC_Select_Bottom"
                                id="Driver_Select_Box_Two"
                                onChange={() =>
                                    set_selected_second_driver_state(
                                        (
                                            document.getElementById(
                                                "Driver_Select_Box_Two",
                                            ) as HTMLInputElement
                                        ).value,
                                    )
                                }
                            >
                                <option value=""> Driver </option>

                                {session_info_json_state[
                                    selected_second_session_state
                                ] &&
                                    session_info_json_state[
                                        selected_second_session_state
                                    ].map((driver_name, index) => (
                                        <option value={driver_name}>
                                            {" "}
                                            {driver_name}{" "}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>
                </div>

                {graph_data_state !== null ? (
                    <Lap_Compare_Graph
                        graph_data={graph_data_state.graph_data}
                        graph_info={graph_data_state.graph_info}
                    />
                ) : null}
            </div>
        </div>
    );
}

export default Lap_Compr_Page;
