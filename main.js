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
  for (var key in rules) service.addRule(key, rules[key]);
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
  Array.from(dom.querySelectorAll("*:not(code,pre,div>pre)")).forEach((el) => removeAttributes(el))
  return dom.innerHTML
    .split("\n")
    .filter((f) => f.trim().length)
    .join("\n")
}

function showHTMLTextarea() {
  if (document.querySelector("#showhtml").checked) {
    return true
  }
  return false
}

function convertHtml2Markdown() {
  const htmlcode = document.querySelector("#htmlcode").value
  document.querySelector("#markcode").value = getTurndownService().turndown(htmlcode)
  document.querySelector("#markcode").focus()
}

function clipboardToMarkdown() {
  const _clipboard = document.querySelector("#pasteclip")
  if (_clipboard.textContent.trim().length) {
    const htmlcode = cleanContentEditable(_clipboard)
    document.querySelector("#htmlcode").value = htmlcode
    convertHtml2Markdown()
  }
}

window.addEventListener("DOMContentLoaded", (event) => {

  document.addEventListener("keydown", function (event) {
    if (!showHTMLTextarea()) {
      if ((event.ctrlKey || event.metaKey) && String.fromCharCode(event.which).toLowerCase() === "v") {
        document.querySelector("#pasteclip").focus()
      }
    }
  }, false)

  document.getElementById("showhtml").addEventListener("click", function (event) {
    if (!event.target.checked) {
      convertHtml2Markdown()
    }
  }, false)

  document.getElementById("pasteclip").addEventListener("input", function () {
    clipboardToMarkdown()
    document.querySelector("#pasteclip").innerHTML = ""
  }, false)

})
