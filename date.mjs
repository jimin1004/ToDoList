export const getDate = () => {

    const today = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return today.toLocaleString('en-KR', options);
}

export const getDay = () => {

    let today = new Date();
    let options = { weekday: 'long' };
    return today.toLocaleString('en-KR', options);
}
