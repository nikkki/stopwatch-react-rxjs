export const toHHMMSS = (count) => {
    const seconds = (count % 3600) % 60;
    const minutes = Math.floor((count % 3600) / 60);
    const hours = Math.floor(count / 3600);

    const addZero = (val) => val < 10 ? `0${val}` : `${val}`

    return `${addZero(hours)}:${addZero(minutes)}:${addZero(seconds)}`;
}