import { IBlock, IFriend } from "@/type/type";
import { ReactNode, createContext, useContext, useReducer } from "react";

interface FriendContextData {
  friendList: IFriend[];
  blockList: IBlock[];
  isFriend: boolean;
}

type FriendAction =
  | { type: "SET_FRIENDLIST"; value: IFriend[] }
  | { type: "SET_BLOCKLIST"; value: IBlock[] }
  | { type: "ADD_BLOCK"; value: IBlock }
  | { type: "ADD_FRIEND"; value: IFriend }
  | { type: "SET_IS_FRIEND"; value: boolean };

const initialState: FriendContextData = {
  friendList: [],
  blockList: [],
  isFriend: false,
};

const FriendReducer = (
  state: FriendContextData,
  action: FriendAction
): FriendContextData => {
  switch (action.type) {
    case "SET_BLOCKLIST":
      return { ...state, blockList: action.value };
    case "SET_FRIENDLIST":
      return { ...state, friendList: action.value };
    case "ADD_FRIEND": {
      const newFriend: IFriend = action.value;
      if (
        state.friendList.find(
          (friend) => friend.friendIdx === newFriend.friendIdx
        )
      ) {
        return state;
      } else if (
        state.blockList.find(
          (block) => block.blockedUserIdx === newFriend.friendIdx
        )
      ) {
        return state;
      } else {
        return { ...state, friendList: [...state.friendList, newFriend] };
      }
    }
    case "ADD_BLOCK": {
      const newBlock: IBlock = action.value;
      if (
        state.blockList.find(
          (block) => block.blockedUserIdx === newBlock.blockedUserIdx
        )
      ) {
        return state;
      } else if (
        state.friendList.find(
          (friend) => friend.friendIdx === newBlock.blockedUserIdx
        )
      ) {
        const newFriendList: IFriend[] = state.friendList.filter(
          (friend) => friend.friendIdx !== newBlock.blockedUserIdx
        );
        return {
          ...state,
          friendList: newFriendList,
          blockList: [...state.blockList, newBlock],
        };
      } else {
        return state;
      }
    }
    case "SET_IS_FRIEND":
      return { ...state, isFriend: action.value };
    default:
      return state;
  }
};

const FriendContext = createContext<{
  friendState: FriendContextData;
  friendDispatch: React.Dispatch<FriendAction>;
}>({ friendState: initialState, friendDispatch: () => {} });

export const useFriend = () => {
  return useContext(FriendContext);
};

export const FriendProvider = ({ children }: { children: ReactNode }) => {
  const [friendState, friendDispatch] = useReducer(FriendReducer, initialState);

  return (
    <FriendContext.Provider value={{ friendState, friendDispatch }}>
      {children}
    </FriendContext.Provider>
  );
};
