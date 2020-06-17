import { getCaretCoordinates } from './caret-pos.js'

const state = {
    isPopupOpened: false,
    withKey: true, // show popup only if key is pressed
    isKeyPressed: false,
    key: 'Alt',
}

function popup({ top = 0, left = 0, content }) {
    state.isPopupOpened = true
    const popupElement = document.createElement('div')
    popupElement.id = 'popup-translate-element'
    document.body.appendChild(popupElement)
    const style = {
        position: 'absolute',
        borderRadius: '6px',
        padding: '1rem',
        backgroundColor: '#f1f1f1',
        border: '1px solid #bababa',
        height: '100px',
        width: '80px',
        top: `${top}px`,
        left: `${left}px`,
    }
    Object.assign(popupElement.style, style)
    popupElement.innerHTML = `<b>${content}</b><br/><a href="">some link</a>`
    function removePopup() {
        document.body.removeChild(popupElement)
        document.removeEventListener('mousedown', hidePopupMouse)
        document.removeEventListener('keydown', hidePopupKeyDown)
        setTimeout(() => {
            state.isPopupOpened = false
        }, 200)
    }

    function hidePopupMouse(e) {
        if (!e.target.closest('#popup-translate-element')) {
            removePopup()
        }
    }

    function hidePopupKeyDown(e) {
        if (e.key === 'Escape' || e.key === state.key || e.key === 'Shift') {
            removePopup()
            // e.stopPropagation()
        }
    }

    setTimeout(() => {
        document.addEventListener('mousedown', hidePopupMouse)
        document.addEventListener('keydown', hidePopupKeyDown)
    }, 10)
}

function selection(target) {
    if (state.isPopupOpened) return
    let selection
    let coords = { top: 0, left: 0 }
    if (['TEXTAREA', 'INPUT'].includes(target.nodeName)) {
        // FIREFOX BUG: https://bugzilla.mozilla.org/show_bug.cgi?id=85686
        selection = target.value.substring(
            target.selectionStart,
            target.selectionEnd,
        )
        const caret = getCaretCoordinates(target, target.selectionEnd)
        coords.top = target.offsetTop - target.scrollTop + caret.top
        coords.left = target.offsetLeft - target.scrollLeft + caret.left
    } else {
        const sel = window.getSelection()
        selection = sel.toString()
        const { top, right } = sel.getRangeAt(0).getBoundingClientRect()

        coords.top = top
        coords.left = right
    }
    selection = selection.trim()

    if (selection.length) {
        popup({ content: selection, ...coords })
    }
}

document.body.addEventListener('mouseup', (e) => {
    if (
        (state.withKey && state.isKeyPressed) ||
        (!state.withKey && e.detail <= 2)
    ) {
        setTimeout(() => {
            selection(e.target)
        }, 50)
    }
})

function keydownHandler(e) {
    if (e.key === state.key) {
        state.isKeyPressed = true
        selection(e.target)
    }
}

function keyUpHandler(e) {
    if (e.key === state.key) {
        state.isKeyPressed = false
    }
}
function addKeysHandler() {
    document.body.addEventListener('keydown', keydownHandler)
    document.body.addEventListener('keyup', keyUpHandler)
}

function removeKeysHandler() {
    document.body.removeEventListener('keydown', keydownHandler)
    document.body.removeEventListener('keyup', keyUpHandler)
}

if (state.withKey) {
    addKeysHandler()
}

const withKeyCheck = document.querySelector('#withKey')
withKeyCheck.addEventListener('change', (e) => {
    removeKeysHandler()
    if (e.target.checked) {
        state.withKey = true
        addKeysHandler()
    }
})
