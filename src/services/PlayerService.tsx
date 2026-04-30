import { BACKEND_URL } from "../constants";
import axios from 'axios'


export const PlayerService = () => ({

    getAllPlayers: (params:any) => {
        console.log("teamId== ", params);
        if(params.teamId){
            return(axios.get(BACKEND_URL + "/players/" + params.teamId))
        }else{
            return(axios.get(BACKEND_URL + "/players/" + `?limit=${128}&offset=${0}`))
        }
        
    },

    displayTeamScores: ()=>{
        return(axios.post(BACKEND_URL + "/display_team_scores"))
    },

    getAllTeams: () => {
        return(axios.get(BACKEND_URL + "/teams/" ))
    },

    GetNonBidPlayers : (searchText:string) => {
        let url = '';
        if(searchText){
            url = BACKEND_URL + "/non_bid_players/" + searchText
        }else{
            url = BACKEND_URL + "/non_bid_players"
        }
        return(axios.get(url))
    },

    addPlayer : (params:any) => {
        return(axios.post(BACKEND_URL + "/players", params))
    },

    sellPlayer : (params:any)=>{
        return(axios.put(BACKEND_URL + "/players", params))
    },

    setUnsoldPlayer : (params:any)=>{
        return (axios.put(BACKEND_URL + "/players", params))
    },

    displayPlayer : (player:any)=>{
        return(axios.post(BACKEND_URL + "/player_display", player))
    },

    teamCall : (bidCallData :any)=>{
        return(axios.post(BACKEND_URL + "/team_call", bidCallData))
    },

    getSoldPlayers : () =>{
        return(axios.get(BACKEND_URL + "/sold_players"))
    },

    teamComplete : (teamData :any)=>{
        return(axios.post(BACKEND_URL + "/team_complete", teamData))
    },

    closePopup: ()=>{
        return(axios.post(BACKEND_URL + "/close_popup"))
    },

    getUnsoldPlayers : () =>{
        return(axios.get(BACKEND_URL + "/update_unsold"))
    },

    PlayerImageUpload : (formData:any) => {
        return(axios.post(BACKEND_URL + "/player_image_upload", formData))
    },

    PlayerImageGoogleUpload : (formData:any) => {
        return(axios.post(BACKEND_URL + "/google-upload-file", formData))
    },

    PlayerImageGoogleStorageCloudUpload : (formData:any) => {
        return(axios.post(BACKEND_URL + "/gcsupload", formData))
    }


});

export default PlayerService;