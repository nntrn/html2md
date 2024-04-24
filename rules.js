var indexOf = Array.prototype.indexOf
var every = Array.prototype.every

function cell(content, node) {
  var index = indexOf.call(node.parentNode.childNodes, node)
  var prefix = " "
  if (index === 0) prefix = "| "
  return prefix + content + " |"
}

function isFirstTbody(element) {
  var previousSibling = element.previousSibling
  return element.nodeName === "TBODY" && (!previousSibling || (previousSibling.nodeName === "THEAD" && /^\s*$/i.test(previousSibling.textContent)))
}

function isHeadingRow(tr) {
  var parentNode = tr.parentNode
  return (
    parentNode.nodeName === "THEAD" ||
    (parentNode.firstChild === tr &&
      (parentNode.nodeName === "TABLE" || isFirstTbody(parentNode)) &&
      every.call(tr.childNodes, function (n) {
        return n.nodeName === "TH"
      }))
  )
}

const rules = {}

rules.key = {
  filter: ["kbd"],
  replacement: (content) => "`" + content.toUpperCase() + "`"
}

rules.code = {
  filter: ["code"],
  replacement: (content, node) => (node.parentElement.nodeName === "PRE" ? content : `\`${content}\``)
}

rules.tableHeaderCell = {
  filter: (node) => node.nodeName === "TH" && !node.previousElementSibling,
  replacement: (content, node) => "| " + content.replace(/\n/g, "") + " | "
}

rules.link = {
  filter: (node) => node.nodeName === "A",
  replacement: (content, node) => `[${node.textContent.trim() || content.toString()}](${node.href})`
}

rules.tableHeaderStart = {
  filter: (node) => node.nodeName === "TH" && node.previousElementSibling && node.previousElementSibling.nodeName === "TH",
  replacement: (content, node) => content.replace(/\n/g, "") + " | "
}

rules.listItem = {
  filter: "li",
  replacement: function (content, node, options) {
    var prefix = options.bulletListMarker + " ".repeat(options.bulletSpaceSize)
    var parent = node.parentNode
    if (parent.nodeName === "OL") {
      var start = parent.getAttribute("start")
      var index = Array.prototype.indexOf.call(parent.children, node)
      prefix = (start ? Number(start) + index : index + 1) + "." + " ".repeat(options.bulletSpaceSize)
    }
    const spacePrefix = " ".repeat(options.bulletListMarker.length + options.bulletSpaceSize)

    content = content
      .split(/[\r\n]+/)
      .filter((e) => e.trim().length)
      .map((e, i) => (i == 0 ? e : spacePrefix + e))
      .map((e) => e.replace(/[\s\t]+$/g, ""))
      .join("\n")
    return prefix + content + (node.nextSibling ? "\n\n" : "")
  }
}

rules.tableCell = {
  filter: ["th", "td"],
  replacement: function (content, node) {
    return cell(content, node)
  }
}

rules.tableRow = {
  filter: "tr",
  replacement: function (content, node) {
    var borderCells = ""
    var alignMap = { left: ":--", right: "--:", center: ":-:" }

    if (isHeadingRow(node)) {
      for (var i = 0; i < node.childNodes.length; i++) {
        var border = ":--"
        var align = (node.childNodes[i].getAttribute("align") || "").toLowerCase()

        if (align) border = alignMap[align] || ":--"

        borderCells += cell(
          border.replace(/[-]+/, () => "-".repeat(Math.max(3, node.childNodes[i].textContent.length - 1))),
          node.childNodes[i]
        )
      }
    }
    return "\n" + content + (borderCells ? "\n" + borderCells : "")
  }
}

rules.table = {
  filter: function (node) {
    return node.nodeName === "TABLE" && isHeadingRow(node.rows[0])
  },

  replacement: function (content, node) {
    return content.replace(/[\\n]{2,}/g, "\n")
  }
}

rules.tableSection = {
  filter: ["thead", "tbody", "tfoot"],
  replacement: function (content) {
    return content
  }
}
