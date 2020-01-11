(function($) {
  var mousePosition;

  jQuery.event.special["mouse-position"] = {
    setup: function(data) {
      mousePosition = new MousePosition();

      $(this).bind("mousemove", data, mousemoveHandle);
    },
    teardown: function() {
      $(this).unbind("mousemove");
    }
  };

  function mousemoveHandle(event) {
    event.type = "mouse-position";
    event.mousePosition = mousePosition.run(event);

    $(event.currentTarget).trigger(event);
  }

  class MousePosition {
    event;
    axisQuadrants = ["II-I", "II-III", "III-IV", "I-IV", "X"];
    xOffset;
    yOffset;
    quadrant;
    triangleData;

    run(event) {
      this.event = event;

      this.setOffsets();

      this.setQuadrant();

      this.setTriangleData();

      return this.getData();
    }

    setOffsets() {
      var width = $(this.event.currentTarget).width(),
        height = $(this.event.currentTarget).height(),
        leftOffset = Math.ceil($(this.event.currentTarget).offset().left),
        rightOffset = Math.ceil($(this.event.currentTarget).offset().top);

      this.xOffset = this.event.pageX - leftOffset - width / 2;
      this.yOffset = (this.event.pageY - rightOffset - height / 2) * -1;
      this.yOffset = this.yOffset == -0 ? 0 : this.yOffset;
    }

    setQuadrant() {
      if (this.xOffset > 0 && this.yOffset > 0) this.quadrant = "I";
      else if (this.xOffset < 0 && this.yOffset > 0) this.quadrant = "II";
      else if (this.xOffset < 0 && this.yOffset < 0) this.quadrant = "III";
      else if (this.xOffset > 0 && this.yOffset < 0) this.quadrant = "IV";
      else if (this.xOffset == 0 && this.yOffset > 0) this.quadrant = "II-I";
      else if (this.xOffset == 0 && this.yOffset < 0) this.quadrant = "III-IV";
      else if (this.xOffset > 0 && this.yOffset == 0) this.quadrant = "I-IV";
      else if (this.xOffset < 0 && this.yOffset == 0) this.quadrant = "II-III";
      else this.quadrant = "X";
    }

    isLine() {
      return this.axisQuadrants.includes(this.quadrant);
    }

    getHypotenuse(x, y) {
      return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    }

    getAlphaAngle(x, hypotenuse) {
      return (Math.asin(x / hypotenuse) * 180) / Math.PI;
    }

    setTriangleData() {
      var x = this.xOffset > 0 ? this.xOffset : -this.xOffset,
        y = this.yOffset > 0 ? this.yOffset : -this.yOffset,
        isLine = this.isLine(),
        hypotenuse = isLine ? x || y : this.getHypotenuse(x, y),
        alphaAngle = isLine ? 0 : this.getAlphaAngle(x, hypotenuse),
        betaAngle = isLine ? 0 : 90 - alphaAngle;

      this.triangleData = {
        legA: x,
        legB: y,
        hypotenuse: hypotenuse,
        alphaAngle: alphaAngle,
        betaAngle: betaAngle
      };
    }

    getTotalDegrees() {
      switch (this.quadrant) {
        case "I":
        case "II-I":
          return this.triangleData.alphaAngle;
        case "II":
        case "II-III":
          return 270 + this.triangleData.betaAngle;
        case "III":
        case "III-IV":
          return 180 + this.triangleData.alphaAngle;
        case "IV":
        case "I-IV":
          return 90 + this.triangleData.betaAngle;
        default:
          return -1;
      }
    }

    getData() {
      return {
        distance: this.triangleData.hypotenuse,
        degrees: this.getTotalDegrees()
      };
    }
  }
})(jQuery);
