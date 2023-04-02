import { createContext, useContext, useReducer } from "react";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  const INITIAL_STATE = {
    chatId: "null",
    user: {},
    activeIndex: 0,
  };

  const chatReducer = (state, action) => {
    switch (action.type) {
      case "CHANGE_USER":
        const newChatId =
          currentUser.uid > action.payload.uid
            ? currentUser.uid + action.payload.uid
            : action.payload.uid + currentUser.uid;
        const newActiveIndex = state.activeIndex + 1;
        return {
          ...state,
          user: action.payload,
          chatId: newChatId,
          activeIndex: newActiveIndex,
        };

      case "SET_ACTIVE_INDEX":
        return {
          ...state,
          activeIndex: action.payload,
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  return (
    <ChatContext.Provider value={{ data: state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
