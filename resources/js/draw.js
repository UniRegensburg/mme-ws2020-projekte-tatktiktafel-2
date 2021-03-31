
var lastPoint;
var force = 1;
var mouseDown = false;
var color;
var stack = [];
var timelineFrames = [];
var timelineIndex = 0;
var timelinePosition = 0;
var pencilButton = document.getElementById("pencil");
var token = document.getElementById("token");
var grenade = document.getElementById("grenade");
var flash = document.getElementById("flash");
var smoke = document.getElementById("smoke");
var sniper = document.getElementById("sniper");
var sniperIcon = document.getElementById("sniperIcon");
var assault = document.getElementById("assault");
var assaultIcon = document.getElementById("assaultIcon");
var mp = document.getElementById("mp");
var mpIcon = document.getElementById("mpIcon");
var redButton = document.getElementById("red");
var greenButton = document.getElementById("green");
var blueButton = document.getElementById("blue");
var timelineSaveButton = document.getElementById("saveTimelineFrame");
var clearCanvasButton = document.getElementById("clearCanvas");
var penColorReference = document.getElementById("penColRef");
var undoButton = document.getElementById("undo");
var redoButton = document.getElementById("redo");
var timelineStartButton = document.getElementById("timeline start");
var timelinePrevButton = document.getElementById("timeline prev");
var timelineNextButton = document.getElementById("timeline next");
var timelineEndButton = document.getElementById("timeline end");
var activeColor = "red";
var stillFrame;
var activeToolElement = document.querySelector("[data-tool].active");
var activeTool = activeToolElement.dataset.tool;


var sniperImg = "resources/img/sniperMap.png";
var assaultImg = "resources/img/assaultMap.png";
var mpImg = "resources/img/MPMap.png";

//CONFIG
const grenadeImg = "resources/img/grenadeExpl.png";
const flashImg = "resources/img/flashExpl.png";
const smokeImg = "resources/img/smokeMap.png";
const imgCenter = 30;
const toolBlank = "blank";
const canvas = document.querySelector(".app canvas");
const activeCanvas = document.querySelector(".app canvas.active");
const ctx = canvas.getContext("2d");
const activeCtx = activeCanvas.getContext("2d");

//MAPS
let btn1 = document.getElementById("arklov_btn");
let btn2 = document.getElementById("azhir_btn");
let btn3 = document.getElementById("euphrates_btn");
let btn4 = document.getElementById("grazna_btn");
let btn5 = document.getElementById("gunrunner_btn");
let btn6 = document.getElementById("hackney_btn");
let btn7 = document.getElementById("picadilly_btn");
let btn8 = document.getElementById("rammaza_btn");
let btn9 = document.getElementById("shoothouse_btn");
let btn10 = document.getElementById("stpetrograd_btn");

document.querySelectorAll("[data-tool]").forEach((tool) => {
  tool.onclick = function (e) {
    activeToolElement.classList.toggle("active");
    activeToolElement = tool;
    activeToolElement.classList.toggle("active");
    activeTool = activeToolElement.dataset.tool;
  };
});

function broadcast(data) {
  Object.values(peerConnections).forEach((peer) => {
    peer.send(data);
  });
}


// R G B
const swatch = [["#ff0000", "#00ff00", "#0000ff"]];
const colorMap = swatch.flat();
var activeShape;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  activeCanvas.width = window.innerHeight / 1.2;
  activeCanvas.height = window.innerHeight / 1.2;
  //Redraw background on resize
  backgroundDraw();
  // Setzt die Map auf arklov zurück
}

