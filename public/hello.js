function changeTime() {
  const time = document.getElementById("time");
  time.innerHTML = new Date().toLocaleTimeString();
}

setInterval(() => {
  changeTime();
}, 1000);
