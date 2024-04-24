const $ = (query) => document.querySelector(query)
const $$ = (query) => Array.from(document.querySelectorAll(query))
const $$$ = (collection) => Array.from(collection)
const $$_ = (element, query) => Array.from(element.querySelectorAll(query))

var escapes = [
  [/\\/g, "\\"],
  [/\*/g, "*"],
  [/^-/g, "-"],
  [/^\+ /g, "+ "],
  [/^(=+)/g, "$1"],
  [/^(#{1,6}) /g, "$1"],
  [/`/g, "`"],
  [/^~~~/g, "~~~"],
  [/^>/g, ">"],
  [/_/g, "_"],
  [/^(\d+)\. /g, "$1. "]
]

const hashcode = (str) =>
  str.split("").reduce(function (a, b) {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)

const isPasteEvent = (event) => (event.ctrlKey || event.metaKey) && String.fromCharCode(event.which).toLowerCase() === "v"

TurndownService.prototype.escape = function (string) {
  return escapes.reduce(function (accumulator, escape) {
    return accumulator.replace(escape[0], escape[1])
  }, string)
}

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
  service.remove("noscript")
  service.remove("style")
  service.remove("script")

  for (var key in rules) {
    service.addRule(key, rules[key])
  }
  // console.log(service)
  return service
}

function removeAttributes(el) {
  const WHITELIST_ATTR = ["href", "class", "id", "src", "name", "colspan", "type"]
  el.getAttributeNames()
    .filter((e) => !WHITELIST_ATTR.includes(e))
    .forEach((e) => el.removeAttribute(e))
}

const move = (newEl, el) => newEl.appendChild(el)

const singleline = (t) => t.split(/[\n\t]*/).map((c) => c.trim()).join(" ")

function cleanContentEditable(_dom = $("#pasteclip")) {
  if (!$('#pasteclip').textContent.trim().length) {
    $("#pasteclip").innerHTML = $('#htmlcode').value
  }
  const dom = $("#pasteclip")

  $$_(dom, "* ~ *").forEach((e) => {
    if (e.parentElement && singleline(e.parentElement.textContent) === singleline(e.textContent)) {
      const ih = e.outerHTML
      e.parentElement.outerHTML = ih
    }
  })

  $$_(dom, "*")
    .filter((e) => !e.textContent.trim().length)
    .forEach((e) => (e.textContent = ""))
  $$_(dom, "*").forEach((el) => removeAttributes(el))

  return dom.innerHTML
    .split("\n")
    .filter((f) => f.trim().length)
    .join("\n")
    .trim()
}

function convertHtml2Markdown(_html) {
  $("#markcode").value = getTurndownService().turndown(_html)
  $("#pasteclip").style.zIndex = -1
}

function clipboardToMarkdown() {
  if ($("#pasteclip").textContent.trim().length) {
    const html = cleanContentEditable()
    $("#htmlcode").value = html
    convertHtml2Markdown(html)
    $("#pasteclip").innerHTML = ""
  }
}

function checkElemFocus(query) {
  if ($(query) === document.activeElement) {
    return true
  }
  return false
}

function focusPasteElement() {
  $("#pasteclip").innerHTML = ""
  $("#pasteclip").style.zIndex = 1000
  $("#pasteclip").focus()
}

function pasteEvent(event) {
  if (
    (isPasteEvent(event) && !checkElemFocus("#htmlcode")) ||
    (checkElemFocus("#htmlcode") && $("[data-media=mobile]"))
  ) {
    focusPasteElement()
    setTimeout(clipboardToMarkdown, 0)
  }
}

function isMobile() {
  try {
    document.createEvent("TouchEvent")
    return true
  } catch (e) {
    return false
  }
}

window.addEventListener("DOMContentLoaded", () => {
  $("body").dataset.media = "desktop"
  if (isMobile()) $("body").dataset.media = "mobile"

  document.addEventListener("keydown", pasteEvent, false)
  document.addEventListener("paste", pasteEvent, false)

  document.querySelector("#htmlcode").addEventListener("blur", function () {
    const hash = "" + hashcode($("#htmlcode").value)
    if ($("#markcode").dataset.hc !== hash) {
      $("#markcode").dataset.hc = hash
      convertHtml2Markdown($("#htmlcode").value)
    }
  })
})
