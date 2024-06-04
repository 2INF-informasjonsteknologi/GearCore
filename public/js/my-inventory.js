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

    constructor(options = {
        category: String
    }){
        // Variables
        const {category} = options;


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
        document.querySelector("#categories").appendChild(this.#elements.main);
        this.#elements.main.classList.remove("tpl");
    }
}

class Item{
    // Variables

    #elements;
    #id;
    #producer;
    #description;
    #specs;
    #price;
    #category;
    #available;



    // Properties

    get elements(){
        return this.#elements;
    }

    get producer(){
        return this.#producer;
    }

    get description(){
        return this.#description;
    }

    get specs(){
        return this.#specs;
    }

    get price(){
        return this.#price;
    }

    get category(){
        return this.#category;
    }



    // Constructor

    constructor(options = {
        description: String,
        id: String,
        available: Boolean,
        body: Object
    }){
        // Variables
        const {
            description,
            id,
            available,
            body
        } = options;


        // Elements
        const main = document.querySelector("#item-tpl").cloneNode(true);
        const h1 = main.querySelector("h1");
        const p = main.querySelectorAll("p[_label]:has(span)");
        const button = main.querySelector("button");


        // Setting variables
        this.#elements = {main, h1, p, button};
        this.#id = id;
        this.#producer = body.producer;
        this.#description = description;
        this.#specs = body.specs;
        this.#price = body.price;
        this.#category = body.category;
        this.#available = available;


        // Setting elements
        this.#elements.h1.innerText = description;
        this.#elements.p.forEach(i => {
            if(body.hasOwnProperty(i.getAttribute("_label"))){
                i.querySelector("span").innerText = body[i.getAttribute("_label")];
            }
        });
        this.#elements.button.addEventListener("click", async () => {
            const response = await fetch(`/api/item/return/${this.#id}`);
            if(response.ok) return window.location.reload();
            const data = await response.json();
            alert(data.message.no);
        });
        document.querySelector("#items").appendChild(this.#elements.main);
        this.#elements.main.classList.remove("tpl");
    }



    // Functions

    hide(){
        this.#elements.main.classList.add("disabled");
    }

    show(){
        if(this.#elements.main.classList.contains("disabled")) this.#elements.main.classList.remove("disabled");
    }
}



// On load

window.addEventListener("load", async () => {
    await fetchItems();
    search();
});



// Functions

async function fetchItems(){
    const response = await fetch("/api/item/@all-mine");

    if(!response.ok) return window.location = "/log-in";

    const data = await response.json();

    data.forEach(i => {
        items.push(new Item({
            description: i.description,
            id: i.id,
            body: i,
            available: i.borrowedBy == "null"
        }));

        if(!categories.some(x => x.category == i.category)) categories.push(new Category({
            category: i.category
        }));
    });
}

function search(){
    // Elements
    const searchField = document.querySelector("#search-field");


    // On change
    searchField.addEventListener("input", sort);
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
                    i.description.toLowerCase().includes(query)
                    || i.producer.toLowerCase().includes(query)
                    || i.specs.toLowerCase().includes(query)
                    || i.price.toString().toLowerCase().includes(query)
                    || i.category.toLowerCase().includes(query)
                )
                || query == ""
            )
        ) i.show()
        else i.hide();
    });
}