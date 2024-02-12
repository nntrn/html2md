function removeAttributes(el) {
  const WHITELIST_ATTR = ["href", "id", "src", "name", "colspan", "type"]
  el.getAttributeNames()
    .filter((e) => !WHITELIST_ATTR.includes(e))
    .forEach((e) => el.removeAttribute(e))
}

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  emDelimiter: "*"
})

turndownService.use(turndownPluginGfm.gfm)
turndownService.remove('noscript');
turndownService.remove('style');
turndownService.remove('script');

turndownService.addRule("key", {
  filter: ["kbd"],
  replacement: (content) => "`" + content.toUpperCase() + "`"
})
//
// turndownService.addRule("tableHeaderCell", {
//   filter: (node) => node.nodeName === "TH" && !node.previousElementSibling,
//   replacement: (content, node) => "| " + content.replace(/\n/g, "") + " | "
// })
//
// turndownService.addRule("link", {
//   filter: (node) => node.nodeName === "A",
//   replacement: (content, node) => `[${node.textContent.trim()}](${node.href})`
// })
//
// turndownService.addRule("list", {
//   filter: (node) => node.nodeName === "LI",
//   replacement: (content, node) =>
//     "* " + content.replace(/([\n\s\t]+)$/m, "").replace(/(^[\n\s\t]+)/m, "") + "\n"
// })
//
// turndownService.addRule("tableHeaderStart", {
//   filter: (node) =>
//     node.nodeName === "TH" &&
//     node.previousElementSibling &&
//     node.previousElementSibling.nodeName === "TH",
//   replacement: (content, node) => content.replace(/\n/g, "") + " | "
// })
//
// turndownService.addRule("indentedCodeBlock", {
//   filter: (node) =>
//     node.nodeName === "PRE" && node.parentElement.className.indexOf("highlight") < 0,
//   replacement: (content, node) => ["```", content.trim(), "```", ""].join("\n")
// })

function clipboardToMarkdown() {
  const _clipboard = document.querySelector("#input")

  if (_clipboard.textContent.trim().length) {
    Array.from(_clipboard.querySelectorAll("*")).filter(e => !e.textContent.trim().length).forEach(e => { e.textContent = "" })
    Array.from(_clipboard.querySelectorAll("*:not(code,pre)")).forEach((el) => removeAttributes(el))

    const inputHtml = _clipboard.innerHTML.split("\n").filter(f => f.trim().length).join("\n")
    document.querySelector("#inputhtml").value = inputHtml
    document.querySelector("#inputhtml").rows = inputHtml.split("\n").length
    const markdown = turndownService.turndown(inputHtml)

    document.querySelector("#output").value = markdown
    document.querySelector("#output").rows = markdown.split("\n").length + 3
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

  document.getElementById("input").addEventListener("input", function () {
    clipboardToMarkdown()
    document.querySelector("#input").innerHTML = ""
  }, false);
})