import { distinctUntilChanged, pluck, } from 'rxjs/operators';

export const queryState = (name) => (source$) => source$.pipe(pluck(name), distinctUntilChanged());