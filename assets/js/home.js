(function($) {
  class Book {
    constructor(element, settings) {
      this.book = element;
      this.settings = settings;
      this.pages = $(element).find("> *");
      this.book.css({
        width: this.settings.book.width + "px",
        height: this.settings.book.height + "px"
      });
    }

    printError(message) {
      throw new Error(message);
    }

    printWarning(message) {
      console.error(message);
    }

    printInfo(message) {
      console.log(message);
    }

    preventLoadAllImages() {
      this.pages.each((index, page) => {
        var src = $(page).attr("src");

        $(page)
          .removeAttr("src")
          .data("src", src);
      });
    }

    checkPages() {
      var pass = this.pages.length >= 4 && this.pages.length % 2 === 0;

      if (!pass) {
        this.printError(
          "The number of pages in the book must be even and greater than four."
        );
      }

      $(this.book).append('<div class="pages"><div class="mold"></div></div>');
    }

    orderSheet(sheets) {
      var lastPage = $(this.pages[sheets * 2 - 2]);
      var penultimagePage = $(this.pages[sheets * 2 - 1]);

      if (sheets == this.pages.length / 2) {
        penultimagePage.attr(
          "src",
          penultimagePage.data("src").replace("data:", "")
        );
      } else if (sheets == 1) {
        lastPage.attr("src", lastPage.data("src").replace("data:", ""));
      }

      lastPage.remove();
      penultimagePage.remove();

      $(this.book)
        .find(".pages")
        .append(
          $('<div class="sheet"></div>')
            .append(penultimagePage, lastPage)
            .css("transform", `translateZ(-${sheets}px)`)
        );
    }

    addMold() {
      var frontUrl = $(this.pages[0]).attr("src");
      $(this.book)
        .find(".mold")
        .append(`<img alt="mold" src="${frontUrl}">`);
    }

    putLoadingElement() {
      $(this.book).prepend('<div class="progress"><span></span></div>');
    }

    setLoadedPercentage(percentageElement, percentage) {
      percentageElement.css("width", percentage + "%");

      if (percentage == 100) {
        $(this.book)
          .find(".progress")
          .addClass("transparent");
      }
    }

    checkLoadedPercentage() {
      this.putLoadingElement();

      var imagesToLoad = this.opened ? this.pages.length : 2;
      var imagesLoaded = 0;
      var percentageElement = $(this.book).find(".progress span");

      $(this.book)
        .find("img")
        .each((index, image) => {
          $(image).on("load", () => {
            imagesLoaded++;
            var percentage = 100 / (imagesToLoad / imagesLoaded);

            this.setLoadedPercentage(percentageElement, percentage);
          });
        });
    }

    getTransitionSeconds() {
      var seconds = 0;

      if (typeof this.hoverTimestamp == "undefined") {
        this.hoverTimestamp = +new Date();
      }

      if (this.hoverTimestamp != 0) {
        seconds = (
          this.settings.overview.animationDuration -
          (+new Date() - this.hoverTimestamp) / 1000
        ).toFixed(2);

        if (seconds < 0) {
          seconds = 0;
          this.hoverTimestamp = 0;
        }
      }

      return seconds;
    }

    initHoverZone() {
      var book = this.book;
      var that = this;

      $(this.book)
        .on("mouse-position", function(event) {
          var seconds = that.getTransitionSeconds();

          var distanceOffset = that.settings.overview.innerOffset,
            distanceLimit = 100 - that.settings.overview.outerOffset,
            xOffset = that.settings.overview.xOffset,
            degreesOffset = xOffset == 0 ? xOffset : xOffset / 2,
            yOffset = that.settings.overview.yOffset,
            degreesLimit = 100 - (yOffset == 0 ? yOffset : yOffset / 2),
            distance = that.getDistancePercentage(
              event,
              distanceOffset,
              distanceLimit
            ),
            degrees = that.getDegreesPercentage(
              event,
              degreesOffset,
              degreesLimit
            );

          if (degrees != 0) {
            var originalDistance = distance;
            distance = (distance * (100 - degrees)) / 100;
            degrees = (originalDistance * degrees) / 100;
          }

          if (["II", "III", "II-III"].includes(event.mousePosition.quadrant)) {
            distance *= -1;
          }

          if (["III", "III-IV", "IV"].includes(event.mousePosition.quadrant)) {
            degrees *= -1;
          }

          $(book)
            .find(".pages")
            .css({
              transition: seconds
                ? `transform ${seconds}s ease-in-out`
                : "none",
              transform: `rotateX(${(degrees *
                that.settings.overview.yRotation) /
                100}deg)
                rotateY(${(distance * that.settings.overview.xRotation) /
                  100}deg)`
            });
        })
        .on("mouseleave", function(event) {
          delete that.hoverTimestamp;

          $(book)
            .find(".pages")
            .css({
              transition: `transform ${that.settings.overview.animationDuration}s ease-in-out`,
              transform: `rotateX(0deg)
                rotateY(0deg)`
            });
        });
    }

    getDistancePercentage(event, offset, limit) {
      var trimmedPercentage = this.getPercentageWithLimits(
        event.mousePosition.distance,
        event.currentTarget.clientWidth / 2,
        offset,
        limit
      );

      return this.trimPercentage(trimmedPercentage);
    }

    getDegreesPercentage(event, offset, limit) {
      var trimmedPercentage = this.getPercentageWithLimits(
        this.getCurrentDegrees(event),
        90,
        offset,
        limit
      );

      return this.trimPercentage(trimmedPercentage);
    }

    getCurrentDegrees(event) {
      switch (event.mousePosition.quadrant) {
        case "I":
          return 90 - event.mousePosition.degrees;
        case "II":
          return event.mousePosition.degrees - 270;
        case "III":
          return 270 - event.mousePosition.degrees;
        case "IV":
          return event.mousePosition.degrees - 90;
        case "II-I":
        case "III-IV":
          return 90;
        default:
          return 0;
      }
    }

    getPercentageWithLimits(distance, totalDistance, offset, limit) {
      if (typeof limit == "undefined") {
        limit = 100 - offset;
      }

      var percentage = (distance / totalDistance) * 100;

      return ((percentage - offset) / (limit - offset)) * 100;
    }

    trimPercentage(percentage) {
      if (percentage < 0) return 0;
      if (percentage > 100) return 100;

      return percentage.toFixed(2);
    }
  }

  $.fn.Book = function(options) {
    var settings = $.extend(
      true,
      {
        book: {
          width: 400,
          height: 480
        },
        overview: {
          zoom: 20,
          innerOffset: 10,
          outerOffset: 20,
          xOffset: 10,
          yOffset: 0,
          xRotation: 170,
          yRotation: 30,
          animationDuration: 0.5
        },
        view: {
          zoom: 40,
          maxAngleOpen: 180,
          minAngleOpen: 150,
          raisedPages: 7,
          animationDuration: 0.3
        }
      },
      options
    );

    var book = new Book(this, settings);

    book.preventLoadAllImages();

    book.checkPages();

    var sheetsCount = book.pages.length / 2;

    while (sheetsCount >= 1) {
      book.orderSheet(sheetsCount);
      sheetsCount--;
    }

    book.addMold();

    book.checkLoadedPercentage();

    book.initHoverZone();
  };
})(jQuery);

$("div.book").Book({
  book: { width: 250, height: 300 },
  overview: {
    animationDuration: 0.3,
    yRotation: 40
  }
});
