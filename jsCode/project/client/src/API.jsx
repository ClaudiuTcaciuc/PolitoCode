// default URL
const URL = "http://localhost:3000/api";

async function logIn (credentials) {
    let response = await fetch(URL + "/sessions", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        const user = await response.json();
        return user;
    }
    else {
        const err = await response.json();
        throw err.message;
    }
}

async function logOut () {
    await fetch(URL + "/sessions/current", {
        method: "DELETE",
        credentials: "include",
    });
}

async function getUserInfo () {
    const response = await fetch (URL + "/sessions/current", {
        credentials: "include",
    });
    const userInfo = await response.json();
    if (response.ok) {
        return userInfo;
    }
    else {
        throw userInfo; 
    }
}

const API = { logIn, logOut, getUserInfo };
export default API;