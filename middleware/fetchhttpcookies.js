const fetchHTTPCookies = (data) => {
    const cookies = data.split(";");
    const obj = {};

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].split("=");
        const key = cookie[0].trim();
        const value = cookie[1].trim();

        obj[key] = value;
    }

    return obj;
}

module.exports = { fetchHTTPCookies: fetchHTTPCookies };