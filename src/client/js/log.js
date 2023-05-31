let logElm
waitForElm('#log').then((elm) => {logElm = elm})

function addLog(msg) {
   const date = new Date()
   const spanEl = document.createElement('span')
   spanEl.style.display = 'block'
   spanEl.innerText = `log ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}:${date.getSeconds().toString().padStart(2,'0')} - ${msg}`
   logElm.appendChild(spanEl)
}