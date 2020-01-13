$.fn.Book = function() {
  const book = this;
  const pages = $(book).find("> *");

  checkPages(pages);

  let sheets = pages.length / 2;

  while (sheets >= 1) {
    const lastPage = pages[sheets * 2 - 2];
    const penultimagePage = pages[sheets * 2 - 1];

    $(lastPage).remove();
    $(penultimagePage).remove();

    const newSheet = $('<div class="sheet"></div>');
    newSheet.append(penultimagePage, lastPage);

    $(book).append(newSheet);

    sheets--;
  }

  function printError(message) {
    throw new Error(message);
  }

  function printWarning(message) {
    console.error(message);
  }

  function printInfo(message) {
    console.log(message);
  }

  function checkPages(pages) {
    const pass = pages.length >= 4 && pages.length % 2 === 0;

    if (!pass) {
      printError(
        "The number of pages in the book must be even and greater than four."
      );
    }
  }
};

$("div.book").Book();
