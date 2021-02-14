import React, { useState, useEffect } from 'react';
import { Subject, merge, timer, NEVER, fromEvent } from 'rxjs';
import styles from './ObservablesCounter.module.css';

import { shareReplay, mapTo, startWith, scan, switchMap, withLatestFrom, tap, map } from 'rxjs/operators';
import { doubleClick } from '../../lib/custom-operators/buffer-debounce';

import { queryState } from '../../lib/custom-operators/query-state';
import { toHHMMSS } from '../../lib/time-converters';

const StopWatch = () => {
    const [count, setCount] = useState();
    const resetButtonRef = React.useRef(null);
    const startStopButtonRef = React.useRef(null);
    const waitButtonRef = React.useRef(null);

    const stateKeys = {
        isTicking: 'isTicking',
        count: 'count'
    }

    const inialStopWatchState = {
        [stateKeys.isTicking]: false,
        [stateKeys.count]: 0,
    };

    useEffect(() => {
        const startStopBtn$ = fromEvent(startStopButtonRef.current, 'click');
        const resetBtn$ = fromEvent(resetButtonRef.current, 'click');
        const waitBtn$ = fromEvent(waitButtonRef.current, 'click');

        const programmaticSubjectCommand = new Subject();
        const commands = merge(
            resetBtn$.pipe(mapTo({ [stateKeys.count]: 0, [stateKeys.isTicking]: true, })),
            waitBtn$.pipe(doubleClick, mapTo({ [stateKeys.isTicking]: false })),
            programmaticSubjectCommand.asObservable(),
        );

        const stopWatchState = commands.pipe(
            startWith(inialStopWatchState),
            scan((state, command) => ({ ...state, ...command })),
            shareReplay(1),
        );

        const isTicking$ = stopWatchState.pipe(queryState(stateKeys.isTicking));
        const count$ = stopWatchState.pipe(queryState(stateKeys.count));
        const toHumanTime$ = count$.pipe(map(toHHMMSS));
        const intervalTick$ = isTicking$.pipe(switchMap(isTicking => isTicking ? timer(0, 1000) : NEVER));

        // UI Output
        const startStopCommand$ = startStopBtn$.pipe(
            withLatestFrom(isTicking$, (_, isTickingState) => isTickingState),
            tap(currentIsTicking => {
                const isWorking = currentIsTicking === true;

                if (isWorking) {
                    return programmaticSubjectCommand.next({
                        [stateKeys.isTicking]: !currentIsTicking,
                        [stateKeys.count]: 0,
                    });
                }

                return programmaticSubjectCommand.next({
                    [stateKeys.isTicking]: !currentIsTicking,
                });
            }),
        );

        const incrementCountAfterTick$ = intervalTick$.pipe(
            withLatestFrom(count$, (_, countState) => countState),
            tap(count => programmaticSubjectCommand.next({ [stateKeys.count]: ++count })),
        );

        // Subscriptions
        incrementCountAfterTick$.subscribe();
        startStopCommand$.subscribe();
        toHumanTime$.subscribe(setCount);
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.countdownHolder}>
                <span className={styles.position}>
                    <span className={`${styles.digit} ${styles.static}`}>
                        {count}
                    </span>
                </span>
            </div>
            <div className={styles.containerHorizontal}>
                <button className={styles.btn} ref={startStopButtonRef}>Start/Stop</button>
                <button className={styles.btn} ref={resetButtonRef}>Reset</button>
                <button className={styles.btn} ref={waitButtonRef}>Wait</button>
            </div>
            <p className={styles.description__item}><b>Start/Stop</b> - starts/stops stopwatch. If stops, time will be reseted to 00:00:00</p>
            <p className={styles.description__item}><b>Wait</b> - stops timer. To proceed counting click "Start/Stop"(button activates after double clicking on it)</p>
            <p className={styles.description__item}><b>Reset</b> - resets timer and starts counting from scratch</p>
        </div>
    );
}

export default StopWatch;