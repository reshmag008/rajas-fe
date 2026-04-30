import React, { ChangeEvent, useEffect, useState } from "react";
import PlayerService from "../services/PlayerService";
import { BACKEND_URL, roomId, TOTAL_PLAYER } from "../constants";
import playerSvg from '../assets/account-icon.png'
import battingSvg from '../assets/batter.png'
import ballingSvg from '../assets/tennisBall.jpg'
import logo from "../assets/icon.png";
import 'reactjs-popup/dist/index.css';
import Loader from "react-js-loader";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import gradient from "../assets/aution_card.jpeg"
import congratsJif from '../assets/congratulations.gif';
import clapJif from '../assets/clap.gif'
import { io } from "socket.io-client";
import CelebrationPopup from "./celebrationPopup";




const AuctionCenter: React.FC = () => {

  const baseAmount = 1000;
  const [allTeams, setAllTeams] = useState<any>([]);
  const [bidFlow, setBidFlow] = useState<any>([]);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [currentBidTeam, setCurrentBidTeam] = useState<any>({});
  const [players, setPlayers] = useState<any>([]);
  const [currentBidPlayer, setCurrentBidPlayer] = useState<any>({});
  const [searchText, setSearchText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [popUpContent, setPopUpContent] = useState<any>({})
  const [openPopUp, setOpenPopUp] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  
 useEffect(() => {
    const newSocket = io(BACKEND_URL,{
                transports: ["polling", "websocket"],
                withCredentials: true,
                reconnection: true,
            });;
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
      if (socket) {

        socket.emit("join-room", roomId);

        socket.on("current_player", (data:any) => {
          console.log("Received:", data);
        });
        
      }
    }, [socket]);



  useEffect(() => {
    setBidFlow([]);
    setBidAmount(0);
    setCurrentBidTeam({})
    GetAllTeams();
    GetPlayer();
  }, []);

  const GetPlayer = () => {
    // localStorage.setItem("selectedPlayer", JSON.stringify({}));
    localStorage.setItem('close_popup', 'false');
    localStorage.setItem("team_complete",  JSON.stringify({}))
    console.log("searchText== ", searchText);
    setCurrentBidPlayer({});
    setPlayers([]);
    setBidFlow([]);
    setCurrentBidTeam({})
    setBidAmount(0)
    setIsLoading(true)
    PlayerService()
      .GetNonBidPlayers(searchText)
      .then((response: any) => {
        let players = response?.data;
        setSearchText('')
        if (players.length === 0) {
          toast.success("No pending players");
          localStorage.setItem("selectedPlayer", JSON.stringify({}));
          localStorage.setItem("team_complete",  JSON.stringify({}))
          localStorage.setItem('close_popup', 'false');
        }
        if (players.length === 1) {
          setCurrentBidPlayer(players[0]);
          localStorage.setItem("selectedPlayer", JSON.stringify(players[0]));
          localStorage.setItem("team_complete",  JSON.stringify({}))
          localStorage.setItem('close_popup', 'false');
          PlayerService().displayPlayer(players[0]).then((response: any) => {
      console.log("response== ", response);
    })
          setIsLoading(false);
        } else {
          setPlayers(players);
          selectRandomPlayer();
        }
      });
  };

  const selectRandomPlayer = () => {
    const random = Math.floor(Math.random() * players.length);
    console.log(random, players[random]);
    setCurrentBidPlayer(players[random]);
    console.log("currentBidPlayer== ", players[random]);
    localStorage.setItem("selectedPlayer", JSON.stringify(players[random]));
    localStorage.setItem("team_complete",  JSON.stringify({}))
    localStorage.setItem('close_popup', 'false');
    PlayerService().displayPlayer(players[random]).then((response: any) => {
      console.log("response== ", response);
    })
    setIsLoading(false);
  };

  const GetAllTeams = () => {
    try {
      PlayerService()
        .getAllTeams()
        .then((response: any) => {
          setAllTeams(response?.data);
        });
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log("value=== ", value);
    setSearchText(value);
  };

  const cardClick = (team: any, index: number) => {
    // setCurrentBidTeam(team);
    console.log("bidFlow.value== ", bidFlow);
    if (bidFlow.length === 0) {
      let flow = [];
      let amount = bidAmount + baseAmount;
      if (amount > team.max_bid_amount) {
        toast.error('Bid amount larger than max amount')
      } else {
        setCurrentBidTeam(team);
        console.log("amount== ", amount);
        setBidAmount(amount);
        flow.push({ id: team.id, team_name: team.team_name, amount: amount });
        console.log("flow== ", flow);
        InvokeTeamCall(flow[flow.length - 1])
        setBidFlow(flow);
        console.log("bidFlow== ", bidFlow);
      }
    }
    if (bidFlow && bidFlow.length && bidFlow.length > 0) {
      if (bidFlow[bidFlow.length - 1].id !== team.id) {
        // let amount = bidAmount + baseAmount;
        let amount;
        let lastBidAmount = bidFlow[bidFlow.length - 1].amount;
        console.log("lastBidAmount=== ", lastBidAmount);
        if(lastBidAmount >= 10000){
        amount = bidAmount + 1000
        }else{
          amount = bidAmount + 1000
        }

        if (amount > team.max_bid_amount) {
          toast.error('Bid amount larger than max amount')
        } else {
          setCurrentBidTeam(team);
          // socket.emit('current_bid' , {'team_name' :team.team_name, 'points':amount })
          setBidAmount(amount);
          let flow = bidFlow;
          flow.push({
            id: team.id,
            team_name: team.team_name,
            amount: amount,
          });
          InvokeTeamCall(flow[flow.length - 1])
          setBidFlow(flow);
          console.log("bidFlow== ", bidFlow);
        }
      }
    }

  };


  const InvokeTeamCall = (teamcallData: any) => {
    PlayerService().teamCall(teamcallData).then((response: any) => {

    })
  }

  const handleBidBack = () => {
    let flow = bidFlow;
    flow.pop();
    console.log("flow=== ", flow);
    setBidFlow(flow);
    console.log("bidfloww== ", bidFlow);
    if (bidFlow && bidFlow.length > 0) {
      let currentTeam = bidFlow[bidFlow.length - 1];
      console.log("currentTeam== ", currentTeam);
      setCurrentBidTeam(currentTeam);
      setBidAmount(currentTeam.amount)
    }
    if (bidFlow.length === 0) {
      let currentTeam = {};
      setCurrentBidTeam(currentTeam);
      setBidAmount(0);
    }
  }

  const setUnsoldPlayer = () => {
    setIsLoading(true);
    let params = {
      id: currentBidPlayer.id,
      un_sold: true
    }

    PlayerService().setUnsoldPlayer(params).then((response: any) => {
      console.log("response== ", response.data);
      GetPlayer();
    })
  }

  const sellPlayer = () => {
    setIsLoading(true);
    if (currentBidTeam && currentBidTeam.id) {
      let params = {
        id: currentBidPlayer.id,
        team_id: currentBidTeam.id,
        bid_amount: bidAmount,
        team_name: currentBidTeam.team_name,
        player_name: currentBidPlayer.fullname
      };
      console.log("params== ", params);


      PlayerService().sellPlayer(params).then((response: any) => {
        console.log("response.data==", response.data);
        GetPlayer();
        GetAllTeams();
        setBidFlow([]);
        setBidAmount(0);
        setCurrentBidTeam({})
        if (response.data && response.data.player_count === TOTAL_PLAYER) {
          localStorage.setItem("team_complete",JSON.stringify(response.data))
          InvokeTeamComplete(response.data)
          setOpenPopUp(true);
          setPopUpContent(response.data);
        }
      })
    } else {
      setIsLoading(false);
      toast.warning("Please select a team and amount.");
    }

  }

  const InvokeTeamComplete = (teamData: any) => {
    PlayerService().teamComplete(teamData)
  }

  const InvokeClosePopup = () => {
    localStorage.setItem('close_popup', 'true');
    PlayerService().closePopup()
  }

  const handleBidChange = (event: ChangeEvent<HTMLInputElement>) => {
    setBidAmount(event.target.value ? parseInt(event.target.value) : 0);
  }

  const getUnsoldPlayers = () => {
    PlayerService().getUnsoldPlayers().then((response: any) => {
      console.log("response== ", response);
      if (response && response.data && response.data.length && response.data[0] > 0) {
        GetPlayer();
      } else {
        toast.success("Unsold players not found");
      }
    })
  }

  const capitalizeFirst = (str: any) => {
    if (!str) return "";
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const closePopUp = () =>{
    setOpenPopUp(!openPopUp);
    InvokeClosePopup();
  }

   const displayScores = () =>{
    PlayerService().displayTeamScores()
  }



  return (
    <div >

      {openPopUp &&
        <div style={overlay}>
          <div style={popUpStyle} >
            <div style={{ textAlign: 'right', marginTop: '-25px', marginRight: '-30px' }}>
              <button style={closeButtonStyle} onClick={() => closePopUp()}>X</button>
            </div>

            <div>
              <img src={congratsJif} alt="logo" style={jifStyle} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>

              {popUpContent.team_logo &&
                // <img src={BACKEND_URL + '/player_images/' + popUpContent.team_logo} alt="logo" style={popupimageStyle} />

                <img
            src={`https://storage.googleapis.com/rajas_pl/${popUpContent.team_logo}`}
            alt="ogo"
            style={popupimageStyle}
        />

              }

              <span style={{
                padding: "10px",
                fontWeight: 'bold',
                fontSize: '38px',
                fontFamily: 'Georgia, serif'
              }}>{popUpContent.team_name}</span>

            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span>Completed Auction</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={clapJif} alt="logo" style={{ height: "8rem", width: "8rem", padding: "10px", }} />
            </div>

          </div>
        </div>
      }

    


      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" />



      {isLoading && <Loader type="spinner-cub" bgColor={'green'} color={'green'} title={"Selecting Player..."} size={100} />}
      {!isLoading && currentBidPlayer && currentBidPlayer.id && (

        <div style={playerCountStyle}>
          <div id='content-id' style={playerListContainer}>
            <div style={players__card__wrap} >

              <div style={{ display: "flex" }}>
                <img  src={`https://storage.googleapis.com/rajas_pl/${currentBidPlayer.profile_image}`} alt="logo" style={profileImageStyle}/>
                {/* <img src={BACKEND_URL + '/player_images/' + currentBidPlayer.profile_image} alt="logo" style={profileImageStyle} /> */}
              </div>


              <div style={cardHeader}>


                <div style={cardBodyTextStyle}>

                 <div style={{ display: 'flex', textAlign: 'center', width: '53px', }}>
                    <span style={fullNameText}>{currentBidPlayer.id}</span>
                  </div>

                  <div style={{ display: 'flex', marginTop:'-280px', marginLeft:'530px' }}>
                    <span style={spanText1}>{currentBidPlayer.player_role} </span>
                  </div>
                  <div style={{ display: 'flex', marginTop: '0px',marginLeft:'530px' }}>
                    <span style={spanText1}>{currentBidPlayer.batting_style} </span>
                  </div>
                  <div style={{ display: 'flex', marginTop: '-3px',marginLeft:'530px'}}>
                    <span style={spanText1}>{currentBidPlayer.bowling_style} </span>
                  </div>
                  <div style={{ display: 'flex', marginTop: '-5px',marginLeft:'530px', width:'176px', fontSize: currentBidPlayer?.location?.length >10 ? "26px" : "30px"}}>
                    <span style={spanText}>
                      {capitalizeFirst(currentBidPlayer?.location)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', marginLeft: '530px' }}>
                    <span style={spanText}>{currentBidPlayer.contact_no} </span>
                  </div>

                   <div style={{ display: 'flex', marginLeft: '470px',width: '366px', marginTop:'14px', textAlign:'left' }}>
                    <span style={idText}>{currentBidPlayer.fullname.toUpperCase()} </span>
                  </div>

                  

                 



                  



                </div>
              </div>
              <div style={cardFooter}>

              </div>
            </div>
          </div>
        </div>
      )}

      <div style={playerControlStyle}>
        <input
          type="text"
          value={searchText}
          placeholder="Search ID"
          onChange={handleInputChange}
          style={searchStyle}

        />
        <button style={searchuttonStyle} color="primary" onClick={GetPlayer}>
          Search Player
        </button>
        <button style={searchuttonStyle} onClick={sellPlayer} >Sell</button>
        <button style={unSoldButtonStyle} onClick={setUnsoldPlayer} >Un Sold</button>
        <button style={bidBackButtonStyle} onClick={handleBidBack}>Back</button>
        <button style={searchuttonStyle} onClick={getUnsoldPlayers} >Get Unsold Players</button>
        <button style={searchuttonStyle} onClick={displayScores} >Get Team Scores</button>
      </div>

      <div style={teamListContainer}>
        {allTeams &&
          allTeams.map((team: any, index: number) => (
            <>
              {team.player_count !== TOTAL_PLAYER && (
                <div
                  style={currentBidTeam.id === team.id ? hightlightCardContainer : teamCardContainer}
                  onClick={() => cardClick(team, index)}
                  key={index}
                >
                  <div style={teamStyle}>
                    <img  src={`https://storage.googleapis.com/rajas_pl/${team.team_logo}`} alt="logo" style={imageStyle}/>
                    {/* <img key={index} src={BACKEND_URL + '/player_images/' + team.team_logo} alt="logo" style={imageStyle} /> */}

                    <span style={{ padding: "10px" }}>{team.team_name}</span>
                  </div>
                  {currentBidTeam && currentBidTeam.id === team.id && (
                    <input type="text" value={bidAmount} style={inputStyle} onChange={handleBidChange} />
                  )}
                  <hr />
                  Max Bid Amount : {team.max_bid_amount}
                  <hr />
                  {/* Players : {team.player_count}/ { TOTAL_PLAYER } | Points : {team.total_points} */}
                  Points : {team.total_points}  ({team.player_count}/{TOTAL_PLAYER})
                </div>
              )}
            </>
          ))}
      </div>
    </div>
  );
};


const playerCountStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  // backgroundColor:'#d4af37'
}

const teamListContainer: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))",
  // gap: "2rem",
  maxWidth: "120rem",
  margin: "0 auto",
  padding: "1rem",
};


