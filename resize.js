var handler = document.querySelector('.handler');
var wrapper = handler.closest('.wrapper');
var boxA = document.querySelector('#A');
var isHandlerDragging = false;

handler.addEventListener('mousedown', function (e) {
  if (e.target === handler) {
    isHandlerDragging = true;
    wrapper.dataset.resize = 1
    wrapper.offsetWidth
  }
});

document.addEventListener('mousemove', function (e) {
  if (!isHandlerDragging) {
    return false;
  }
  if (document.body.offsetWidth > 600) {
    boxA.style.minWidth = e.pageX + 'px'
  } else {
    boxA.style.minWidth = 'unset'
    boxA.style.height = (e.pageY - document.querySelector('header').clientHeight) + 'px'
    boxA.style.maxHeight = (e.pageY - document.querySelector('header').clientHeight) + 'px'
  }
});

document.addEventListener('mouseup', function (e) {
  isHandlerDragging = false;
});