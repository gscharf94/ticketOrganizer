function openNav() {
  document.getElementById('sidebar').style.width = "160px";
  document.getElementById('main').style.marginLeft = "160px";
  document.getElementById('menuButton').style.visibility = "hidden";
}

function closeNav() {
  document.getElementById('sidebar').style.width = "0";
  document.getElementById('main').style.marginLeft = "0";
  document.getElementById('menuButton').style.visibility = "visible";
}