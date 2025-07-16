const $ = (query) => document.querySelector(query)
const $$ = (query) => Array.from(document.querySelectorAll(query))
const $$$ = (collection) => Array.from(collection)
const $$_ = (element, query) => Array.from(element.querySelectorAll(query))

const pasteEl = document.querySelector("#pasteclip")
var screenType = ""

function getTurndownService(options = {}) {
  const service = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "*",
    codeBlockStyle: "fenced",
    fence: "```",
    emDelimiter: "*",
    strongDelimiter: "**",
    bulletSpaceSize: 1,
    ...options
  })

  service.use(turndownPluginGfm.gfm)

  return service
}

function escapeBrackets(s) {
  var ENTITY_MAP = {
    "<": "&lt;",
    ">": "&gt;"
  }
  return ("" + s).replace(/[<>]/g, function (s) {
    return ENTITY_MAP[s]
  })
}

function removeAttributes(el) {
  const WHITELIST_ATTR = ["href", "src", "name", "colspan", "type"]
  el.getAttributeNames()
    .filter((e) => !WHITELIST_ATTR.includes(e))
    .forEach((f) => el.removeAttribute(f))
}

const isPasteEvent = (event) => (event.ctrlKey || event.metaKey) && String.fromCharCode(event.which).toLowerCase() === "v"

function cleanContentEditable(dom = pasteEl) {
  Array.from(dom.querySelectorAll("*")).forEach((e) => {
    if (e.tagName === "A") {
      e.textContent = escapeBrackets(e.textContent.trim())
    } else if (e.tagName === "SVG") {
      e.remove()
    } else if (e.innerText == "") {
      e.remove()
    }
    removeAttributes(e)
  })

  return dom.innerHTML
}

function getFormOptions() {
  return Array.from($("form"))
    .map((e) => ({ [e.id]: e.value }))
    .reduce((a, b) => Object.assign(a, b), {})
}

function convertHtml2Markdown(_html) {
  $("#markcode").value = getTurndownService(getFormOptions()).turndown(_html)
  pasteEl.style.zIndex = -1
  pasteEl.classList.add("hide")
}

function clipboardToMarkdown() {
  if (pasteEl.textContent.trim().length) {
    const html = cleanContentEditable()
    $("#htmlcode").value = html
    convertHtml2Markdown(html)
  }
}

function checkElemFocus(query) {
  if ($(query) === document.activeElement) {
    return true
  }
  return false
}

function focusPasteElement() {
  pasteEl.innerHTML = ""
  pasteEl.style.zIndex = 1000
  pasteEl.focus()
}

function pasteEvent(event) {
  if ((isPasteEvent(event) && !checkElemFocus("#htmlcode")) || (checkElemFocus("#htmlcode") && $("[data-media=mobile]"))) {
    focusPasteElement()
    setTimeout(clipboardToMarkdown, 0)
  }
}

function isMobile() {
  if (window.screenType == "mobile") {
    return true
  } else {
  }
}

function fallbackCopyTextToClipboard(text) {
  var textArea = Object.assign(document.createElement("textarea"), {
    style: { top: 0, left: 0, position: "fixed" },
    value: text
  })
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  try {
    document.execCommand("copy")
  } catch (err) {
    console.log(err)
  }
  document.body.removeChild(textArea)
}

function changeWrap(e) {
  const target = document.querySelector(e.target.dataset.styleTarget)
  // target.style.whiteSpace = e.target.value
  target.style.setProperty("--white-space", e.target.value)
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text)
    return
  }
  navigator.clipboard.writeText(text).then(
    () => console.log("Async: Copying to clipboard was successful!"),
    (err) => console.error("Async: Could not copy text: ", err)
  )
}

function formatWhiteSpace(e) {
  e.closest(".parent").style.setProperty("--whitespace", e.value)
}

function copyToClip(id) {
  copyTextToClipboard(document.querySelector(id).value)
}


function turndownHtml() {
  convertHtml2Markdown($("#htmlcode").value)
}

window.addEventListener("DOMContentLoaded", () => {
  $("body").dataset.media = "desktop"
  if (isMobile()) $("body").dataset.media = "mobile"

  document.addEventListener("keydown", pasteEvent, false)
  document.addEventListener("paste", pasteEvent, false)

  $("#htmlcode").addEventListener("blur", function () {
    convertHtml2Markdown($("#htmlcode").value)
  })

})
