// default URL
const URL = "http://localhost:3000/api";

async function logIn(credentials) {
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

async function logOut() {
  await fetch(URL + "/sessions/current", {
    method: "DELETE",
    credentials: "include",
  });
}

async function getUserInfo() {
  const response = await fetch(URL + "/sessions/current", {
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

async function getPages(type) {
  const response = await fetch(URL + "/" + type, {
    credentials: "include",
  });
  const data = await response.json();
  if (response.ok) {
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

async function getPageContent(id) {
  const response = await fetch(URL + "/page/" + id);
  const data = await response.json();
  if (response.ok) {
    return data;
  } else {
    throw data;
  }
}

async function changeAppName(name) {
  try {
    const response = await fetch(URL + "/changeappname", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ application_name: name }),
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

async function createPage(page) {
  try {
    const response = await fetch(URL + "/add_page", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(page),
    });
    if (!response.ok) {
      throw new Error("HTTP error, status = " + response.status);
    }
    const data = await response.json();
    return data;
  }
  catch (err) {
    console.log(err);
    throw err;
  }
}

async function deletePage(id) {
  try {
    const response = await fetch(URL + "/delete_page/" + id, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("HTTP error, status = " + response.status);
    }
    const data = await response.json();
    return data;
  }
  catch (err) {
    console.log(err);
    throw err;
  }
}

async function addContentBlock(block, id) {
  try {
    const response = await fetch(URL + "/add_block/" + id, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(block),
    });
    if (!response.ok) {
      const err = await response.json();
      console.log(err);
      throw new Error("HTTP error, status = " + response.status);
    }
    const data = await response.json();
    return data;
  }
  catch (err) {
    console.log(err);
    throw err;
  }
}

async function editContentBlock(block, id) {
  try {
    const response = await fetch(URL + "/edit_block/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(block),
    });
    if (!response.ok) {
      const err = await response.json();
      console.log(err);
      throw new Error("HTTP error, status = " + response.status);
    }
    const data = await response.json();
    return data;
  }
  catch (err) {
    console.log(err);
    throw err;
  }
}

async function deleteContentBlock(id) {
  try {
    const response = await fetch(URL + "/delete_block/" + id, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("HTTP error, status = " + response.status);
    }
    const data = await response.json();
    console.log(data);
    return data;
  }
  catch (err) {
    console.log(err);
    throw err;
  }
}

async function updateContentBlockOrder(pageContent) {
  try {
    const response = await fetch(URL + "/update_block_order/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(pageContent),
    });
    if (!response.ok) {
      throw new Error("HTTP error, status = " + response.status);
    }
    const data = await response.json();
    return data;
  }
  catch (err) {
    console.log(err);
    throw err;
  }
}

async function getAllImages() {
  const response = await fetch(URL + "/images");
  const data = await response.json();
  if (response.ok) {
    return data;
  } else {
    throw data;
  }
}

async function updateBlockImage(image_path, id) {
  try {
    const response = await fetch(URL + "/update_image/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ image_path: image_path }),
    });
    if (!response.ok) {
      throw new Error("HTTP error, status = " + response.status);
    }
    const data = await response.json();
    return data;
  }
  catch (err) {
    console.log(err);
    throw err;
  }
}

async function cleanEmptyBlocksInPage(id) {
  try {
    const response = await fetch(URL + "/clean_page/" + id, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("HTTP error, status = " + response.status);
    }
    const data = await response.json();
    return data;
  }
  catch (err) {
    console.log(err);
    throw err;
  }
}

async function updateDatePage(new_date, id) {
  try {
    const response = await fetch(URL + "/update_date/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ publication_date: new_date }),
    });
    if (!response.ok) {
      throw new Error("HTTP error, status = " + response.status);
    }
    const data = await response.json();
    return data;
  }
  catch (err) {
    console.log(err);
    throw err;
  }
}

async function getAllUsers() {
  const response = await fetch(URL + "/users", {
    credentials: "include",
  });
  const data = await response.json();
  if (response.ok) {
    return data;
  } else {
    throw data;
  }
}

async function changePageUser(user_id, id) {
  try {
    const response = await fetch(URL + "/change_page_user/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ user_id: user_id }),
    });
    if (!response.ok) {
      const err = await response.json();
      console.log(err);
      throw new Error("HTTP error, status = " + response.status);
    }
    const data = await response.json();
    console.log(data);
    return data;
  }
  catch (err) {
    console.log(err);
    throw err;
  }
}

const API = {
  logIn, logOut, getUserInfo, getPages, getPageContent, getAppName,
  changeAppName, createPage, deletePage, addContentBlock, deleteContentBlock,
  editContentBlock, updateContentBlockOrder, getAllImages, updateBlockImage,
  cleanEmptyBlocksInPage, updateDatePage, getAllUsers, changePageUser
};
export default API;