const playerListContainer: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(23rem, 1fr))',
  gap: '2rem',
  // maxWidth: '120rem',
  margin: '0 auto',
  padding: '2rem',
  backgroundColor: 'white',
  // marginTop : '117px'
}

const cardHeaderTextStyle: React.CSSProperties = {
  gap: "2rem",
  cursor: "pointer",
  color: "white",
  textAlign: "left",
  fontSize: "30px",
  textShadow: "1px 1px 0 #999, 2px 2px 0 #999, 3px 3px 0 #999",
};

const cardBodyTextStyle: React.CSSProperties = {
  color: "white",
  textAlign: "left",
  fontSize: "26px",

};

const fullNameText: React.CSSProperties = {
  marginTop: '-333px',
  fontWeight: 'bold',
  fontSize: '34px',
  color: "white",
  width: "53",
  height: "57px",
  marginLeft : "775px"
}


const idText: React.CSSProperties = {
  color: "black",
    fontWeight : '600',
    fontSize : '33px',
    width:'366px'
}

const imageStyle: React.CSSProperties = {
  height: "5rem",
  width: "5rem",
  // padding: "10px",
};

const popupimageStyle: React.CSSProperties = {
  height: "10rem",
  width: "10rem",
  // padding: "10px",
};

const imageStyle1: React.CSSProperties = {
  height: "6rem",
  width: "6rem",
  padding: "10px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "none",
};


