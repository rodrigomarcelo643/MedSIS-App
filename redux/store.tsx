import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import { RootState, ActionType } from './types';
import { rootReducer, initialRootState } from './reducers';

// Create contexts for state and dispatch
const StateContext = createContext<RootState | undefined>(undefined);
const DispatchContext = createContext<Dispatch<ActionType> | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(rootReducer, initialRootState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
};

// Custom hooks to access state and dispatch
export const useSelector = <T,>(selector: (state: RootState) => T): T => {
  const state = useContext(StateContext);
  if (state === undefined) {
    throw new Error('useSelector must be used within a StoreProvider');
  }
  return selector(state);
};

export const useDispatch = (): Dispatch<ActionType> => {
  const dispatch = useContext(DispatchContext);
  if (dispatch === undefined) {
    throw new Error('useDispatch must be used within a StoreProvider');
  }
  return dispatch;
};
