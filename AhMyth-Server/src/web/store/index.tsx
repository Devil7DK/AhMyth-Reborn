import React, {
    createContext,
    type PropsWithChildren,
    useContext,
    useMemo,
} from 'react';

import { PayloadsSocketStore } from './PayloadsSocketStore';
import { ThemeStore } from './ThemeStore';
import { VictimsSocketStore } from './VictimsSocketStore';

export class RootStore {
    public themeStore = new ThemeStore();

    public payloadsSocketStore = new PayloadsSocketStore();
    public victimsSocketStore = new VictimsSocketStore();
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

export * from './PayloadsSocketStore';
export * from './VictimsSocketStore';
