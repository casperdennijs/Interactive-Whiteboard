window.onload = function() {
    let prev = {};
    let canvas = document.getElementsByClassName("whiteboard")[0];
    let pointerContainer = document.getElementById("pointers");
  
    let pointer = document.createElement("div");
    pointer.setAttribute("class", "pointer");
  
    let clients = {};
    let pointers = {};
  
    function now() {
      return new Date().getTime();
    }
  
    let lastEmit = now();
  
    canvas.onmouseup = canvas.onmousemove = canvas.onmousedown = function(e) {
      switch (e.type) {
        case "mouseup":
          drawing = false;
          break;
  
        case "mousemove":
          socket.emit("mousemove", {
            x: e.pageX,
            y: e.pageY
          });
          lastEmit = now();
          break;
  
        case "mousedown":
          drawing = true;
          prev.x = e.pageX;
          prev.y = e.pageY;
          break;
  
        default:
          break;
      }
    };
  
    socket.on("moving", function(data) {
      if (!clients.hasOwnProperty(data.id)) {
        pointers[data.id] = pointerContainer.appendChild(pointer.cloneNode());
      }
  
      pointers[data.id].style.left = data.x + "px";
      pointers[data.id].style.top = data.y + "px";
  
      clients[data.id] = data;
      clients[data.id].updated = now();
    });
  
    socket.on("clientdisconnect", function(id) {
      delete clients[id];
      if (pointers[id]) {
        pointers[id].parentNode.removeChild(pointers[id]);
      }
    });
  };