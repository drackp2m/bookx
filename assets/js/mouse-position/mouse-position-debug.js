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
    constructor() {
      this.axisQuadrants = ["II-I", "II-III", "III-IV", "I-IV", "X"];
    }

    run(event) {
      this.event = event;

      this.setSettings(event);

      this.setOffsets();

      this.setQuadrant();

      this.setTriangleData();

      this.drawDebug();

      return this.getData();
    }

    setSettings(event) {
      this.settings = {
        ...{
          debug: 0
        },
        ...(event.data || {})
      };
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

    drawDebug() {
      if (this.settings.debug != 2) return null;

      this.prepareDebugElements();

      var legA = this.triangleData.legA,
        alphaAngle = this.triangleData.alphaAngle,
        legB = this.triangleData.legB,
        betaAngle = this.triangleData.betaAngle,
        hypotenuse = this.triangleData.hypotenuse,
        degrees = this.getTotalDegrees();

      $(this.event.currentTarget)
        .find(".center")
        .attr("class", "")
        .addClass("center " + this.quadrant);

      $(this.event.currentTarget)
        .find(".leg-a")
        .width(legA);

      $(this.event.currentTarget)
        .find(".leg-b")
        .height(legB);

      $(this.event.currentTarget)
        .find(".hypotenuse")
        .height(hypotenuse)
        .css("transform", `rotate(${degrees != -1 ? degrees : 0}deg)`);

      var table = '<tr><td>a ↔</td><td class="l-a"td>%l-a$</td></tr><tr><td>m∠α</td><td class="m-a"td>%m-a$</td></tr><tr><td>b ↔</td><td class="l-b"td>%l-b$</td></tr><tr><td>m∠β</td><td class="m-b"td>%m-b$</td></tr><tr><td>h ↔</td><td class="l-h"td>%l-h$</td></tr><tr><td>r ↻</td><td class="t-m"td>%t-m$</td></tr>'
        .replace("%l-a$", legA)
        .replace("%m-a$", alphaAngle)
        .replace("%l-b$", legB)
        .replace("%m-b$", betaAngle)
        .replace("%l-h$", hypotenuse)
        .replace("%t-m$", degrees);

      $(this.event.currentTarget)
        .find(".info table")
        .html(table);
    }

    prepareDebugElements() {
      if (!$(document).data("mouse-position-debug")) {
        $(document).data("mouse-position-debug", true);

        var position = $(this.event.currentTarget).css("position");

        $("head").prepend(
          $(
            "<style>.mouse-position-debug{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;justify-content:center;align-items:center}.center{background-color:black}.center .leg-a, .center .leg-b, .center .hypotenuse{background-color:black}.center{position:relative;width:1px;height:1px}.center .leg-a, .center .leg-b, .center .hypotenuse{position:absolute}.center .leg-a{height:1px}.center .leg-b, .center .hypotenuse{width:1px}.center.II .leg-b, .center.II .hypotenuse{bottom:1px}.center.II-I .leg-b, .center.II-I .hypotenuse{bottom:1px}.center.I .leg-b, .center.I .hypotenuse{bottom:1px}.center.III .leg-b{top:1px}.center.III .hypotenuse{bottom:0;left:-1px}.center.III-IV .leg-b{top:1px}.center.III-IV .hypotenuse{bottom:0;left:-1px}.center.IV .leg-b{top:1px}.center.IV .hypotenuse{bottom:0;left:-1px}.center.II .leg-a{right:1px}.center.II-III .leg-a{right:1px}.center.III .leg-a{right:1px}.center.I .leg-a{left:1px}.center.I .leg-b{right:0}.center.I-IV .leg-a{left:1px}.center.I-IV .leg-b{right:0}.center.IV .leg-a{left:1px}.center.IV .leg-b{right:0}.center.II-III .leg-b{display:none}.center.I-IV .leg-b{display:none}.center.II-III .hypotenuse{display:none}.center.I-IV .hypotenuse{display:none}.center.II-I .hypotenuse{display:none}.center.III-IV .hypotenuse{display:none}.center.I .hypotenuse, .center.III .hypotenuse{transform-origin:bottom left}.center.II .hypotenuse, .center.IV .hypotenuse{transform-origin:bottom right}.center.III .hypotenuse{left:1px}.info{position:absolute;top:10px;left:10px}.info table tr td{color:rgba(0, 0, 0, 0.3)}.info table tr td:last-child{color:rgba(0, 0, 0, 0.4)}</style>"
          )
        );
      }

      if (!$(this.event.currentTarget).data("debug")) {
        $(this.event.currentTarget).data("debug", true);

        if (!["absolute", "fixed", "relative", "sticky"].includes(position)) {
          $(this.event.currentTarget).css("position", "relative");
        }

        $(this.event.currentTarget).append(
          '<div class="mouse-position-debug"><div class="info"><table></table></div><div class="center"><div class="leg-a"><div class="leg-b"></div></div><div class="hypotenuse"></div></div></div>'
        );
      }
    }

    getData() {
      return {
        ...{
          distance: this.triangleData.hypotenuse,
          degrees: this.getTotalDegrees()
        },
        ...(this.settings.debug == 0 ? {} : { debug: this.triangleData })
      };
    }
  }
})(jQuery);