const idNumStyle: React.CSSProperties = {
  marginTop: "10px",
  fontWeight: "bold",
  fontSize: "75px",
  marginLeft: "20px",
  fontFamily: "auto",
  border: "5px solid transparent",
  borderRadius: "50%",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  backgroundColor: "yellow",
  color: "red",
  width: "125px",
  textAlign: "center",
  height: "85px"


}
const spanText1: React.CSSProperties = {
  color : 'black',
  fontWeight: "bold",
  fontSize: "30px",
  width:'176px'
};

const spanText: React.CSSProperties = {
 color : 'black',
  fontWeight: "bold",
  width:'176px'
}



const svgStyle: React.CSSProperties = {
  height: "1rem",
  width: "1rem",
  objectFit: "cover",
  padding: "10px",
  filter:
    "invert(85%) sepia(20%) saturate(150%) hue-rotate(200deg) brightness(120%) contrast(120%)",
};

const profileImageStyle: React.CSSProperties = {
  height: '18rem',
  width: '14.3rem',
  // padding: '5px',
  alignItems: 'flex-start',
  // display: 'grid',
  marginLeft: '68px',
  marginTop: '194px',
  objectFit: 'cover',
  // borderRadius: "15px"
  // borderImage: "linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 10%)",
  // maskImage: "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%), linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 20%)",
  // maskComposite: "intersect",

}

