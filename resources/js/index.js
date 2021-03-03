/* eslint-env browser */

import ApiClient from "./net/ApiClient.js";
import Canvas from "./ui/Canvas.js";
import Toolbar from "./ui/Toolbar.js";

var canvas,
    toolbar,
    textInput;

function init() {
    canvas = new Canvas(".generator canvas");
    toolbar = new Toolbar(".generator .menu", onButtonClicked);
    textInput = document.querySelector("input");
    textInput.addEventListener("change", onTextChanged);
    hideTextInput();
    reloadImage();
}

function hideTextInput() {
    textInput.classList.add("hidden");
    textInput.value = "";
}

function showTextInput() {
    textInput.classList.remove("hidden");
    textInput.focus();
}

async function reloadImage() {
    let image = await ApiClient.getRandomImage();
    canvas.setImage(image);
}

function onTextChanged() {
    canvas.setText(textInput.value);
    hideTextInput();
}

function onButtonClicked(action) {
    switch (action) {
        case "reload":
            reloadImage();
            break;
        case "write":
            showTextInput();
            break;
        case "font":
            canvas.changeFont();
            break;
        case "fontColor":
            canvas.changeFontColor();
            break;
        case "fontSize":
            canvas.changeFontSize();
            break;
        default:
            break;

    }
}

init();