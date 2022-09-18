import { loader } from "./fileLoader";
import { makeTotalTable, clearTotalTable } from "./totalTable";
import quantityInputEventListeners from "./quantityInputEventListeners";
import { getTablesFromDoc, makeSeparateTable, clearSeparateTable } from "./separateTable";
import { totalSystems } from "./globalData";
import { resultLabel } from "./resultLabel";
import { dropdownEvents } from "./dropdownEvents";
import { resultBlock } from "./resultBlock";
import { resetRefnetsCheckbox } from "./changeAccessories";
import { resetControllers } from "./changeAccessories";
import { modal } from "./errorModal";
import ppd from "./ppd";
//import vrf from "./vrfTable";
//import * as XLSX from "xlsx";
//import { jsPDF } from "jspdf";
//import * as PDFJS from "pdfjs-dist";
// import * as genPng from "../js/vendor/generatepng";
// import autoTable from "jspdf-autotable";
// import { loadedFont } from "./fontForPdf";

// import { refcool, refcoolNote } from "./chillers";

//import { klsGlossary } from "./kls-glossary";

import { getData, setData } from "./firebase";

let data = {};

getData
  .then((res) => {
    data = res;
    $(".page-loader").hide();
    addTranslateList("header");
    addTranslateList("footer");
    addTranslateList("main");

    $('.translate-part input[name="search"]').each((idx, item) => {
      const text = $(item).val();
      const $words = $(item).parents(".translate-part").first().find(".translate-list .words");

      if (text.trim().length > 1) {
        $words.each((idx, words) => {
          const $stroke = $(words).parent();
          $stroke.addClass("hidden");

          $(words)
            .find("span")
            .each((idx, word) => {
              if ($(word).text().toLowerCase().includes(text.trim().toLowerCase())) {
                $stroke.removeClass("hidden");
              }
            });
        });

        $(item).next().show();
      } else {
        $words.parent().removeClass("hidden");
      }
    });
  })
  .catch((e) => {
    $(".page-loader").hide();
    $("body").append("<div>Ошибка при загрузке данных перевода с сервера</div>");
    console.log("error", e);
  });

function onStrokeBtnClick(e) {
  const $target = $(e.currentTarget);
  const $stroke = $target.parents(".stroke").first();

  if ($stroke.hasClass("new")) {
    $stroke.remove();
  } else {
    $stroke.toggleClass("for-delete");
  }

  if ($(".stroke.new").length === 0 && $(".stroke.for-delete").length === 0) {
    $(".translate-send").attr("disabled", true);
  } else {
    $(".translate-send").removeAttr("disabled");
  }
}

function onAddBtnClick(e) {
  const $target = $(e.currentTarget);
  const $wrapper = $target.parent();
  const $eng = $wrapper.find('input[name="eng"]');
  const $rus = $wrapper.find('input[name="rus"]');

  if ($eng.val().trim() === "") {
    $eng.addClass("error");
  }

  if ($rus.val().trim() === "") {
    $rus.addClass("error");
  }

  if ($eng.val().trim() !== "" && $rus.val().trim() !== "") {
    const $newStroke = makeNewStroke($eng.val(), $rus.val());
    $eng.val("");
    $rus.val("");
    $newStroke.addClass("new");
    $target.parent().find(".translate-list").prepend($newStroke);
    $(".translate-send").removeAttr("disabled");
  }
}

function onInput(e) {
  const $target = $(e.currentTarget);
  $target.removeClass("error");
}

function makeDeleteBtn() {
  const $btn = $("<button class='strokeBtn'></button>");
  const $spanDelete = $("<span>Удалить</span>");
  const $spanCancel = $("<span>Отменить</span>");
  $btn.append($spanDelete);
  $btn.append($spanCancel);
  return $btn;
}

function makeNewStroke(eng, rus) {
  const $strokeDiv = $("<div class='stroke'></div>");
  const $wordsDiv = $("<div class='words'></div>");
  $wordsDiv.append(`<span>${eng}</span>`);
  $wordsDiv.append(`<span>${rus}</span>`);
  $strokeDiv.append($wordsDiv);
  $strokeDiv.append(makeDeleteBtn());
  return $strokeDiv;
}

function addTranslateList(part) {
  const $div = $("<div></div>");
  data[part].forEach((item) => {
    $div.prepend(makeNewStroke(item.eng, item.rus));
  });
  $(`#${part} .translate-list`).append($div.html());
}