const players__card__wrap: React.CSSProperties = {
  width: "973px",//"272%",
  gap: "2rem",
  // backgroundImage: "linear-gradient(to top,  #000033 , #800080)",
  backgroundImage: `url(${gradient})`,
  backgroundSize: 'cover',
  // backgroundRepeat: "no-repeat",
  border: "1px solid #ccc",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  borderRadius: "8px",
  // margin: "0 auto",
  // marginTop: "-120px",
  marginLeft: "13px",//"-328px",
  height: "33rem"
};

const players__card__wrap1: React.CSSProperties = {

  marginTop: "-150px",
  display: 'flex',
  justifyContent: 'flex-end',
  padding: '10px'
};


const cardHeader: React.CSSProperties = {
  display: "grid",
  marginTop: "20px",
  marginLeft: "100px"
};

const cardFooter: React.CSSProperties = {
  display: "flex",
  backgroundColor: "purple",
  marginBottom: "10px",
};

const cardIconTextStyle: React.CSSProperties = {
  padding: '10px',
  cursor: 'pointer',
  color: 'yellow',
  textAlign: 'left',
  fontSize: '50px',
  textShadow: "1px 1px 0 #f00, 2px 2px 0 #f00, 3px 3px 0 #f00",
  fontWeight: "bolder",
  fontStyle: 'italic'
};

