import { IChatRoom, IDmMemList, IMember } from "@/type/RoomType";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";

export interface RoomContextData {
  dmRooms: IChatRoom[];
  nonDmRooms: IChatRoom[];
  currentRoom: IChatRoom | null;
  currentRoomMemberList: IMember[];
  isOpen: boolean;
  currentDmRoomMemberList: IDmMemList | null;
  adminAry: { nickname: string }[];
  hasNewDmRoomAlert: boolean;
  isLobbyBtn: boolean;
}

export type RoomAction =
  | { type: "SET_DM_ROOMS"; value: IChatRoom[] }
  | { type: "SET_NON_DM_ROOMS"; value: IChatRoom[] }
  | { type: "SET_CUR_ROOM"; value: IChatRoom | null }
  | { type: "SET_CUR_MEM"; value: IMember[] }
  | { type: "SET_IS_OPEN"; value: boolean }
  | { type: "ADD_ROOM"; value: IChatRoom }
  | { type: "SET_CUR_DM_MEM"; value: IDmMemList }
  | { type: "SET_ADMIN_ARY"; value: { nickname: string }[] }
  | { type: "SET_NEW_DM_ROOM_ALERT"; value: boolean }
  | { type: "SET_IS_LOBBY_BTN"; value: boolean };

const initialState: RoomContextData = {
  dmRooms: [],
  nonDmRooms: [],
  currentRoom: null,
  currentRoomMemberList: [],
  isOpen: false,
  currentDmRoomMemberList: null,
  adminAry: [],
  hasNewDmRoomAlert: false,
  isLobbyBtn: false,
};

const RoomReducer = (roomState: RoomContextData, action: RoomAction) => {
  switch (action.type) {
    case "SET_IS_OPEN":
      return { ...roomState, isOpen: action.value };
    case "SET_DM_ROOMS":
      return { ...roomState, dmRooms: action.value };
    case "SET_NON_DM_ROOMS":
      return { ...roomState, nonDmRooms: action.value };
    case "SET_CUR_ROOM":
      return { ...roomState, currentRoom: action.value };
    case "SET_CUR_MEM":
      return { ...roomState, currentRoomMemberList: action.value };
    case "ADD_ROOM":
      return {
        ...roomState,
        nonDmRooms: [...roomState.nonDmRooms, action.value],
      };
    case "SET_CUR_DM_MEM":
      return { ...roomState, currentDmRoomMemberList: action.value };
    case "SET_ADMIN_ARY":
      return { ...roomState, adminAry: action.value };
    case "SET_NEW_DM_ROOM_ALERT":
      return { ...roomState, hasNewDmRoomAlert: action.value };
    case "SET_IS_LOBBY_BTN":
      return { ...roomState, isLobbyBtn: action.value };
    default:
      return roomState;
  }
};

const RoomContext = createContext<{
  roomState: RoomContextData;
  roomDispatch: React.Dispatch<RoomAction>;
}>({
  roomState: initialState,
  roomDispatch: () => {},
});

export const useRoom = () => {
  return useContext(RoomContext);
};

export const RoomProvider = ({ children }: { children: ReactNode }) => {
  const [roomState, roomDispatch] = useReducer(RoomReducer, initialState);

  return (
    <RoomContext.Provider value={{ roomState, roomDispatch }}>
      {children}
    </RoomContext.Provider>
  );
};