function makeDataPart(name) {
  let arr = [];
  const $strokes = $(`.translate-part#${name} .stroke`);
  $strokes.each((idx, item) => {
    if ($(item).hasClass("for-delete")) return;
    const $word = $(item).find(".words span");
    arr.unshift({ "eng": $word.eq(0).text(), "rus": $word.eq(1).text() });
  });
  return arr;
}

function onSend() {
  const newData = {};
  newData["header"] = makeDataPart("header");
  newData["footer"] = makeDataPart("footer");
  newData["basic"] = data["basic"];
  newData["main"] = makeDataPart("main");

  $(".page-loader").show();

  setData(newData)
    .then((res) => {
      location.reload();
    })
    .catch((e) => {
      $(".page-loader").hide();
    });
}

function onSearch(e) {
  const $target = $(e.currentTarget);
  const text = $target.val();
  const $words = $target.parents(".translate-part").first().find(".translate-list .words");

  if (text.trim().length > 1) {
    $words.each((idx, words) => {
      const $stroke = $(words).parent();
      $stroke.addClass("hidden");

      $(words)
        .find("span")
        .each((idx, word) => {
          if ($(word).text().toLowerCase().includes(text.trim().toLowerCase())) {
            $stroke.removeClass("hidden");
          }
        });
    });

    $target.next().show();
  } else {
    $target.next().hide();
    $words.parent().removeClass("hidden");
  }
}

$(".translate-send").attr("disabled", true);

$(".translate-list .words span").on("input", () => console.log("change"));

$(document).on("click", ".translate-list .strokeBtn", onStrokeBtnClick);

$(".add-translate-page .addStroke").on("click", onAddBtnClick);
$(".translate-part input").on("input", onInput);
$(".translate-send").on("click", onSend);
$('.translate-part input[name="search"]').on("input", onSearch);

$("#add-translate-password form").on("submit", function (e) {
  e.preventDefault();

  if ($(this).find("input").val() === "daichi2022") {
    $("#add-translate-password").hide();
  } else {
    $(this).parent().addClass("error");
  }
});

$("#add-translate-password input").on("input", function () {
  $("#add-translate-password").removeClass("error");
});

$(".translate-search-clear").on("click", function () {
  $(this).prev().val("");
  $(this).prev().trigger("input");
  $(this).hide();
});

// PDFJS.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.13.216/pdf.worker.js";
// import * as PDFJS from "pdfjs-dist";
// import PDFJSWorker from "pdfjs-dist/build/pdf.worker.js";

//PDFJS.GlobalWorkerOptions.workerSrc = PDFJSWorker;

const uploads = document.querySelectorAll(".upload");

// function loadFile(url, callback) {
//   PizZipUtils.getBinaryContent(url, callback);
// }

function onLastFileLoaded() {
  //resultLabel.show();

  // if ($(".result__midea table").find("tr").length > 0) {
  //   $(".result__midea").show();
  // }

  // if ($(".result table").find("tr").length > 0) {
  //   resultBlock.show();

  //   // $(".result-block__radios button").removeAttr("disabled");
  //   // $(".result-block__radios button").first().addClass("active");
  //   // $(".result-info").show();
  //   // $(".result-block__accessories").show();

  //   makeTotalTable();

  //   quantityInputEventListeners.remove();
  //   quantityInputEventListeners.add();
  // }

  setTimeout(() => {
    loader.remove();
    onFileClear();
  }, 1000);
}

// function gettext(pdfUrl) {
//   var pdf = pdfjsLib.getDocument(pdfUrl);
//   return pdf.then(function (pdf) {
//     // get all pages text
//     var maxPages = pdf.pdfInfo.numPages;
//     var countPromises = []; // collecting all page promises
//     for (var j = 1; j <= maxPages; j++) {
//       var page = pdf.getPage(j);

//       var txt = "";
//       countPromises.push(
//         page.then(function (page) {
//           // add page promise
//           var textContent = page.getTextContent();
//           return textContent.then(function (text) {
//             // return content promise
//             return text.items
//               .map(function (s) {
//                 return s.str;
//               })
//               .join(""); // value page text
//           });
//         })
//       );
//     }
//     // Wait for all pages and join text
//     return Promise.all(countPromises).then(function (texts) {
//       return texts.join("");
//     });
//   });
// }

