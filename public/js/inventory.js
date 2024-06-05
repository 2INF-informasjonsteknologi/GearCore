// Variables

let categories = [];
let items = [];



// Classes

class Category{
    // Variables

    #elements;
    #category;



    // Properties

    get category(){
        return this.#category;
    }

    get checked(){
        return this.#elements.input.checked;
    }



    // Constructor

    constructor(category){
        // Elements
        const main = document.querySelector("#category-tpl").cloneNode(true);
        const h1 = main.querySelector("h1");
        const input = main.querySelector("input");


        // Setting variables
        this.#elements = {main, h1, input};
        this.#category = category;


        // Setting elements
        this.#elements.h1.innerText = this.#category;
        this.#elements.input.addEventListener("click", sort);
        

        // Making visible
        this.#elements.main.classList.remove("tpl");
        document.querySelector("#categories").appendChild(this.#elements.main);
    }
}

class Item{
    // Variables

    #elements;
    #id;
    #body;



    // Properties

    get body(){
        return this.#body;
    }

    get category(){
        return this.#body.category;
    }



    // Constructor

    constructor(options = {
        id: String,
        body: Object,
        available: Boolean
    }){
        // Variables
        const {id, body, available} = options;


        // Elements
        const main = document.querySelector("#item-tpl").cloneNode(true);
        const buttons = main.querySelectorAll("div.buttons button[_action]");
        const status = main.querySelector("h2.status");


        // Setting variables
        this.#elements = {main, buttons, status};
        this.#id = id;
        this.#body = body;


        // Setting elements
        Object.keys(this.#body).forEach(i => {
            if(this.#elements.main.querySelector(`input[_key=\"${i}\"]`)){
                const input = this.#elements.main.querySelector(`input[_key=\"${i}\"]`);
                input.value = this.#body[i];
                let oldValue = "";
                input.addEventListener("focusout", () => input.value = oldValue);
                input.addEventListener("focus", () => oldValue = input.value);
                input.addEventListener("keypress", async event => {
                    if(event.key != "Enter") return;
                    let changedBody = {};
                    changedBody[i] = input.value;
                    const response = await fetch(`/api/item/${this.#id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(changedBody)
                    });
                    if(!response.ok){
                        const data = await response.json();
                        alert(data.message.no || "ERROR");
                        input.value = oldValue;
                    }
                    else window.location.reload();
                });
            }
        });
        this.#elements.status.innerText = available
            ? this.#elements.status.getAttribute("_available") || "ERROR"
            : this.#elements.status.getAttribute("_busy") || "ERROR";
        this.#elements.status.style.color = available ? "green" : "red";
        this.#elements.buttons.forEach(i => {
            switch(i.getAttribute("_action")){

                case "loan": {
                    i.addEventListener("click", async () => {
                        const response = await fetch(`/api/item/borrow/${this.#id}`);
                        if(response.ok) return window.location.reload();
                        const data = await response.json();
                        alert(data.message.no || "ERROR");
                    });
                    break;
                }

                case "delete": {
                    i.addEventListener("click", async () => {
                        const response = await fetch(`/api/item/${this.#id}`, {
                            method: "DELETE"
                        });
                        if(response.ok) return window.location.reload();
                        const data = await response.json();
                        alert(data.message.no || "ERROR");
                    });
                    break;
                }

            }
        });


        // Making visible
        this.#elements.main.classList.remove("tpl");
        document.querySelector("#items").appendChild(this.#elements.main);
    }



    // Function

    hide(){
        this.#elements.main.classList.add("disabled");
    }

    show(){
        if(this.#elements.main.classList.contains("disabled")){
            this.#elements.main.classList.remove("disabled");
        }
    }
}



// On load

window.addEventListener("load", async () => {
    await loadItems();
    searchField();
});



// Functions

async function loadItems(){
    const response = await fetch("/api/item/@all");
    const data = await response.json();
    
    data.forEach(i => {
        const item = new Item({
            id: i.id,
            body: i,
            available: i.borrowedBy == "null"
        });
        items.push(item);
        if(!categories.some(
            x => x.category.toLowerCase() == i.category.toLowerCase()
        )) categories.push(new Category(i.category));
    });
}

function searchField(){
    // Elements
    const input = document.querySelector("#search-field");


    // On input
    input.addEventListener("input", sort);
}



// Other functions

function sort(){
    const query = document.querySelector("#search-field").value.toLowerCase();

    const categoryQuery = (() => {
        let result = [];
        categories.forEach(i => {
            if(i.checked) result.push(i.category);
        });
        return result;
    })();

    items.forEach(i => {
        if(
            categoryQuery.includes(i.category)
            && (
                (
                    i.body.description.toLowerCase().includes(query)
                    || i.body.producer.toLowerCase().includes(query)
                    || i.body.specs.toLowerCase().includes(query)
                    || i.body.price.toString().toLowerCase().includes(query)
                    || i.body.category.toLowerCase().includes(query)
                )
                || query == ""
            )
        ) i.show()
        else i.hide();
    });
}