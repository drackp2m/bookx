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

      $(this.book).append('<div class="pages"></div>');
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

    putPercentageElement() {
      $(this.book).prepend('<div class="progress"><span></span></div>');
    }

    setPercentage(percentageElement, percentage) {
      percentageElement.css("width", percentage + "%");

      if (percentage == 100) {
        $(this.book)
          .find(".progress")
          .addClass("transparent");
      }
    }

    checkPercentage() {
      this.putPercentageElement();

      var imagesToLoad = this.opened ? this.pages.length : 2;
      var imagesLoaded = 0;
      var percentageElement = $(this.book).find(".progress span");

      $(this.book)
        .find("img")
        .each((index, image) => {
          $(image).on("load", () => {
            imagesLoaded++;
            var percentage = 100 / (imagesToLoad / imagesLoaded);

            this.setPercentage(percentageElement, percentage);
          });
        });
    }

    initHoverZone() {
      var settings = this.settings;
      var book = this.book;

      $(this.book).mousemove(function(event) {
        var relX = (
          (event.pageX - $(this).offset().left) / (settings.width / 2) -
          1
        ).toFixed(2);

        var relY = (
          (event.pageY - $(this).offset().top) / (settings.height / 2) -
          1
        ).toFixed(2);

        var relBoxCoords = "(" + relX + " - " + relY + ")";

        // console.log(relX);

        $(book)
          .find(".pages")
          .css("transform", `rotateX(${relY * 180 / -4}deg) rotateY(${relX * 180}deg)`);
      });
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

    book.checkPercentage();

    book.initHoverZone();
  };
})(jQuery);

$("div.book").Book(/* { width: 250, height: 300 } */);
