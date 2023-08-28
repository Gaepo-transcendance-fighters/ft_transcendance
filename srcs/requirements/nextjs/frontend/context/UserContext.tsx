import { ReactNode, createContext, useContext, useReducer } from "react";

interface UserContextData {
  imgUri: string;
  nickname: string;
  userIdx: number;
}

type UserAction =
  | { type: "CHANGE_IMG"; value: string }
  | { type: "CHANGE_NICK_NAME"; value: string }
  | { type: "SET_USER_IDX"; value: number };

const initialState: UserContextData = {
  imgUri: "",
  nickname: "",
  userIdx: 0,
};

const UserReducer = (
  state: UserContextData,
  action: UserAction
): UserContextData => {
  switch (action.type) {
    case "CHANGE_IMG":
      return { ...state, imgUri: action.value };
    case "CHANGE_NICK_NAME":
      return { ...state, nickname: action.value };
    case "SET_USER_IDX":
      return { ...state, userIdx: action.value };
    default:
      return state;
  }
};

const UserContext = createContext<{
  userState: UserContextData;
  userDispatch: React.Dispatch<UserAction>;
}>({ userState: initialState, userDispatch: () => {} });

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userState, userDispatch] = useReducer(UserReducer, initialState);

  return (
    <UserContext.Provider value={{ userState, userDispatch }}>
      {children}
    </UserContext.Provider>
  );
};
