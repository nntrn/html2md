var escapes = [
  [/\\/g, "\\"],
  [/\*/g, "*"],
  [/^-/g, "-"],
  [/^\+ /g, "+ "],
  [/^(=+)/g, "$1"],
  [/^(#{1,6}) /g, "$1"],
  [/`/g, "`"],
  [/^~~~/g, "~~~"],
  [/\[/g, "\\["],
  [/\]/g, "\\]"],
  [/^>/g, ">"],
  [/_/g, "_"],
  [/^(\d+)\. /g, "$1. "]
]

TurndownService.prototype.escape = function (string) {
  return escapes.reduce(function (accumulator, escape) {
    return accumulator.replace(escape[0], escape[1])
  }, string)
}

const turndownService = new TurndownService({
  headingStyle: "atx",
  hr: "---",
  bulletListMarker: "*",
  codeBlockStyle: "fenced",
  fence: "```",
  emDelimiter: "*",
  strongDelimiter: "**",
  bulletSpaceSize: 1
})

turndownService.use(turndownPluginGfm.gfm)
turndownService.remove("noscript")
turndownService.remove("style")
turndownService.remove("script")

turndownService.addRule("key", {
  filter: ["kbd"],
  replacement: (content) => "`" + content.toUpperCase() + "`"
})

turndownService.addRule("tableHeaderCell", {
  filter: (node) => node.nodeName === "TH" && !node.previousElementSibling,
  replacement: (content, node) => "| " + content.replace(/\n/g, "") + " | "
})

turndownService.addRule("link", {
  filter: (node) => node.nodeName === "A",
  replacement: (content, node) => `[${node.textContent.trim()}](${node.href})`
})

turndownService.addRule("tableHeaderStart", {
  filter: (node) => node.nodeName === "TH" &&
    node.previousElementSibling &&
    node.previousElementSibling.nodeName === "TH",
  replacement: (content, node) => content.replace(/\n/g, "") + " | "
})

turndownService.addRule("indentedCodeBlock", {
  filter: (node) => node.nodeName === "PRE" &&
    node.parentElement.className.indexOf("highlight") < 0,
  replacement: (content, node) => ["```", content.trim(), "```", ""].join("\n")
})

turndownService.addRule("listItem", {
  filter: 'li',
  replacement: function (content, node, options) {
    var prefix = options.bulletListMarker + ' '.repeat(options.bulletSpaceSize)
    var parent = node.parentNode
    if (parent.nodeName === 'OL') {
      var start = parent.getAttribute('start')
      var index = Array.prototype.indexOf.call(parent.children, node)
      prefix = (start ? Number(start) + index : index + 1) + '.' + ' '.repeat(options.bulletSpaceSize)
    }
    const spacePrefix = ' '.repeat(options.bulletListMarker.length + options.bulletSpaceSize)

    content = content
      .split(/[\r\n]+/)
      .filter(e => e.trim().length)
      .map((e, i) => i == 0 ? e : spacePrefix + e)
      .map(e => e.replace(/[\s\t]+$/g, ''))
      .join("\n")
    return (
      prefix + content + (node.nextSibling ? '\n\n' : '')
    )
  }
})

function removeAttributes(el) {
  const WHITELIST_ATTR = ["href", "id", "src", "name", "colspan", "type"]
  el.getAttributeNames()
    .filter((e) => !WHITELIST_ATTR.includes(e))
    .forEach((e) => el.removeAttribute(e))
}

function cleanContentEditable(dom) {
  Array.from(dom.querySelectorAll("*"))
    .filter((e) => !e.textContent.trim().length)
    .forEach((e) => { e.textContent = "" })
  Array.from(dom.querySelectorAll("*:not(code,pre)"))
    .forEach((el) => removeAttributes(el))
  return dom.innerHTML
    .split("\n")
    .filter((f) => f.trim().length)
    .join("\n")
}

function clipboardToMarkdown() {
  const _clipboard = document.querySelector("#input")

  if (_clipboard.textContent.trim().length) {
    const htmlcode = cleanContentEditable(_clipboard)
    document.querySelector("#htmlcode").value = htmlcode

    const markdown = turndownService.turndown(htmlcode)

    document.querySelector("#output").value = markdown
    document.querySelector("#output").focus()
    document.querySelector("textarea").select()
  }
}

window.addEventListener("DOMContentLoaded", (event) => {
  document.addEventListener("keydown", function (event) {
    if (event.ctrlKey || event.metaKey) {
      if (String.fromCharCode(event.which).toLowerCase() === "v") {
        document.querySelector("#input").focus()
      }
    }
  })

  document.getElementById("input").addEventListener(
    "input",
    function () {
      clipboardToMarkdown()
      document.querySelector("#input").innerHTML = ""
    }, false)
})
