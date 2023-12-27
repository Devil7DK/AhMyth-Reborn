import React, {
    createContext,
    type PropsWithChildren,
    useContext,
    useMemo,
} from 'react';

import { ThemeStore } from './ThemeStore';

export class RootStore {
    public themeStore = new ThemeStore();
}

const StoreContext = createContext({} as unknown as RootStore);

export const StoreProvider: React.FC<PropsWithChildren<unknown>> = ({
    children,
}) => {
    const store = useMemo(() => new RootStore(), []);

    return (
        <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
    );
};

export const useStore = (): RootStore => useContext(StoreContext);
