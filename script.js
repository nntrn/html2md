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

  const WHITELIST_ATTR = ["href", "id", "class", "src", "name", "colspan", "type"]

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
    // replacement: (content, node) =>  `content.replace(/\n/g, "")`
  })

  turndownService.addRule("list", {
    filter: (node) => node.nodeName === "LI",
    replacement: (content, node) => "* " + content.replace(/(\n)+$/m, "") + "\n"
  })

  turndownService.addRule("listNewLineAfter", {
    filter: (node) =>
      node.nodeName === "LI" &&
      node.previousElementSibling &&
      node.previousElementSibling.nodeName === "LI" &&
      node.previousElementSibling.innerText.length > 90,

    replacement: (content, node) => "\n  \n* " + node.textContent.replace(/(\n)+$/m, "") + "\n"
  })

  turndownService.addRule("newlineHeader", {
    filter: (node) => /H[1-6]/.test(node.nodeName),
    replacement: (content, node) =>
      (node.previousElementSibling ? "\n  \n" : "") +
      "#".repeat(Number(node.nodeName.replace("H", ""))) +
      " " +
      content +
      "\n\n"
  })

  turndownService.addRule("tableHeaderStart", {
    filter: (node) =>
      node.nodeName === "TH" &&
      node.previousElementSibling &&
      node.previousElementSibling.nodeName === "TH",
    replacement: (content, node) => content.replace(/\n/g, "") + " | "
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
        $("#output").value = turndownService.turndown(clipboard.innerHTML)
        $("#clipboard").innerHTML = ""
        $("textarea").focus()
        $("textarea").select()
      }
    }

    document.addEventListener("keydown", function (event) {
      if (event.ctrlKey || event.metaKey) {
        if (String.fromCharCode(event.which).toLowerCase() === "v") {
          $("#wrapper").classList.remove("start")
          $("#clipboard").focus()
        }
      }
    })

    $("#clipboard").addEventListener("paste", function () {
      setTimeout(clipboardToMarkdown, 200)
    })
  })
})()