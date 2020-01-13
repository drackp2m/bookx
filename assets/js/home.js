(function($) {
  class Book {
    book;
    settings;
    pages;
    opened = false;

    constructor(element, settings) {
      this.book = element;
      this.settings = settings;
      this.pages = $(element).find("> *");
      this.book.css({
        width: this.settings.width + "px",
        height: this.settings.height + "px"
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

    initHoverZone() {
      var book = this.book;
      var that = this;

      $(this.book)
        .on("mouse-position", function(event) {
          $(book).removeClass("transition");

          var distance = that.getDistancePercentage(event, 10, 80),
            degrees = that.getDegreesPercentage(event, 5, 100);

          if (degrees != 0) {
            var distanceBackup = distance;
            distance = (distance * (100 - degrees)) / 100;
            degrees = (distanceBackup * degrees) / 100;
          }

          if (["II", "III", "II-III"].includes(event.mousePosition.quadrant)) {
            distance *= -1;
          }

          if (["III", "III-IV", "IV"].includes(event.mousePosition.quadrant)) {
            degrees *= -1;
          }

          $(book)
            .find(".pages")
            .css(
              "transform",
              `rotateX(${(degrees * 1.8) / 4}deg)
                rotateY(${distance * 1.8}deg)`
            );
        })
        .on("mouseleave", function(event) {
          $(book)
            .addClass("transition")
            .find(".pages")
            .css(
              "transform",
              `rotateX(0deg)
                rotateY(0deg)`
            );
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
      if (typeof limit == "undefined") limit = 100 - offset;
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
      {
        width: 400,
        height: 480
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

$("div.book").Book(/* { width: 250, height: 300 } */);
