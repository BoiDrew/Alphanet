const STORAGE_KEY =
"cleaning_requests_v2";

/* Load */

export function loadRequests() {

try {

const data =
localStorage.getItem(
STORAGE_KEY
);

return data
? JSON.parse(data)
: [];

}

catch (e) {

console.error(
"Load failed:",
e
);

return [];

}

}

/* Save */

export function saveRequests(
requests
) {

try {

localStorage.setItem(

STORAGE_KEY,

JSON.stringify(
requests
)

);

}

catch (e) {

console.error(
"Save failed:",
e
);

}

}