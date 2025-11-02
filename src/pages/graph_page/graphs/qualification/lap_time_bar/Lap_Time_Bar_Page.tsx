// Import
import axios from "axios";
import React, { useState, useEffect } from "react";

// Hand Made Import
import Quali_Lap_Time_Graph from "./Graph_Obj";
import { BASE_URL } from "../../../Commen_Utils";
import { quali_graph_data_interface } from "../../../Commen_Utils";

// CSS Import
import "./Lap_Time_Bar_Page.css";
import home_page_backgraound from "../../../../img/home_page_back.jpg";

const LOCAL_DEBUG = false;

// Return function
function Lap_Time_Bar_Page() {
    // ======== UseState Section ========

    // Dropdown Box Selection and Sliders
    const [selected_race_state, set_selected_race_state] = useState<string>("");
    const [selected_year_state, set_selected_year_state] = useState<string>("");

    const [graph_type_state, set_graph_type_state] = useState<number>(0);
    const [selected_sub_session, set_selected_sub_session] =
        useState<number>(0);
    const [sub_session_name_state, set_sub_session_name_state] =
        useState<string>("");

    // Graph Data
    const [graph_data_state, set_graph_data_state] =
        useState<quali_graph_data_interface | null>(null);

    // Dropdown Box Datas
    const [seassion_array_state, set_seassion_array_state] = useState([]);
    const [track_name_array_state, set_track_name_array_state] = useState([
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
            let backend_input_string = `/ui?year=${selected_year_state}&session_type=${"Qualifying"}`;
            api_fetch_func(backend_input_string, set_track_name_array_state);
        }
    }, [selected_year_state]);

    // Fetch the Graph Data
    useEffect(() => {
        if (!(selected_race_state === "")) {
            let backend_input_string: string = `/graph/qualifying_laps_bar/?year=${selected_year_state}&race_name=${selected_race_state.split("  ")[0]}&session_type=${selected_race_state.split("  ")[1]}`;
            api_fetch_func(backend_input_string, set_graph_data_state);
        }
    }, [selected_race_state]);

    // Add useEffect to set initial sub session
    useEffect(() => {
        set_sub_session_name_state("Q1");
    }, []);

    // ======== Local Arrow Functions ========

    const session_change_handler = (session: number) => {
        set_selected_sub_session(session);
        set_sub_session_name_state(`Q${session + 1}`);
    };

    const graph_type_handler = (graph_tye: number) => {
        set_graph_type_state(graph_tye);
    };

    // ======== Return Section ========

    return (
        <div className="LTQ_Main_Div">
            <img
                src={home_page_backgraound}
                alt="Formula 1 Background"
                className="LTQ_Background_Image"
            />
            <div className="LTQ_Blur_Div" />

            <div className="LTQ_Window_Div">
                <div className="LTQ_Combined_Div">
                    <div className="LTQ_Combined_Upper_Div">
                        <h3 className="LTQ_Info_Title">
                            Qualification Lap Time
                        </h3>

                        <span className="LTQ_Info_Text">
                            This graph shows the qualifying results and lap
                            times for each session. As well You can toggle
                            between viewing raw lap times and the gap to pole
                            position.
                        </span>
                    </div>

                    <div className="LTQ_Combined_Middle_Div">
                        <p className="LTQ_Select_Title_Span"> Season : </p>
                        <select
                            className="LTQ_Select_Box"
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

                        <p className="LTQ_Select_Title_Span LTQ_Race">
                            {" "}
                            Qualification :{" "}
                        </p>
                        <select
                            className="LTQ_Select_Box LTQ_Race_Box"
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
                            </option>{" "}
                            ;
                            {track_name_array_state.map((track_name, index) => (
                                <option value={track_name}>
                                    {" "}
                                    {track_name}{" "}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="LTQ_Combined_Bottom_Div">
                        <div className="LTQ_Toggle_Container_Div">
                            <div
                                className="LTQ_Toggle_Slider_Div Sub_Session"
                                style={{
                                    transform: `translateX(${selected_sub_session * 100}%)`,
                                }}
                            />
                            <div className="LTQ_Toggle_Options_Div">
                                {["Q1", "Q2", "Q3"].map((session, index) => (
                                    <div
                                        key={session}
                                        className={`LTQ_Toggle_Option_Div ${selected_sub_session === index ? "active" : ""}`}
                                        onClick={() =>
                                            session_change_handler(index)
                                        }
                                    >
                                        {session}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="LTQ_Toggle_Container_Div">
                            <div
                                className="LTQ_Toggle_Slider_Div Graph_Type"
                                style={{
                                    transform: `translateX(${graph_type_state * 100}%)`,
                                }}
                            />
                            <div className="LTQ_Toggle_Options_Div">
                                {["Lap Time", "Diff Pole"].map(
                                    (session, index) => (
                                        <div
                                            key={session}
                                            className={`LTQ_Toggle_Option_Div ${graph_type_state === index ? "active" : ""}`}
                                            onClick={() =>
                                                graph_type_handler(index)
                                            }
                                        >
                                            {session}
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {graph_data_state !== null ? (
                    <Quali_Lap_Time_Graph
                        graph_data={graph_data_state.graph_data}
                        selected_section={sub_session_name_state}
                        graph_type={graph_type_state}
                        color_map={graph_data_state.color_map}
                    />
                ) : null}
            </div>
        </div>
    );
}

export default Lap_Time_Bar_Page;
