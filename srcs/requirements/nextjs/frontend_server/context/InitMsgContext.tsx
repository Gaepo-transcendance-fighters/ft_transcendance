import { createContext, useContext, useReducer, ReactNode } from "react";
import { IChatDmEnter } from "@/type/RoomType";

interface InitMsgContextData {
  dmEnterEntry: IChatDmEnter | null;
}

type InitMsgAction = {
  type: "SET_INIT_MSG";
  value: IChatDmEnter;
};

const InitialState: InitMsgContextData = {
  dmEnterEntry: null,
};

const InitMsgReducer = (
  state: InitMsgContextData,
  action: InitMsgAction
): InitMsgContextData => {
  switch (action.type) {
    case "SET_INIT_MSG":
      return { dmEnterEntry: action.value };
    default:
      return state
  }
};

const InitMsgContext = createContext<{
  initMsgState: InitMsgContextData;
  initMsgDispatch: React.Dispatch<InitMsgAction>;
}>({
  initMsgState: InitialState,
  initMsgDispatch: () => {},
});

export const useInitMsg = () => {
  return useContext(InitMsgContext);
};

export const InitMsgProvider = ({ children }: { children: ReactNode }) => {
  const [initMsgState, initMsgDispatch] = useReducer(InitMsgReducer, InitialState);

  return (
    <InitMsgContext.Provider value={{ initMsgState, initMsgDispatch }}>
      {children}
    </InitMsgContext.Provider>
  );
};