function onPeerData(id, data) {
  let msg = JSON.parse(data);
  if (msg.event === "draw") {
    draw(msg);
  } else if (msg.event === "drawRect") {
    drawRect(msg);
  } else if (msg.event === "clear") {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else if (msg.event === "azhir_click") {
    backgroundDraw(msg);
  } else if (msg.event === "grenade") {
    tokenDraw(msg);
  } else if (msg.event === "flash") {
    tokenDraw(msg);
  } else if (msg.event === "smoke") {
    tokenDraw(msg);
  } else if (msg.event === "sniper") {
    tokenDraw(msg);
  } else if (msg.event === "assault") {
    tokenDraw(msg);
  } else if (msg.event === "mp") {
    tokenDraw(msg);
  } else if (msg.event === "Euphrates_click") {
    backgroundDraw(msg);
  } else if (msg.event === "Grazna_click") {
    backgroundDraw(msg);
  } else if (msg.event === "Gun_Runner_click") {
    backgroundDraw(msg);
  } else if (msg.event === "Hackney_click") {
    backgroundDraw(msg);
  } else if (msg.event === "Picadilly_click") {
    backgroundDraw(msg);
  } else if (msg.event === "Rammaza_click") {
    backgroundDraw(msg);
  } else if (msg.event === "Shoot_click") {
    backgroundDraw(msg);
  } else if (msg.event === "StPetrograd_click") {
    backgroundDraw(msg);
  } else if (msg.event === "arklov_click") {
    backgroundDraw(msg);
  } else if (msg.event === "Backwards_click") {
    backgroundDraw(msg);
  } else if (msg.event === "Forward_click") {
    backgroundDraw(msg);
  } else if (msg.event === "tlNext_click") {
    backgroundDraw(msg);
  } else if (msg.event === "tlStart_click") {
    backgroundDraw(msg);
  } else if (msg.event === "tlPrev_click") {
    backgroundDraw(msg);
  } else if (msg.event === "tlEnd_click") {
    backgroundDraw(msg);
  }
}

//Un-Redo Stack functionality
function backwardsManager() {
  let still = convertCanvasToImage();
  if (stack.length < 10) {
    stack.push(still);
  } else {
    stack.splice(0, 1);
    stack.push(still);
  }
  stackIndex = stack.length;
}

function backwardsDraw() {
  if (stack.length == 0) {
    backgroundDraw();
  } else {
    let img = new Image();
    img = stack[stackIndex - 1];
    activeCtx.drawImage(img, 0, 0, activeCanvas.width, activeCanvas.height);
    if (stackIndex > 0) {
      stackIndex = stackIndex - 1;
    }
    backgroundDraw({
      event: "Backwards_click",
      src: stack[stackIndex - 1].src,
    });
    activeTool = undefined;
    broadcast(
      JSON.stringify({
        event: "Backwards_click",
        src: stack[stackIndex - 1].src,
      })
    );
  }
}

function forwardDraw() {
  if (stack.length == 0) {
    backgroundDraw();
  } else {
    let img = new Image();
    img = stack[stackIndex + 1];
    activeCtx.drawImage(img, 0, 0, activeCanvas.width, activeCanvas.height);
    if (stackIndex <= 10) {
      stackIndex = stackIndex + 1;
    }
    backgroundDraw({
      event: "Forward_click",
      src: stack[stackIndex + 1].src,
    });
    activeTool = undefined;
    broadcast(
      JSON.stringify({
        event: "Forward_click",
        src: stack[stackIndex + 1].src,
      })
    );
  }
}

// DRAWING ELEMENTS
function draw(data) {
  if (data.lastPoint.x < 0 || data.lastPoint.x > 800) {
    activeTool = undefined;
  }
  ctx.beginPath();
  ctx.moveTo(data.lastPoint.x, data.lastPoint.y);
  ctx.lineTo(data.x, data.y);
  ctx.strokeStyle = data.color;
  ctx.lineWidth = Math.pow(data.force || 1, 4) * 2;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.closePath();
}

//DRAW BACKGROUND MAP
function backgroundDraw(data) {
  let img = new Image();
  if (data != undefined) {
    img.onload = function () {
      activeCtx.drawImage(img, 0, 0, activeCanvas.width, activeCanvas.height);
    };
    img.src = data.src;
  } else {

    img.onload = function () {

      activeCtx.drawImage(img, 0, 0, activeCanvas.width, activeCanvas.height);
    };
    img.src = "/resources/img/Arklov_Peak_objectives.png";
  }

  //img.src = 'https://4.bp.blogspot.com/-LzenCqa3qCs/UUJO_H64QsI/AAAAAAAADSc/N5LZ8RTdq3I/s1600/Strike20mp_strike.png';

  //CHANGE MAP
}

//TOKEN
function tokenDraw(data) {

  let img = new Image();
  img.onload = function () {

    activeCtx.drawImage(img, data.x - imgCenter, data.y - imgCenter);
  };
  img.src = data.img;

}

function changeIconColor() {
  if (activeColor === "red") {
    //change tokenColor
    sniperImg = "resources/img/sniperMap.png";
    assaultImg = "resources/img/assaultMap.png";
    mpImg = "resources/img/MPMap.png";
    penColorReference.style.color = "red";
    //change Icon
    sniperIcon.src = "resources/img/sniperMap.png";
    assaultIcon.src = "resources/img/assaultMap.png";
    mpIcon.src = "resources/img/MPMap.png";
  } else if (activeColor === "blue") {
    //change tokenColor
    sniperImg = "resources/img/sniperMapblue.png";
    assaultImg = "resources/img/assaultMapblue.png";
    mpImg = "resources/img/MPMapblue.png";
    penColorReference.style.color = "blue";
    // change Icon
    sniperIcon.src = "resources/img/sniperMapblue.png";
    assaultIcon.src = "resources/img/assaultMapblue.png";
    mpIcon.src = "resources/img/MPMapblue.png";

  }
}

// Convert current canvas to img / stillframe for timeline
function convertCanvasToImage() {
  let stillFrame = new Image();
  stillFrame.src = canvas.toDataURL();

  timelineFrames[timelineIndex] = stillFrame;
  timelinePosition = timelineIndex;
  timelineIndex = timelineIndex + 1;

  return stillFrame;
}

// Timeline Navigation
function tlStart() {
  if (timelineFrames.length >= 0) {
    activeCtx.drawImage(
      timelineFrames[0],
      0,
      0,
      activeCanvas.width,
      activeCanvas.height
    );
    activeTool = "tlStart";
    backgroundDraw({
      event: "tlStart_click",
      src: timelineFrames[0].src,
    });
    activeTool = undefined;
    broadcast(
      JSON.stringify({
        event: "tlStart_click",
        src: timelineFrames[0].src,
      })
    );
  }
  timelinePosition = 0;
}

function tlPrev() {
  if (timelinePosition > 0) {
    activeCtx.drawImage(
      timelineFrames[timelinePosition - 1],
      0,
      0,
      activeCanvas.width,
      activeCanvas.height
    );
    activeTool = "tlPrev";
    backgroundDraw({
      event: "tlPrev_click",
      src: timelineFrames[timelinePosition - 1].src,
    });
    activeTool = undefined;
    broadcast(
      JSON.stringify({
        event: "tlPrev_click",
        src: timelineFrames[timelinePosition - 1].src,
      })
    );
    timelinePosition = timelinePosition - 1;
  }
}

function tlNext() {
  if (timelinePosition < timelineFrames.length - 1) {
    activeCtx.drawImage(
      timelineFrames[timelinePosition + 1],
      0,
      0,
      activeCanvas.width,
      activeCanvas.height
    );
    activeTool = "tlNext";
    backgroundDraw({
      event: "tlNext_click",
      src: timelineFrames[timelinePosition + 1].src,
    });
    activeTool = undefined;
    broadcast(
      JSON.stringify({
        event: "tlNext_click",
        src: timelineFrames[timelinePosition + 1].src,
      })
    );
    timelinePosition = timelinePosition + 1;
  }
}

function tlEnd() {
  if (timelineFrames.length > 1) {
    activeCtx.drawImage(
      timelineFrames[timelineFrames.length - 1],
      0,
      0,
      activeCanvas.width,
      activeCanvas.height
    );
    activeTool = "tlEnd";
    backgroundDraw({
      event: "tlEnd_click",
      src: timelineFrames[timelineFrames.length - 1].src,
    });
    activeTool = undefined;
    broadcast(
      JSON.stringify({
        event: "tlEnd_click",
        src: timelineFrames[timelineFrames.length - 1].src,
      })
    );
    timelinePosition = timelineFrames.length - 1;
  } else {
    tlStart();
  }
}

function clearTimeline() {
  timelineFrames = [];
  timelineIndex = 0;
  timelinePosition = 0;
}

//INTERACTION
btn1.addEventListener("click", () => {
  activeTool = "arklov";
});
btn2.addEventListener("click", () => {
  activeTool = "azhir";
  //img.src = "/resources/img/Azhir_Cave_objectives.png";
  //currentMap = img.src;
});
btn3.addEventListener("click", () => {
  activeTool = "Euphrates";
  //img.src = "/resources/img/Euphrates_Bridge_objectives.png";
  //currentMap = img.src;
});
btn4.addEventListener("click", () => {
  activeTool = "Grazna";
  //img.src = "/resources/img/Grazna_Raid_objectives.png";
  //currentMap = img.src;
});
btn5.addEventListener("click", () => {
  activeTool = "Gun_Runner";
  //img.src = "/resources/img/Gun_Runner_objectives.png";
  //currentMap = img.src;
});
btn6.addEventListener("click", () => {
  activeTool = "Hackney";
  // img.src = "/resources/img/Hackney_Yard_objectives.png";
  //currentMap = img.src;
});
btn7.addEventListener("click", () => {
  activeTool = "Picadilly";
  //img.src = "/resources/img/Picadilly_objectives.png";
  //currentMap = img.src;
});
btn8.addEventListener("click", () => {
  activeTool = "Rammaza";
  //img.src = "/resources/img/Rammaza_objectives.png";
  // currentMap = img.src;
});
btn9.addEventListener("click", () => {
  activeTool = "Shoot";
  //img.src = "/resources/img/Shoot_House_objectives.png";
  // currentMap = img.src;
});
btn10.addEventListener("click", () => {
  activeTool = "StPetrograd";
  //img.src = "/resources/img/StPetrograd_objectives.png";
  //currentMap = img.src;
});

grenade.addEventListener("click", function () {

  activeTool = "grenade";
});

flash.addEventListener("click", function () {

  activeTool = "flash";
});

smoke.addEventListener("click", function () {

  activeTool = "smoke";
});

sniper.addEventListener("click", function () {

  activeTool = "sniper";
});

assault.addEventListener("click", function () {

  activeTool = "assault";
});

mp.addEventListener("click", function () {

  activeTool = "mp";
});

redButton.addEventListener("click", function () {

  backwardsManager();
  activeTool = "red";
  activeColor = "red";
  changeIconColor();
  color = colorMap[0];
  activeTool = "pencil";
});

blueButton.addEventListener("click", function () {

  backwardsManager();
  activeTool = "blue";
  activeColor = "blue";
  changeIconColor();
  color = colorMap[2];
  activeTool = "pencil";
});

timelineSaveButton.addEventListener("click", function () {

  convertCanvasToImage();
});

undo.addEventListener("click", function () {

  activeTool = "Backwards";
  backwardsDraw();
});

redo.addEventListener("click", function () {

  activeTool = "Forward";
  forwardDraw();
});

clearCanvasButton.addEventListener("click", function () {

  activeCtx.clearRect(0, 0, canvas.width, canvas.height);
  backgroundDraw();
  clearTimeline();
  activeTool = "Clear Canvas";
  backgroundDraw({
    event: "clearCanvas_click",
  });
  activeTool = undefined;
  broadcast(
    JSON.stringify({
      event: "clearCanvas_click",
    })
  );
});

timelineStartButton.addEventListener("click", function () {
  tlStart();

});
timelinePrevButton.addEventListener("click", function () {
  tlPrev();

});
timelineNextButton.addEventListener("click", function () {
  tlNext();

});
timelineEndButton.addEventListener("click", function () {
  tlEnd();

});

function move(e) {
  mouseDown = e.buttons;
  if (e.buttons) {
    if (!lastPoint) {
      lastPoint = { x: e.offsetX, y: e.offsetY };
      originPoint = { x: e.offsetX, y: e.offsetY };
      return;
    }

    if (activeTool === "pencil") {
      draw({
        lastPoint,
        x: e.offsetX,
        y: e.offsetY,
        force: force,
        color: color,
      });

      broadcast(
        JSON.stringify({
          event: "draw",
          lastPoint,
          x: e.offsetX,
          y: e.offsetY,
          force: force,
          color: color,
        })
      );
    }

    lastPoint = { x: e.offsetX, y: e.offsetY };
  } else {
    lastPoint = undefined;
  }
}

function down(e) {
  originPoint = { x: e.offsetX, y: e.offsetY };

  if (activeTool === "grenade") {

    backwardsManager();
    tokenDraw({
      x: e.offsetX,
      y: e.offsetY,
      img: "resources/img/grenadeExpl.png",
    });
    activeTool = undefined;
    broadcast(
      JSON.stringify({
        event: "grenade",
        x: e.offsetX,
        y: e.offsetY,
        img: "resources/img/grenadeExpl.png",
      })
    );
  } else if (activeTool === "flash") {
    backwardsManager();

    tokenDraw({
      x: e.offsetX,
      y: e.offsetY,
      img: "resources/img/flashExpl.png",
    });
    activeTool = undefined;
    broadcast(
      JSON.stringify({
        event: "flash",
        x: e.offsetX,
        y: e.offsetY,
        img: "resources/img/flashExpl.png",
      })
    );
  } else if (activeTool === "smoke") {
    backwardsManager();

    tokenDraw({
      x: e.offsetX,
      y: e.offsetY,
      img: "resources/img/smokeMap.png",
    });
    activeTool = undefined;
    broadcast(
      JSON.stringify({
        event: "smoke",
        x: e.offsetX,
        y: e.offsetY,
        img: "resources/img/smokeMap.png",
      })
    );
  } else if (activeTool === "sniper") {
    backwardsManager();

    tokenDraw({
      x: e.offsetX,
      y: e.offsetY,
      img: sniperImg,
    });
    activeTool = undefined;
    if (activeColor === "red") {
      broadcast(
        JSON.stringify({
          event: "sniper",
          x: e.offsetX,
          y: e.offsetY,
          img: sniperImg,
        })
      );
    }

  } else if (activeTool === "assault") {
    backwardsManager();

    tokenDraw({
      x: e.offsetX,
      y: e.offsetY,
      img: assaultImg,
    });
    activeTool = undefined;
    broadcast(
      JSON.stringify({
        event: "assault",
        x: e.offsetX,
        y: e.offsetY,
        img: assaultImg,
      })
    );
  } else if (activeTool === "mp") {
    backwardsManager();

    tokenDraw({
      x: e.offsetX,
      y: e.offsetY,
      img: mpImg = "resources/img/MPMap.png",
    });
    activeTool = undefined;
    broadcast(
      JSON.stringify({
        event: "smoke",
        x: e.offsetX,
        y: e.offsetY,
        img: mpImg = "resources/img/MPMap.png",
      })
    );
  }
}

function up() {
  if (activeShape) {
    drawRect(activeShape, true);
    broadcast(
      JSON.stringify(
        Object.assign(
          {
            event: "drawRect",
            commit: true,
          },
          activeShape
        )
      )
    );
    activeShape = undefined;
  } else if (activeTool === "azhir") {

    backgroundDraw({
      event: "azhir_click",
      src: "/resources/img/Azhir_Cave_objectives.png",
    });
    activeTool = undefined;
    broadcast(
      JSON.stringify({
        event: "azhir_click",
        src: "/resources/img/Azhir_Cave_objectives.png",
      })
    );
  } else if (activeTool === "arklov") {

    backgroundDraw({
      event: "arklov_click",
      src: "/resources/img/Arklov_Peak_objectives.png",
    });
    activeTool = undefined;
    broadcast(
      JSON.stringify({
        event: "arklov_click",
        src: "/resources/img/Arklov_Peak_objectives.png",
      })
    );
  } else if (activeTool === "Euphrates") {

    backgroundDraw({
      event: "Euphrates_click",
      src: "/resources/img/Euphrates_Bridge_objectives.png",
    });
    activeTool = undefined;
    broadcast(
      JSON.stringify({
        event: "Euphrates_click",
        src: "/resources/img/Euphrates_Bridge_objectives.png",
      })
    );
  } else if (activeTool === "Grazna") {

    backgroundDraw({
      event: "Grazna_click",
      src: "/resources/img/Grazna_Raid_objectives.png",
    });
    activeTool = undefined;
    broadcast(
      JSON.stringify({
        event: "Grazna_click",
        src: "/resources/img/Grazna_Raid_objectives.png",
      })
    );
  } else if (activeTool === "Gun_Runner") {

    backgroundDraw({
      event: "Gun_Runner_click",
      src: "/resources/img/Gun_Runner_objectives.png",
    });
    activeTool = undefined;
    broadcast(
      JSON.stringify({
        event: "Gun_Runner_click",
        src: "/resources/img/Gun_Runner_objectives.png",
      })
    );
  } else if (activeTool === "Hackney") {

    backgroundDraw({
      event: "Hackney_click",
      src: "/resources/img/Hackney_Yard_objectives.png",
    });
    activeTool = undefined;
    broadcast(
      JSON.stringify({
        event: "Hackney_click",
        src: "/resources/img/Hackney_Yard_objectives.png",
      })
    );
  } else if (activeTool === "Picadilly") {

    backgroundDraw({
      event: "Picadilly_click",
      src: "/resources/img/Picadilly_objectives.png",
    });
    activeTool = undefined;
    broadcast(
      JSON.stringify({
        event: "Picadilly_click",
        src: "/resources/img/Picadilly_objectives.png",
      })
    );
  } else if (activeTool === "Rammaza") {

    backgroundDraw({
      event: "Rammaza_click",
      src: "/resources/img/Rammaza_objectives.png",
    });
    activeTool = undefined;
    broadcast(
      JSON.stringify({
        event: "Rammaza_click",
        src: "/resources/img/Rammaza_objectives.png",
      })
    );
  } else if (activeTool === "Shoot") {

    backgroundDraw({
      event: "Shoot_click",
      src: "/resources/img/Shoot_House_objectives.png",
    });
    activeTool = undefined;
    broadcast(
      JSON.stringify({
        event: "Shoot_click",
        src: "/resources/img/Shoot_House_objectives.png",
      })
    );
  } else if (activeTool === "StPetrograd") {

    backgroundDraw({
      event: "StPetrograd_click",
      src: "/resources/img/StPetrograd_objectives.png",
    });
    activeTool = undefined;
    broadcast(
      JSON.stringify({
        event: "StPetrograd_click",
        src: "/resources/img/StPetrograd_objectives.png",
      })
    );
  }

  lastPoint = undefined;
  originPoint = undefined;
}

function key(e) {
  if (e.key === "Backspace") {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    broadcast(
      JSON.stringify({
        event: "clear",
      })
    );
  }

  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    color = colorMap[0];
    colorPicker.dataset.color = color;
    colorPicker.style.color = color;
    colorElements[color].classList.toggle("active");
  }
}

function forceChanged(e) {
  force = e.webkitForce || 1;
}

window.onresize = resize;
window.onmousedown = down;
window.onmousemove = move;
window.onmouseup = up;
window.onkeydown = key;
window.onwebkitmouseforcechanged = forceChanged;

resize();
