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
  for (var key in rules) service.addRule(key, rules[key])
  return service
}

function removeAttributes(el) {
  const WHITELIST_ATTR = ["href", "class", "id", "src", "name", "colspan", "type"]
  el.getAttributeNames()
    .filter((e) => !WHITELIST_ATTR.includes(e))
    .forEach((e) => el.removeAttribute(e))
}

const move = (newEl, el) => newEl.appendChild(el)

function cleanContentEditable(_dom = $("#pasteclip")) {
  if (typeof _dom === "string") {
    $("#pasteclip").innerHTML = _dom
  }
  const dom = $("#pasteclip")
  $$_(dom, "*")
    .filter((e) => !e.textContent.trim().length)
    .forEach((e) => (e.textContent = ""))

  $$_(dom, "table")
    .filter((e) => !e.querySelector("th"))
    .forEach((table) => {
      const tr = document.createElement("tr")
      $$$(table.querySelector("tr").children).forEach((c, i) => {
        tr.appendChild(Object.assign(document.createElement("th"), { textContent: "Col " + i }))
      })
      table.prepend(tr)
    })

  $$_(dom, "table > tbody > tr").forEach((row) => move(row.closest("table"), row))
  $$_(dom, ":empty").forEach((e) => e.remove())
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

function pasteEvent() {
  if (isPasteEvent(event)) {
    if (!checkElemFocus("#htmlcode")) {
      $("#pasteclip").innerHTML = ""
      $("#pasteclip").style.zIndex = 1000
      $("#pasteclip").focus()
      setTimeout(clipboardToMarkdown, 0)
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("keydown", pasteEvent, false)

  document.querySelector("#htmlcode").addEventListener("blur", function () {
    const hash = "" + hashcode($("#htmlcode").value)
    if ($("#markcode").dataset.hc !== hash) {
      $("#markcode").dataset.hc = hash
      convertHtml2Markdown($("#htmlcode").value)
    }
  })
})
