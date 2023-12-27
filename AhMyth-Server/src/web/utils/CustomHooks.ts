import { useCallback, useEffect, useState } from 'react';

export const useIsMobile = (): boolean => {
    const [isMobile, setIsMobile] = useState(false);

    const onMediaQueryChange = useCallback(
        ({ matches }: MediaQueryListEvent) => {
            setIsMobile(matches);
        },
        [setIsMobile],
    );

    useEffect(() => {
        const match = window.matchMedia('(max-width: 720px)');

        setIsMobile(match.matches);

        match.addEventListener('change', onMediaQueryChange);

        return () => {
            match.removeEventListener('change', onMediaQueryChange);
        };
    }, [onMediaQueryChange]);

    return isMobile;
};
