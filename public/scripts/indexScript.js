function reSizeCanvases() {
  let containers = document.querySelectorAll(".canvasContainer");
  let canvasDict = {};
  for (const container of containers) {
    let id = container.id.split("canvasContainer")[1];
    let canvas = document.createElement("canvas");
    canvas.setAttribute("width", container.clientWidth * .65);
    canvas.setAttribute("height", container.clientHeight * .8);
    canvas.setAttribute("id", `percentCanvas${id}`);
    canvas.setAttribute("class", "percentCanvas");
    canvas.style.backgroundColor = "red";
    canvas.style.float = "left";
    canvasDict[container.id] = canvas;
  }

  for (const id in canvasDict) {
    let container = document.getElementById(id);
    container.appendChild(canvasDict[id]);

    let numId = id.split("canvasContainer")[1];
    fillInCanvas(numId);
  }
}

function fillInCanvas(id) {
  let container = document.getElementById(`canvasContainer${id}`);
  let percent = Number(container.textContent.split("%")[0]) / 100;

  let canvas = document.getElementById(`percentCanvas${id}`);
  let canv = canvas.getContext("2d");

  let canvasWidth = canvas.clientWidth;
  let canvasHeight = canvas.clientHeight;

  canv.fillStyle = "green";
  canv.fillRect(0, 0, canvasWidth * percent, canvasHeight);
}

reSizeCanvases();