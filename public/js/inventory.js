// Classes

class Category{
    // Variables

    #elements;
    #content;



    // Constructor

    constructor(options = {
        content: String
    } = {
        content: "Category"
    }){
        // Variables
        const {content} = options;


        // Elements
        const main = document.querySelector("#category-template").cloneNode(true);
        const h1 = main.querySelector("h1");
        const input = main.querySelector("input");


        // Setting variables
        this.#elements = {main, h1, input};
        this.#content = content;


        // Setting elements
        h1.innerText = this.#content;
        document.querySelector("#categories").appendChild(this.#elements.main);
        this.#elements.main.classList.remove("tpl");
    }
}