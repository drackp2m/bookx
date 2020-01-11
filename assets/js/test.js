$(".book").on(
  "mouse-position",
  {
    debug: 2
  },
  function(event) {
    console.log(event.mousePosition);
  }
);
