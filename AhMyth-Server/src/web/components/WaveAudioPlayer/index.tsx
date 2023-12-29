import './styles.scss';

import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { useStore } from '../../store';

interface IProps {
    audioUrl: string | null;
}

export const WaveAudioPlayer: React.FC<IProps> = observer((props) => {
    const { themeStore } = useStore();

    const audioRef = useRef<HTMLAudioElement>(null);
    const waveContainerRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);

    const getColors = useCallback(() => {
        const progressColor =
            waveContainerRef.current !== null
                ? getComputedStyle(waveContainerRef.current).getPropertyValue(
                      '--colorBrandBackground',
                  )
                : 'red';
        const waveColor =
            waveContainerRef.current !== null
                ? getComputedStyle(waveContainerRef.current).getPropertyValue(
                      '--colorNeutralBackground6',
                  )
                : 'blue';

        return {
            waveColor,
            progressColor,
        };
    }, []);

    const initializeWavesurfer = useCallback(() => {
        if (wavesurferRef.current !== null) {
            wavesurferRef.current.destroy();
        }

        if (audioRef.current !== null && waveContainerRef.current !== null) {
            wavesurferRef.current = WaveSurfer.create({
                container: waveContainerRef.current,
                media: audioRef.current,
                height: 'auto',
                ...getColors(),
            });
        }
    }, []);

    useEffect(() => {
        if (wavesurferRef.current !== null) {
            const colors = getColors();

            wavesurferRef.current.setOptions(colors);
        }
    }, [themeStore.theme]);

    useLayoutEffect(() => {
        initializeWavesurfer();
    }, [props.audioUrl]);

    return (
        <div className='wave-audio-player'>
            <div className='wave-container' ref={waveContainerRef}></div>
            <audio
                ref={audioRef}
                aria-disabled={props.audioUrl === null}
                src={props.audioUrl ?? undefined}
                controls
            />
        </div>
    );
});
