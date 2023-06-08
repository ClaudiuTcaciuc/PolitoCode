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

async function getPages (type) {
    const response = await fetch (URL + "/" + type, {
        credentials: "include",
    });
    const data = await response.json();
    if (response.ok) {
        console.log(data);
        return data;
    }
    else {
        throw data;
    }
}

async function getAppName() {
    const response = await fetch(URL + "/appname");
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw data;
    }
  }
  

async function changeAppName (name) {
    try {
        const response = await fetch (URL + "/changeappname", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({application_name: name}),
        });
        if (!response.ok) {
            throw new Error("HTTP error, status = " + response.status);
        }
        const data = await response.text();
        return data;
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}

const API = { logIn, logOut, getUserInfo, getPages, getAppName, changeAppName };
export default API;