// async function getPdfText(data) {
//   let doc = await pdfjsLib.getDocument({ data }).promise;
//   let pageTexts = Array.from({ length: doc.numPages }, async (v, i) => {
//     return (await (await doc.getPage(i + 1)).getTextContent()).items.map((token) => token.str).join(" ");
//   });
//   return (await Promise.all(pageTexts)).join(" ");
// }

// const getPageText = async (pdf: Pdf, pageNo: number) => {
//   const page = await pdf.getPage(pageNo);
//   const tokenizedText = await page.getTextContent();
//   const pageText = tokenizedText.items.map(token => token.str).join("");
//   return pageText;
// };

/* see example of a PDFSource below */
// const getPDFText = async (source: PDFSource): Promise<string> => {
//   Object.assign(window, {pdfjsWorker: PDFJSWorker}); // added to fit 2.3.0
//   const pdf: Pdf = await PDFJS.getDocument(source).promise;
//   const maxPages = pdf.numPages;
//   const pageTextPromises = [];
//   for (let pageNo = 1; pageNo <= maxPages; pageNo += 1) {
//     pageTextPromises.push(getPageText(pdf, pageNo));
//   }
//   const pageTexts = await Promise.all(pageTextPromises);
//   return pageTexts.join(" ");
// };

// export function putBinaryImageData(ctx, imgData, transferMaps = null) {
//   const FULL_CHUNK_HEIGHT = 16;

//   const ImageKind = {
//     GRAYSCALE_1BPP: 1,
//     RGB_24BPP: 2,
//     RGBA_32BPP: 3,
//   };

//   if (typeof ImageData !== "undefined" && imgData instanceof ImageData) {
//     ctx.putImageData(imgData, 0, 0);
//     return;
//   }

//   const height = imgData.height,
//     width = imgData.width;
//   const partialChunkHeight = height % FULL_CHUNK_HEIGHT;
//   const fullChunks = (height - partialChunkHeight) / FULL_CHUNK_HEIGHT;
//   const totalChunks = partialChunkHeight === 0 ? fullChunks : fullChunks + 1;
//   const chunkImgData = ctx.createImageData(width, FULL_CHUNK_HEIGHT);
//   let srcPos = 0,
//     destPos;
//   const src = imgData.data;
//   const dest = chunkImgData.data;
//   let i, j, thisChunkHeight, elemsInThisChunk;
//   let transferMapRed, transferMapGreen, transferMapBlue, transferMapGray;

//   if (transferMaps) {
//     switch (transferMaps.length) {
//       case 1:
//         transferMapRed = transferMaps[0];
//         transferMapGreen = transferMaps[0];
//         transferMapBlue = transferMaps[0];
//         transferMapGray = transferMaps[0];
//         break;

//       case 4:
//         transferMapRed = transferMaps[0];
//         transferMapGreen = transferMaps[1];
//         transferMapBlue = transferMaps[2];
//         transferMapGray = transferMaps[3];
//         break;
//     }
//   }

//   if (imgData.kind === ImageKind.GRAYSCALE_1BPP) {
//     const srcLength = src.byteLength;
//     const dest32 = new Uint32Array(dest.buffer, 0, dest.byteLength >> 2);
//     const dest32DataLength = dest32.length;
//     const fullSrcDiff = (width + 7) >> 3;
//     let white = 0xffffffff;
//     let black = _util.IsLittleEndianCached.value ? 0xff000000 : 0x000000ff;

//     if (transferMapGray) {
//       if (transferMapGray[0] === 0xff && transferMapGray[0xff] === 0) {
//         [white, black] = [black, white];
//       }
//     }

//     for (i = 0; i < totalChunks; i++) {
//       thisChunkHeight = i < fullChunks ? FULL_CHUNK_HEIGHT : partialChunkHeight;
//       destPos = 0;

//       for (j = 0; j < thisChunkHeight; j++) {
//         const srcDiff = srcLength - srcPos;
//         let k = 0;
//         const kEnd = srcDiff > fullSrcDiff ? width : srcDiff * 8 - 7;
//         const kEndUnrolled = kEnd & ~7;
//         let mask = 0;
//         let srcByte = 0;

//         for (; k < kEndUnrolled; k += 8) {
//           srcByte = src[srcPos++];
//           dest32[destPos++] = srcByte & 128 ? white : black;
//           dest32[destPos++] = srcByte & 64 ? white : black;
//           dest32[destPos++] = srcByte & 32 ? white : black;
//           dest32[destPos++] = srcByte & 16 ? white : black;
//           dest32[destPos++] = srcByte & 8 ? white : black;
//           dest32[destPos++] = srcByte & 4 ? white : black;
//           dest32[destPos++] = srcByte & 2 ? white : black;
//           dest32[destPos++] = srcByte & 1 ? white : black;
//         }

