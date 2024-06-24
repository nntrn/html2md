const $ = (query) => document.querySelector(query)
const $$ = (query) => Array.from(document.querySelectorAll(query))
const $$$ = (collection) => Array.from(collection)
const $$_ = (element, query) => Array.from(element.querySelectorAll(query))

function escapeHtml(s) {
  var ENTITY_MAP = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;"
  }
  return ("" + s).replace(/[&<>"'/]/g, function (s) {
    return ENTITY_MAP[s]
  })
}

function escapeBrackets(s) {
  var ENTITY_MAP = {
    "<": "&lt;",
    ">": "&gt;",
  }
  return ("" + s).replace(/[<>]/g, function (s) {
    return ENTITY_MAP[s]
  })
}

function removeAttributes(el) {
  const WHITELIST_ATTR = ["href", "class", "id", "src", "name", "colspan", "type"]
  el.getAttributeNames()
    .filter((e) => !WHITELIST_ATTR.includes(e))
    .forEach((f) => el.removeAttribute(f))
}

const hashcode = (str) =>
  str.split("").reduce(function (a, b) {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)

const isPasteEvent = (event) => (event.ctrlKey || event.metaKey) && String.fromCharCode(event.which).toLowerCase() === "v"

const move = (newEl, el) => newEl.appendChild(el)

const singleline = (t) => t //.split(/[\n\t]*/).map((c) => c.trim()).join(" ")

function cleanContentEditable(_dom = $("#pasteclip")) {
  const dom = $("#pasteclip")
  $$_(dom, "svg").forEach((e) => e.remove())

  Array.from(dom.querySelectorAll('a'))
    .forEach((e) => { e.textContent = escapeBrackets(e.textContent) })

  $$_(dom, "*")
    .filter((e) => !e.textContent.trim().length)
    .forEach((e) => e.remove())

  $$_(dom, "*").forEach((el) => removeAttributes(el))

  return dom.innerHTML
    .split("\n")
    .filter((f) => f.trim().length)
    .join("\n")
    .trim()
  // .replace(/><(pre|h1|h2|h3|h4|ul|li|table|div)/gi, ">\n<$1")
  // .replace(/><\/(ul|table|tr|ol|footer|section|main)>/gi, ">\n</$1>")
  // .replace(/<\/(h2|h1|h3|h4|footer|main|ul|ol)></gi, "</$1>\n<")
}

function convertHtml2Markdown(_html) {
  $("#markcode").value = getTurndownService().turndown(_html)
  // .replace(/[\u0300-\u036f]/g, "")
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
  if ((isPasteEvent(event) && !checkElemFocus("#htmlcode")) || (checkElemFocus("#htmlcode") && $("[data-media=mobile]"))) {
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
