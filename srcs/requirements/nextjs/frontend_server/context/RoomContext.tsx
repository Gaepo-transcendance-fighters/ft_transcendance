import { IChatRoom, IDmMemList, IMember } from "@/type/type";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";

interface RoomContextData {
  dmRooms: IChatRoom[];
  nonDmRooms: IChatRoom[];
  currentRoom: IChatRoom | null;
  currentRoomMemberList: IMember[];
  isOpen: boolean;
  currentDmRoomMemberList: IDmMemList | null;
  adminAry: { nickname: string }[];
}

type RoomAction =
  | { type: "SET_DM_ROOMS"; value: IChatRoom[] }
  | { type: "SET_NON_DM_ROOMS"; value: IChatRoom[] }
  | { type: "SET_CUR_ROOM"; value: IChatRoom | null }
  | { type: "SET_CUR_MEM"; value: IMember[] }
  | { type: "SET_IS_OPEN"; value: boolean }
  | { type: "ADD_ROOM"; value: IChatRoom }
  | { type: "SET_CUR_DM_MEM"; value: IDmMemList }
  | { type: "SET_ADMIN_ARY"; value: { nickname: string }[] };

const initialState: RoomContextData = {
  dmRooms: [],
  nonDmRooms: [],
  currentRoom: null,
  currentRoomMemberList: [],
  isOpen: false,
  currentDmRoomMemberList: null,
  adminAry: [],
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

  useEffect(() => {}, []);

  return (
    <RoomContext.Provider value={{ roomState, roomDispatch }}>
      {children}
    </RoomContext.Provider>
  );
};