//         for (; k < kEnd; k++) {
//           if (mask === 0) {
//             srcByte = src[srcPos++];
//             mask = 128;
//           }

//           dest32[destPos++] = srcByte & mask ? white : black;
//           mask >>= 1;
//         }
//       }

//       while (destPos < dest32DataLength) {
//         dest32[destPos++] = 0;
//       }

//       ctx.putImageData(chunkImgData, 0, i * FULL_CHUNK_HEIGHT);
//     }
//   } else if (imgData.kind === ImageKind.RGBA_32BPP) {
//     const hasTransferMaps = !!(transferMapRed || transferMapGreen || transferMapBlue);
//     j = 0;
//     elemsInThisChunk = width * FULL_CHUNK_HEIGHT * 4;

//     for (i = 0; i < fullChunks; i++) {
//       dest.set(src.subarray(srcPos, srcPos + elemsInThisChunk));
//       srcPos += elemsInThisChunk;

//       if (hasTransferMaps) {
//         for (let k = 0; k < elemsInThisChunk; k += 4) {
//           if (transferMapRed) {
//             dest[k + 0] = transferMapRed[dest[k + 0]];
//           }

//           if (transferMapGreen) {
//             dest[k + 1] = transferMapGreen[dest[k + 1]];
//           }

//           if (transferMapBlue) {
//             dest[k + 2] = transferMapBlue[dest[k + 2]];
//           }
//         }
//       }

//       ctx.putImageData(chunkImgData, 0, j);
//       j += FULL_CHUNK_HEIGHT;
//     }

//     if (i < totalChunks) {
//       elemsInThisChunk = width * partialChunkHeight * 4;
//       dest.set(src.subarray(srcPos, srcPos + elemsInThisChunk));

//       if (hasTransferMaps) {
//         for (let k = 0; k < elemsInThisChunk; k += 4) {
//           if (transferMapRed) {
//             dest[k + 0] = transferMapRed[dest[k + 0]];
//           }

//           if (transferMapGreen) {
//             dest[k + 1] = transferMapGreen[dest[k + 1]];
//           }

//           if (transferMapBlue) {
//             dest[k + 2] = transferMapBlue[dest[k + 2]];
//           }
//         }
//       }

//       ctx.putImageData(chunkImgData, 0, j);
//     }
//   } else if (imgData.kind === ImageKind.RGB_24BPP) {
//     const hasTransferMaps = !!(transferMapRed || transferMapGreen || transferMapBlue);
//     thisChunkHeight = FULL_CHUNK_HEIGHT;
//     elemsInThisChunk = width * thisChunkHeight;

//     for (i = 0; i < totalChunks; i++) {
//       if (i >= fullChunks) {
//         thisChunkHeight = partialChunkHeight;
//         elemsInThisChunk = width * thisChunkHeight;
//       }

//       destPos = 0;

//       for (j = elemsInThisChunk; j--; ) {
//         dest[destPos++] = src[srcPos++];
//         dest[destPos++] = src[srcPos++];
//         dest[destPos++] = src[srcPos++];
//         dest[destPos++] = 255;
//       }

//       if (hasTransferMaps) {
//         for (let k = 0; k < destPos; k += 4) {
//           if (transferMapRed) {
//             dest[k + 0] = transferMapRed[dest[k + 0]];
//           }

//           if (transferMapGreen) {
//             dest[k + 1] = transferMapGreen[dest[k + 1]];
//           }

//           if (transferMapBlue) {
//             dest[k + 2] = transferMapBlue[dest[k + 2]];
//           }
//         }
//       }

//       ctx.putImageData(chunkImgData, 0, i * FULL_CHUNK_HEIGHT);
//     }
//   } else {
//     throw new Error(`bad image kind: ${imgData.kind}`);
//   }
// }

// function addColontitles(doc) {
//   const logo = new Image();
//   logo.src = "/img/kentatsu.jpg";
//   doc.addImage(logo, "JPEG", 15, 7, 60, 8.7);

//   doc.setFontSize(14);
//   doc.setFont("Calibri-bold");
//   doc.text("Технические характеристики", 135, 13, { lang: "ru" });

//   const city = new Image();
//   city.src = "/img/city.png";
//   doc.addImage(city, "png", 13, 263.3, 186, 16.7);

