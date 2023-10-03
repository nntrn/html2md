!(function () {
  "use strict"

  const $ = (query) => document.querySelector(query)
  const $$ = (query) => Array.from(document.querySelectorAll(query))

  const conversionMapping = {
    // windows to mac
    ctrl: "cmd",
    control: "command",
    alt: "option",
    delete: "del",
    enter: "return",
    // mac to windows
    cmd: "ctrl",
    command: "control",
    option: "alt",
    del: "delete",
    return: "enter"
  }

  function escapeBrackets(s) {
    return s.replace(/</g, "&lt;").replace(/>/g, "&gt;")
  }
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

  const doConversion = (key) => conversionMapping[key.toLowerCase().trim()]

  function updateKeybind() {
    if (window.navigator.userAgent.indexOf("Mac") > -1) {
      $$('[data-keybind="windows"]').forEach((e) => {
        e.textContent = doConversion(e.innerText)
        e.dataset.keybind = "mac"
      })
    } else {
      $$('[data-keybind="mac"]').forEach((e) => {
        e.textContent = doConversion(e.innerText)
        e.dataset.keybind = "windows"
      })
    }
  }

  const WHITELIST_ATTR = [
    "href",
    "src",
    "name",
    "colspan",
    "type"
  ]

  function removeAttributes(el) {
    el.getAttributeNames()
      .filter((e) => !WHITELIST_ATTR.includes(e))
      .forEach((e) => el.removeAttribute(e))
  }

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

  var turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    emDelimiter: "*"
  })
  var gfm = turndownPluginGfm.gfm
  var tables = turndownPluginGfm.tables
  var strikethrough = turndownPluginGfm.strikethrough

  turndownService.use(gfm)
  turndownService.use(tables)
  turndownService.use(strikethrough)
  turndownService.use([gfm, tables, strikethrough])

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

  turndownService.addRule("list", {
    filter: (node) => node.nodeName === "LI",
    replacement: (content, node) => "* " +
      content.replace(/([\n\s\t]+)$/m, "").replace(/(^[\n\s\t]+)/m, "") +
      "\n"
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

  document.addEventListener("DOMContentLoaded", function () {
    updateKeybind()

    $("textarea").value = ""

    function clipboardToMarkdown() {
      const clipboard = document.querySelector("#clipboard")
      if ($("#clipboard").textContent.trim().length) {
        console.log(clipboard.innerHTML)
        Array.from(clipboard.querySelectorAll("a:empty")).forEach((e) => e.remove())
        Array.from(clipboard.querySelectorAll("*:empty")).forEach((e) => e.remove())
        Array.from(clipboard.querySelectorAll("*")).forEach((el) => removeAttributes(el))

        $("#wrapper").hidden = false
        $("#output").style.height = "0px"
        $("#output").value = turndownService.turndown(clipboard.innerHTML.replace(/&nbsp;/g, " "))

        $("pre#htmlinput").innerHTML = escapeBrackets(clipboard.innerHTML
          .replace(/&nbsp;/g, " ")
          .replace(/<(\/)?(div|ul|blockquote)>/gi, '\n<$1$2>\n')
          .replace(/<(li|p|h1|h2|h3|h4|h5|hr)>/gi, '\n<$1>'))
          .split("\n").filter(e => e.trim().length > 0).join("\n")

        $("#clipboard").innerHTML = ""
        $("textarea#output").focus()
        $("textarea#output").select()
      }
    }

    $("header").addEventListener("touchstart", () => {
      $("#clipboard").focus()
    })

    document.addEventListener("keydown", function (event) {
      if (event.ctrlKey || event.metaKey) {
        if (String.fromCharCode(event.which).toLowerCase() === "v") {
          $("#clipboard").focus()
        }
      }
    })

    $("#clipboard").addEventListener("paste", function () {
      setTimeout(clipboardToMarkdown, 200)
      $("#wrapper").classList.remove("start")
    })
  })
})()