const n05IconStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'end', marginLeft: "95px"
}

const no5Style: React.CSSProperties = {
  height: "3rem",
  width: "3rem",
  borderRadius: "50%"
}

const isMobile = window.matchMedia("(max-width: 600px)").matches;
if (isMobile) {
  playerCountStyle.fontSize = "12px"; // Adjust font size for mobile view
  playerCountStyle.padding = "10px";

  playerListContainer.gridTemplateColumns =
    "repeat(auto-fit, minmax(18rem, 1fr))";
  playerListContainer.padding = "0rem";
}

const teamCardContainer: React.CSSProperties = {
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: "8px",
  width: "224px",
  margin: "20px auto",
  cursor: "pointer",
  borderBlockColor: 'green'
};

const hightlightCardContainer: React.CSSProperties = {
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: "8px",
  width: "224px",
  margin: "20px auto",
  cursor: "pointer",
  backgroundColor: 'lightgreen'
};

const teamStyle: React.CSSProperties = {
  display: "flex",
};
const teamLogoStyle: React.CSSProperties = {
  width: "5rem",
  height: "5rem",
  borderRadius: "8px",
  objectFit: "cover"

};

const inputStyle: React.CSSProperties = {
  width: "80%",
  padding: "10px",
  marginTop: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const playerControlStyle: React.CSSProperties = {
  margin: "10px",
  display: 'flex',
  justifyContent: 'center'
};

const searchStyle: React.CSSProperties = {
  width: "20%",
  padding: "10px",
  marginTop: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const searchuttonStyle: React.CSSProperties = {
  backgroundColor: 'green',
  color: 'white',
  padding: '5px 15px',
  borderRadius: '5px',
  outline: '0',
  border: '0',
  textTransform: 'uppercase',
  margin: '10px 0px',
  cursor: 'pointer',
  boxShadow: '0px 2px 2px lightgray',
  transition: 'background-color 250ms ease',
  opacity: 1,
  marginLeft: '10px'
}

const popUpStyle: React.CSSProperties = {
  width: "50%",
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
};

const closeButtonStyle: React.CSSProperties = {
  backgroundColor: 'red',
  color: 'white',
  padding: '5px 15px',
  borderRadius: '60%',
  outline: '0',
  border: '0',
  textTransform: 'uppercase',
  cursor: 'pointer'
}

const unSoldButtonStyle: React.CSSProperties = {
  backgroundColor: 'red',
  color: 'white',
  padding: '5px 15px',
  borderRadius: '5px',
  outline: '0',
  border: '0',
  textTransform: 'uppercase',
  margin: '10px 0px',
  cursor: 'pointer',
  boxShadow: '0px 2px 2px lightgray',
  transition: 'background-color 250ms ease',
  opacity: 1,
  marginLeft: '10px'
}

const bidBackButtonStyle: React.CSSProperties = {
  backgroundColor: 'orange',
  color: 'white',
  padding: '5px 15px',
  borderRadius: '5px',
  outline: '0',
  border: '0',
  textTransform: 'uppercase',
  margin: '10px 0px',
  cursor: 'pointer',
  boxShadow: '0px 2px 2px lightgray',
  transition: 'background-color 250ms ease',
  opacity: 1,
  marginLeft: '10px'
}


const overlay: React.CSSProperties = {
  position: 'fixed',
  top: '0',
  left: "0",
  width: "100%",
  height: " 100%",
  backgroundColor: 'rgba(18, 15, 17, 0.85)', /* Semi-transparent black */
  zIndex: '1000'
}

const jifStyle: React.CSSProperties = {
  height: "8rem",
  width: "20rem",
  padding: "10px",

}




export default AuctionCenter;






