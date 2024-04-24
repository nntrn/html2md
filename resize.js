const handler = $(".handler")
const wrapper = handler.closest(".wrapper")

var isHandlerDragging = false

const getContainerWidth = (offset = 0) => Number(getComputedStyle($(".container")).width.replace(/[a-z]/g, "")) - Number(offset)
const getContainerHeight = (offset = 0) => Number(getComputedStyle($(".container")).height.replace(/[a-z]/g, "")) - Number(offset)

handler.addEventListener("mousedown", function (e) {
  if (e.target === handler) {
    isHandlerDragging = true
    wrapper.dataset.resize = 1
  }
})

document.addEventListener("mousemove", function (e) {
  if (!isHandlerDragging) {
    return false
  }
  if (document.body.offsetWidth > 600) {
    $("#html.box").style.width = e.pageX + "px"
    $("#markdown.box").style.width = `${getContainerWidth(e.pageX)}px`
    $("#html.box").style.height = "100%"
    $("#markdown.box").style.height = "100%"
  } else {
    $("#html.box").style.height = e.pageY + "px"
    $("#markdown.box").style.height = `${getContainerHeight(e.pageY)}px`
    $("#markdown.box").style.width = "100%"
  }
})

document.addEventListener("mouseup", function (e) {
  isHandlerDragging = false
})
