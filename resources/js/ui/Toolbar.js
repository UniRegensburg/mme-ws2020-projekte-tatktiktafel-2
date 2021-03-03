class Toolbar {

    constructor(elSelector, onButtonClick) {
        this.buttons = document.querySelectorAll(elSelector + " i");
        this.buttons.forEach(button => button.addEventListener("click", this.onButtonClicked.bind(this)));
        this.onButtonClick = onButtonClick;

    }

    onButtonClicked(event) {
        this.onButtonClick(event.target.getAttribute("data-action"));
    }

}

export default Toolbar;