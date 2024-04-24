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
    $("#A").style.width = e.pageX + "px"
    $("#B").style.width = `${getContainerWidth(e.pageX)}px`
    $("#A").style.height = "100%"
    $("#B").style.height = "100%"
  } else {
    $("#A").style.height = e.pageY + "px"
    $("#B").style.height = `${getContainerHeight(e.pageY)}px`
    $("#B").style.width = "100%"
  }
})

document.addEventListener("mouseup", function (e) {
  isHandlerDragging = false
})
