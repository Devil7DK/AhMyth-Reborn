import { makeAutoObservable } from 'mobx';
import React, {
    createContext,
    type PropsWithChildren,
    useContext,
    useMemo,
} from 'react';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RootStore {
    constructor() {
        makeAutoObservable(this);
    }
}

const StoreContext = createContext({} satisfies RootStore);

export const StoreProvider: React.FC<PropsWithChildren<unknown>> = ({
    children,
}) => {
    const store = useMemo(() => new RootStore(), []);

    return (
        <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
    );
};

export const useStore = (): RootStore => useContext(StoreContext);