//   const bLogo = new Image();
//   bLogo.src = "/img/daichi.jpg";
//   doc.addImage(bLogo, "JPEG", 169.5, 279, 32, 9.3);

//   doc.setFont("Calibri");
//   doc.setFontSize(8);
//   doc.text(
//     `
// ООО«ДАИЧИ» 125167,  Москва,
// Ленинградский пр-т д. 39, стр. 80
//   `,
//     13,
//     280
//   );
//   doc.text(
//     `
// Тел.: +7(495) 737-37-33
// info@daichi.ru
//   `,
//     70,
//     280
//   );
// }

// function addTitleBlock(doc, name, isMainPage, type, compressor, freon) {
//   const name1 = name ? name : "";
//   const type1 = type ? type : "";
//   const compressor1 = compressor ? compressor : "";
//   const freon1 = freon ? freon : "";

//   doc.setFont("Calibri-bold");
//   doc.setFontSize(16);

//   if (isMainPage) {
//     doc.text(name1, 115, 25);

//     doc.setFont("Calibri");
//     doc.setFontSize(12);
//     doc.text(
//       `
// - ${type1}
// - ${compressor1}
// - ${freon1}
//     `,
//       115,
//       26
//     );
//   } else {
//     doc.text(name1, 155, 25);
//   }
// }

// function addRefcoolNote(doc) {
//   doc.setFontSize(10);
//   const lineHeight = 4.4;
//   const maxWidth = 165;
//   const wordSpace = 3;
//   const blockSpace = 9;

//   let sX = 30;
//   let sY = 60;

//   refcoolNote.forEach((txt) => {
//     doc.setFont("Calibri-bold");
//     doc.text("•", sX - 5, sY);

//     const txtArr = txt.split(" ").filter((item) => item);

//     let x = sX;
//     let y = sY;

//     let isBold = true;

//     txtArr.forEach((item, idx) => {
//       doc.setFont("Calibri");

//       const w = doc.getTextWidth(item);
//       const wn = idx < txtArr.length - 1 ? doc.getTextWidth(txtArr[idx + 1]) : 0;

//       if (x + w - sX > maxWidth) {
//         x = sX;
//         y += lineHeight;
//       }

//       if (item.length < 3 && x + wn - sX > maxWidth) {
//         x = sX;
//         y += lineHeight;
//       }

//       isBold && doc.setFont("Calibri-bold");
//       doc.text(item, x, y);
//       if (isBold && item.slice(-1) === ":") {
//         isBold = false;
//       }
//       x += w + wordSpace;
//     });

//     sY = y + blockSpace;
//   });
// }

// function makeRow(data1, data2, isFirst, isLast) {
//   return [
//     {
//       content: data1 && data1.title ? data1.title : "",
//       styles: { halign: "right", cellPadding: { top: isFirst ? 2 : 0.5, right: 2, bottom: isLast ? 2 : 0.5, left: 2 } },
//     },
//     {
//       content: data1 && data1.value ? data1.value : "",
//       styles: {
//         halign: "left",
//         font: "Calibri-bold",
//         cellPadding: { top: isFirst ? 2 : 0.5, right: 2, bottom: isLast ? 2 : 0.5, left: 2 },
//       },
//     },
//     {
//       content: data2 && data2.title ? data2.title : "",
//       styles: { halign: "right", cellWidth: 53, cellPadding: { top: isFirst ? 2 : 0.5, right: 2, bottom: isLast ? 2 : 0.5, left: 2 } },
//     },
//     {
//       content: data2 && data2.value ? data2.value : "",
//       styles: {
//         halign: "left",
//         font: "Calibri-bold",
//         cellWidth: 47,
//         cellPadding: { top: isFirst ? 2 : 0.5, right: 2, bottom: isLast ? 2 : 0.5, left: 2 },
//       },
//     },
//   ];
// }

