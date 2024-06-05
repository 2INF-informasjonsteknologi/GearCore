// On load

window.addEventListener("load", () => {
    container();
});



// Functions

function container(){
    // Elements
    const container = document.querySelector("#container");
    const output = document.querySelector("#output");
    const button = document.querySelector("#submit");


    // On interaction
    container.querySelectorAll("input[_key]").forEach(i => {
        // Removing error labels
        i.addEventListener("keypress", removeErrorLabels);
        i.addEventListener("focus", removeErrorLabels);


        // Functions
        function removeErrorLabels(){
            container.querySelectorAll("input.error[_key]").forEach(i => i.classList.remove("error"));
            output.innerText = "";
        }
    });


    // Submit
    button.addEventListener("click", submit);
    container.querySelectorAll("input[_key]").forEach(i => {
        i.addEventListener("keypress", event => {
            if(event.key == "Enter") submit();
        });
    });

    async function submit(){
        // Body
        const body = {};
        container.querySelectorAll("input[_key]").forEach(i => {
            body[i.getAttribute("_key")] = i.value;
        });


        // Fetching
        const response = await fetch("/api/item/new", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });


        // Results
        if(response.ok) return window.location.href = "/inventory";
        const data = await response.json();
        output.innerText = data.message.no
            || output.getAttribute("_default")
            || "ERROR";
        if(data.hasOwnProperty("key")){
            if(container.querySelector(`input[_key=\"${data.key}\"]`)){
                const element = container.querySelector(`input[_key=\"${data.key}\"]`);
                element.classList.add("error");
            }
        }
    }
}