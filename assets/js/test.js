class MousePosition {
  event;
  debug;

  constructor(event, debug) {
    this.event = event;
    this.debug = debug;
  }

  quadrant;
  triangleData;

  run() {
    var element = this.event.currentTarget;
    var width = $(element).width();
    var height = $(element).height();

    var x = this.event.pageX - Math.ceil($(element).offset().left) - width / 2;
    var y =
      (this.event.pageY - Math.ceil($(element).offset().top) - height / 2) * -1;

    var quadrant = this.getQuadrant(x, y);

    var triangleData;

    switch (quadrant) {
      case "I":
        triangleData = this.getTriangleData(x, y);
        break;
      case "II-I":
        triangleData = { hypotenuse: y, legA: 0, legB: y, alphaAngle: 0, betaAngle: 0 };
        break;
      case "II":
        triangleData = this.getTriangleData(-x, y);
        break;
      case "II-III":
        triangleData = { hypotenuse: -x, legA: -x, legB: 0, alphaAngle: 0, betaAngle: 0 };
        break;
      case "III":
        triangleData = this.getTriangleData(-x, -y);
        break;
      case "III-IV":
        triangleData = { hypotenuse: -y, legA: 0, legB: -y, alphaAngle: 0, betaAngle: 0 };
        break;
      case "IV":
        triangleData = this.getTriangleData(x, -y);
        break;
      case "I-IV":
        triangleData = { hypotenuse: x, legA: x, legB: 0, alphaAngle: 0, betaAngle: 0 };
        break;
    }

    this.drawTriangle(quadrant, triangleData);

    return {
      distance: triangleData.hypotenuse.toFixed(2),
      degrees: this.getTotalGrades(quadrant, triangleData).toFixed(2)
    };
  }

  getQuadrant(x, y) {
    if (x > 0 && y > 0) return "I";
    if (x < 0 && y > 0) return "II";
    if (x < 0 && y < 0) return "III";
    if (x > 0 && y < 0) return "IV";
    if (x == 0 && y > 0) return "II-I";
    if (x == 0 && y < 0) return "III-IV";
    if (x > 0 && y == 0) return "I-IV";
    if (x < 0 && y == 0) return "II-III";
    return "X";
  }

  getTriangleData(x, y) {
    var hypotenuse = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

    var alphaAngle =
      (Math.asin(x / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))) * 180) /
      Math.PI;
    var betaAngle = 90 - alphaAngle;

    return {
      legA: x,
      legB: y,
      hypotenuse: hypotenuse,
      alphaAngle: alphaAngle,
      betaAngle: betaAngle
    };
  }

  getHypotenuseRotate(quadrant, triangleData) {
    switch (quadrant) {
      case "II":
      case "IV":
        return -triangleData.alphaAngle;
      default:
        return triangleData.alphaAngle;
    }
  }

  getTotalGrades(quadrant, triangleData) {
    switch (quadrant) {
      case "I":
        return triangleData.alphaAngle;
      case "II-I":
        return 0;
      case "II":
        return 360 - triangleData.alphaAngle;
      case "II-III":
        return 270;
      case "III":
        return 270 - triangleData.betaAngle;
      case "III-IV":
        return 180;
      case "IV":
        return 180 - triangleData.betaAngle;
      case "I-IV":
        return 90;
    }
  }

  drawTriangle(quadrant, triangleData) {
    $(".center")
      .attr("class", "")
      .addClass("center " + quadrant);

    $(".leg-a").width(triangleData.legA);
    $(".leg-b").height(triangleData.legB);

    $(".hypotenuse")
      .height(triangleData.hypotenuse)
      .css(
        "transform",
        `rotate(${this.getHypotenuseRotate(quadrant, triangleData)}deg)`
      );

    $(".info").html(`<span>· legA ${triangleData.legA}
    <br />· legB ${triangleData.legB}
    <br />· hypotenuse ${triangleData.hypotenuse.toFixed(2)}
    <br />· alphaAngle ${triangleData.alphaAngle.toFixed(2)}
    <br />· betaAngle ${triangleData.betaAngle.toFixed(2)}
    <br />· totalGrades ${this.getTotalGrades(quadrant, triangleData).toFixed(
      2
    )}
    </span>`);
  }
}

jQuery.event.special.mouseposition = {
  delegateType: "mousemove",
  bindType: "mousemove",
  handle: function(event) {
    var handleObj = event.handleObj;
    var targetData = jQuery.data(event.target);

    targetData.position = new MousePosition(event).run();

    var ret = handleObj.handler.apply(this, arguments);
    return ret;
  }
};

$(".area").on("mouseposition", function(event) {
  //console.log($(this).data('position'));
});
