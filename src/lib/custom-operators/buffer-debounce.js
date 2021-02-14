import { filter, buffer, debounceTime, map } from 'rxjs/operators';

export const bufferDebounce = (delay = 300) => (eventAmount = 1) => (source$) => {
    return source$.pipe(
        buffer(source$.pipe(debounceTime(delay))),
        map(a => a.length),
        filter(x => x === eventAmount),
    )
}

export const doubleClick = bufferDebounce(300)(2);
