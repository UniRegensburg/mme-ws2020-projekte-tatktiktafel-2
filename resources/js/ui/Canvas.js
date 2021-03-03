const AVAILABLE_FONT_COLORS = ["#FFF", "#000"],
    AVAILABLE_FONT_SIZES = ["14px", "24px", "36px", "48px", "72px", "96px", "144px"],
    AVAILABLE_FONTS = ["Arial", "Verdana", "Helvetica", "Tahoma", "Trebuchet MS", "Times New Roman", "Georgia", "Garamond", "Courier New", "Brush Script MT"];

function renderCanvas(canvas, model) {
    drawImage(canvas, model);
    drawText(canvas, model);
}

function drawImage(canvas, model) {
    let image = model.image,
        width, height;
    if (image.width > image.height) {
        width = (image.width / image.height) * canvas.width;
        height = canvas.width;
    } else {
        width = canvas.width;
        height = (image.height / image.width) * canvas.width;
    }
    canvas.getContext("2d").drawImage(image, 0, 0, width, height);
}

function drawText(canvas, model) {
    canvas.getContext("2d").font = model.fontSize + " " + model.font;
    canvas.getContext("2d").fillStyle = model.fontColor;
    canvas.getContext("2d").textAlign = "center";
    canvas.getContext("2d").fillText(model.text, canvas.width / 2, 150);
}

function shiftModelValue(model, value, source) {
    let currentIndex = source.findIndex((element, index) => (element === model[value]));
    if (currentIndex < source.length - 1) {
        model[value] = source[currentIndex + 1];
    } else {
        model[value] = source[0];
    }
}

class Canvas {

    constructor(elSelector) {
        this.canvas = document.querySelector(elSelector);
        this.model = {
            fontSize: AVAILABLE_FONT_SIZES[3],
            font: AVAILABLE_FONTS[0],
            fontColor: AVAILABLE_FONT_COLORS[0],
            image: null,
            text: "",
        };
    }

    setText(text) {
        this.model.text = text;
        this.render();
    }

    setImage(image) {
        this.model.image = image;
        this.render();
    }

    changeFont() {
        shiftModelValue(this.model, "font", AVAILABLE_FONTS);
        this.render();

    }

    changeFontColor() {
        shiftModelValue(this.model, "fontColor", AVAILABLE_FONT_COLORS);
        this.render();
    }

    changeFontSize() {
        shiftModelValue(this.model, "fontSize", AVAILABLE_FONT_SIZES);
        this.render();
    }

    render() {
        renderCanvas(this.canvas, this.model);
    }

}

export default Canvas;