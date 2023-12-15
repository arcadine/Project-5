const confirmation = (new URL(document.location).searchParams).get("confirmationNumber");

//populate confirmation number section
function populateConfirmationNumber() {
    const orderIdSpan = document.getElementById('orderId');
    orderIdSpan.innerHTML = confirmation;
}

populateConfirmationNumber();