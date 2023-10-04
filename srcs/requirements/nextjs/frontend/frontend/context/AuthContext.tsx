import {
  ReactNode,
  createContext,
  useContext,
  useReducer,
} from "react";
import { Socket } from "socket.io-client";

interface IBlockPerson {
  targetNickname: string;
  targetIdx: number;
}

interface IBlockList {
  blockPerson: IBlockPerson[];
}

interface IUserInfo {
  id: number;
  nickname: string;
  email: string;
  imgUrl: string;
  authorization: string;
  check2Auth: boolean;
}

interface AuthContextData {
  userInfo: IUserInfo;
  blockList: IBlockList | null;
  chatSocket?: Socket;
  gameSocket?: Socket;
}

type AuthAction =
  | { type: "SET_ID"; value: number }
  | { type: "SET_NICKNAME"; value: string }
  | { type: "SET_IMGURL"; value: string }
  | { type: "SET_EMAIL"; value: string }
  | { type: "SET_AUTHORIZATION"; value: string }
  | { type: "SET_CHECK2AUTH"; value: boolean }
  | { type: "SET_BLOCK"; value: IBlockList }
  | { type: "SET_CHAT_SOCKET"; value: Socket }
  | { type: "SET_GAME_SOCKET"; value: Socket };

const initialState: AuthContextData = {
  userInfo: {
    id: 0,
    nickname: "",
    imgUrl: "",
    email: "",
    authorization: "",
    check2Auth: false,
  },
  blockList: null,
};

const AuthReducer = (state: AuthContextData, action: AuthAction) => {
  switch (action.type) {
    case "SET_ID":
      return { ...state, userInfo: { ...state.userInfo, id: action.value } };
    case "SET_IMGURL":
      return {
        ...state,
        userInfo: { ...state.userInfo, imgUrl: action.value },
      };
    case "SET_NICKNAME":
      return {
        ...state,
        userInfo: { ...state.userInfo, nickname: action.value },
      };
    case "SET_EMAIL":
      return { ...state, userInfo: { ...state.userInfo, email: action.value } };
    case "SET_AUTHORIZATION":
      return {
        ...state,
        userInfo: { ...state.userInfo, authorization: action.value },
      };
    case "SET_CHECK2AUTH":
      return {
        ...state,
        userInfo: { ...state.userInfo, check2Auth: action.value },
      };
    case "SET_BLOCK":
      return { ...state, blockList: action.value };
    case "SET_CHAT_SOCKET":
      return { ...state, chatSocket: action.value };
    case "SET_GAME_SOCKET":
      return { ...state, gameSocket: action.value };
    default:
      return state;
  }
};

const AuthContext = createContext<{
  authState: AuthContextData;
  authDispatch: React.Dispatch<AuthAction>;
}>({
  authState: initialState,
  authDispatch: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, authDispatch] = useReducer(AuthReducer, initialState);
  
  return (
    <AuthContext.Provider value={{ authState, authDispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