////FUNCTION FOR MULTIFILES INPUT
function readmultifiles(input, files) {
  var reader = new FileReader();

  resultLabel.resetNewFailedFileStatus();
  loader.add(files);
  const pdfs = [];

  function readFile(index) {
    if (index >= files.length) return;

    var file = files[index];

    reader.onloadstart = function (e) {
      if (index === 0) {
        //loader.add(files);
      }
    };

    reader.onprogress = function (e) {};

    // IF CONVERT PDF REPORT TO EXCEL

    if ($(".upload-page--word").length > 0) {
      reader.onload = function (e) {
        if (file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          alert("Несоответствие файла " + file.name);
          readFile(index + 1);
          return;
        }
        const zipContent = new JSZip(reader.result);

        const documentxml = zipContent.file("word/document.xml");
        const strDocument = documentxml.asText();
        const contentAsString = strDocument;

        const headerxml = zipContent.file("word/header1.xml");
        const strHeader = headerxml ? headerxml.asText() : "";
        const headerAsString = strHeader;

        const footerxml = zipContent.file("word/footer1.xml");
        const strFooter = footerxml ? footerxml.asText() : "";
        const footerAsString = strFooter;

        const docxtemplater = new window.docxtemplater();
        docxtemplater.loadZip(zipContent);

        const oldHeader = headerAsString;
        let newHeader = oldHeader;

        data.header.forEach((item) => {
          newHeader = newHeader.replace(new RegExp(item.eng.replace("(", "\\(").replace(")", "\\)"), "g"), item.rus);
        });

        const oldContent = contentAsString;
        let newContent = oldContent;

        data.main.forEach((item) => {
          newContent = newContent.replace(new RegExp(item.eng.replace("(", "\\(").replace(")", "\\)"), "g"), item.rus);
        });

        data.basic.forEach((item) => {
          newContent = newContent.replace(new RegExp(item.eng.replace("(", "\\(").replace(")", "\\)"), "g"), item.rus);
        });

        const oldFooter = footerAsString;
        let newFooter = oldFooter;

        data.footer.forEach((item) => {
          newFooter = newFooter.replace(new RegExp(item.eng.replace("(", "\\(").replace(")", "\\)"), "g"), item.rus);
        });

        zipContent.file("word/header1.xml", newHeader);
        zipContent.file("word/document.xml", newContent);
        zipContent.file("word/footer1.xml", newFooter);

        docxtemplater.loadZip(zipContent);

        const out = docxtemplater.getZip().generate({
          type: "blob",
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        saveAs(
          out,
          file.name
            .split(".")
            .map(function (item, idx, arr) {
              return idx === arr.length - 2 ? item + "-rus" : item;
            })
            .join(".")
        );

        if (index === files.length - 1) {
          onLastFileLoaded();
        }

        if (index < files.length - 1) {
          loader.setFileName(files[index + 1]);
          loader.setStage(index);
        }

        readFile(index + 1);
      };

      //reader.readAsArrayBuffer(file);
      reader.readAsBinaryString(file);
    }
  }

  readFile(0);
}

////READ INPUT FILES
const readUrl = (input) => {
  if (input.files && input.files[0]) {
    readmultifiles(input, input.files);
  }
};

///FILE CHANGE HANDLER
const onFileChange = (e) => {
  readUrl(e.currentTarget);
};

////FILE DROP HANDLER
function handleDrop(e) {
  let dt = e.dataTransfer;
  let files = dt.files;

  const target = e.currentTarget;
  const input = target.querySelector("input");

  if (input.files && input.files[0]) {
    input.value = "";

    if (!/safari/i.test(navigator.userAgent)) {
      input.type = "";
      input.type = "file";
    }
  }

  input.files = files;
  readUrl(input);
}

////CLEAR ALL FIELDS HANDLER
function onFileClear(e) {
  const $input = $(".upload__label input");

  $input[0].value = "";

  if (!/safari/i.test(navigator.userAgent)) {
    $input[0].type = "";
    $input[0].type = "file";
  }
}

////ALL EVENT LISTENERS
function addEventListeners($inputLabel, $result) {
  const input = $inputLabel.children("input")[0];
  const inputLabel = $inputLabel[0];
  //const fileClearBtn = $result.find(".upload__close")[0];

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    inputLabel.addEventListener(eventName, dropdownEvents.prevent, false);
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    inputLabel.addEventListener(eventName, dropdownEvents.highlight, false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    inputLabel.addEventListener(eventName, dropdownEvents.unhighlight, false);
  });

  inputLabel.addEventListener("drop", handleDrop, false);
  input.addEventListener("change", onFileChange);
  //fileClearBtn.addEventListener("click", onFileClear);
}

////ADD EVENT LISTENERS
uploads.forEach(function (upload) {
  const $inputLabel = $(upload).find(".upload__label");
  const $result = $(upload).find(".upload__result");

  if (!$(upload).hasClass("disabled")) {
    addEventListeners($inputLabel, $result);
  }
});
