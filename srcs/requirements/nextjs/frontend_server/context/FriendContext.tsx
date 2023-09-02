import { ReactNode, createContext, useContext, useReducer } from "react";

interface IFriend {
  friendNickname: string;
  friendIdx?: number;
  isOnline: boolean;
}

interface IBlock {
  targetNickname: string;
  targetIdx: number;
}

interface FriendContextData {
  friendList: IFriend[];
  blockList: IBlock[];
}

type FriendAction =
  | { type: "SET_FRIENDLIST"; value: IFriend[] }
  | { type: "SET_BLOCKLIST"; value: IBlock[] }
  | { type: "ADD_BLOCK"; value: IBlock }
  | { type: "ADD_FRIEND"; value: IFriend };

const initialState: FriendContextData = {
  friendList: [],
  blockList: [],
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
        state.friendList.some(
          (friend) => friend.friendNickname === newFriend.friendNickname
        )
      ) {
        return state;
      } else if (
        state.blockList.some(
          (block) => block.targetNickname === newFriend.friendNickname
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
        state.blockList.some(
          (block) => block.targetNickname === newBlock.targetNickname
        )
      ) {
        return state;
      } else if (
        state.friendList.some(
          (friend) => friend.friendNickname === newBlock.targetNickname
        )
      ) {
        const newFriendList: IFriend[] = state.friendList.filter(
          (friend) => friend.friendNickname !== newBlock.targetNickname
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
