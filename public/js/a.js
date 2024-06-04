// On load

window.addEventListener("load", async () => {
    menu();
    await login();
    logout();
});



// Functions

function menu(){
    // Elements
    const button = document.querySelector("#menu-button");
    const menu = document.querySelector("#menu");


    // On click
    button.addEventListener("click", () => {
        if(menu.classList.contains("disabled")) menu.classList.remove("disabled");
        else menu.classList.add("disabled");
    });
}

async function login(){
    // Fetching
    const response = await fetch("/api/session");
    const data = await response.json();


    // Configuring body
    if(data.hasOwnProperty("user") && ![undefined, null].includes(data.user)) document.body.setAttribute("_loggedIn", "");
}

function logout(){
    // Elements
    const button = document.querySelector("#logout-button");


    // On click
    button.addEventListener("click", async () => {
        await fetch("/api/user/log-out");
        window.location.reload();
    });
}