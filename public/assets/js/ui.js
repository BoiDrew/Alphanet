/* Toast Notification */

export function toast(message) {

const t =
document.getElementById(
"toast"
);

if (!t) {

console.warn(
"Toast element missing"
);

return;

}

t.textContent = message;

t.classList.add("show");

setTimeout(() => {

t.classList.remove(
"show"
);

}, 2500);

}