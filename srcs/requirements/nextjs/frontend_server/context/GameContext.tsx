import React, { createContext, useContext, useReducer, ReactNode } from "react";

interface GameContextData {
  gameMode: number; // friend, normal, rank
  ballSpeedOption: number;
  mapType: number;
  aPlayer: { nick: string; id: number };
  aScore: number;
  bPlayer: { nick: string; id: number };
  bScore: number;
  latency: number;
  roomId: string;
  serverDateTime: number;
  degree: { x: number; y: number };
}

enum SpeedOption {
  speed1,
  speed2,
  speed3,
}

enum MapOption {
  map1,
  map2,
  map3,
}

enum GameType {
  FRIEND,
  NORMAL,
  RANK,
}

interface IGameOption {
  gameType: GameType; // FRIED, NORMAL, RANK
  userIdx: number;
  speed: SpeedOption; //NORMAL, FAST, FASTER
  mapNumber: MapOption; // A, B, C
}

type GameAction =
  | { type: "SET_GAME_MODE"; value: GameType }
  | { type: "SET_BALL_SPEED_OPTION"; value: SpeedOption }
  | { type: "SET_MAP_TYPE"; value: MapOption }
  | { type: "SET_LATENCY"; value: number }
  | { type: "A_PLAYER"; value: { nick: string; id: number } }
  | { type: "A_SCORE"; value: number }
  | { type: "B_PLAYER"; value: { nick: string; id: number } }
  | { type: "B_SCORE"; value: number }
  | { type: "SCORE_RESET" }
  | { type: "GAME_RESET"; value: GameContextData }
  | { type: "SET_ROOM_ID"; value: string }
  | { type: "SET_SERVER_DATE_TIME"; value: number }
  | { type: "SET_DEGREE"; value: { x: number; y: number } };

const initialState: GameContextData = {
  gameMode: 1,
  ballSpeedOption: 3,
  mapType: MapOption.map2,
  latency: 0,
  aPlayer: { nick: "", id: 0 },
  aScore: 0,
  bPlayer: { nick: "", id: 0 },
  bScore: 0,
  roomId: "",
  serverDateTime: 0,
  degree: { x: 0, y: 0 },
};

export function resetGameContextData(): GameContextData {
  return {
    gameMode: 1,
    ballSpeedOption: 3,
    mapType: MapOption.map2,
    latency: 0,
    aPlayer: { nick: "", id: 0 },
    aScore: 0,
    bPlayer: { nick: "", id: 0 },
    bScore: 0,
    roomId: "",
    serverDateTime: 0,
    degree: { x: 0, y: 0 },
  };
}

function gameReducer(state: GameContextData, action: GameAction) {
  switch (action.type) {
    case "SET_GAME_MODE": {
      return { ...state, gameMode: action.value };
    }
    case "SET_BALL_SPEED_OPTION": {
      if (action.value === SpeedOption.speed1)
        return { ...state, ballSpeedOption: 2 };
      else if (action.value === SpeedOption.speed2)
        return { ...state, ballSpeedOption: 3 };
      else if (action.value === SpeedOption.speed3)
        return { ...state, ballSpeedOption: 4 };
    }
    case "SET_MAP_TYPE":
      return { ...state, mapType: action.value };
    case "SET_LATENCY":
      return { ...state, latency: action.value };
    case "A_PLAYER":
      return { ...state, aPlayer: action.value };
    case "A_SCORE":
      return { ...state, aScore: action.value };
    case "B_PLAYER":
      return { ...state, bPlayer: action.value };
    case "B_SCORE":
      return { ...state, bScore: action.value };
    case "SCORE_RESET":
      return { ...state, aScore: 0, bScore: 0 };
    case "GAME_RESET":
      return { ...state, state: action.value };
    case "SET_ROOM_ID":
      return { ...state, roomId: action.value };
    case "SET_SERVER_DATE_TIME":
      return { ...state, serverDateTime: action.value };
    case "SET_DEGREE":
      return { ...state, degree: action.value };
    default:
      return state;
  }
}

const GameContext = createContext<{
  gameState: GameContextData;
  gameDispatch: React.Dispatch<GameAction>;
}>({
  gameState: initialState,
  gameDispatch: () => {},
});

export const useGame = () => {
  return useContext(GameContext);
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, gameDispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ gameState, gameDispatch }}>
      {children}
    </GameContext.Provider>
  );
};
