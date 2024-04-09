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
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);

const isPasteEvent = (event) => (event.ctrlKey || event.metaKey) &&
  String.fromCharCode(event.which).toLowerCase() === "v"

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
  // service.use(turndownPluginGfm.tables)
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

function cleanContentEditable(dom) {
  Array.from(dom.querySelectorAll("*"))
    .filter((e) => !e.textContent.trim().length)
    .forEach((e) => {
      e.textContent = ""
    })
  Array.from(dom.querySelectorAll(":empty")).forEach((e) => e.remove())
  Array.from(dom.querySelectorAll("*")).forEach((el) => removeAttributes(el))

  return dom.innerHTML
    .split("\n")
    .filter((f) => f.trim().length)
    .join("\n")
}

function convertHtml2Markdown(_html = document.querySelector("#htmlcode").value) {
  document.querySelector("#markcode").value =
    getTurndownService().turndown(_html)
}

function clipboardToMarkdown() {
  const clipboard = document.querySelector("#pasteclip")
  if (clipboard.textContent.trim().length) {
    const html = cleanContentEditable(clipboard)
    document.querySelector("#htmlcode").value = html
    convertHtml2Markdown(html)
    document.querySelector("#pasteclip").innerHTML = ""
    document.querySelector("#markcode").focus()
  }
}

function checkElemFocus(query) {
  if (document.querySelector(query) === document.activeElement) {
    return true
  }
  return false
}

window.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("keydown", function (event) {
    if (isPasteEvent(event)) {
      if (!checkElemFocus("#htmlcode")) {
        document.querySelector("#pasteclip").focus()
        setTimeout(clipboardToMarkdown, 0)
      } else {
        setTimeout(convertHtml2Markdown, 300)
      }
    }
  }, false)

  document.querySelector("#htmlcode").addEventListener("blur", function () {
    const hash = "" + hashcode(document.querySelector("#htmlcode").value)
    if (document.querySelector("#markcode").dataset.hc !== hash) {
      document.querySelector("#markcode").dataset.hc = hash
      convertHtml2Markdown()
      console.log(hash)
    } else {
      console.log("no action")
    }
  })
})
