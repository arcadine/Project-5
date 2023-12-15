//get cart items from local storage
function getCartFromLocalStorage() 
{
    //get cart from local storage
    const cartString = localStorage.getItem('cart');
    if(!cartString)
    {
        throw new Error('No cart in local memory.');
    }

    //parse cart string into an array
    const cartArray = JSON.parse(cartString);
    console.log(cartArray);

    return cartArray;
}
  
//save cart items to local storage
function saveCartToLocalStorage(cart) 
{
    localStorage.setItem('cart', JSON.stringify(cart||[]));
}

//fetch product information by ID from the API
function fetchProductInfo(productId) 
{
    return fetch('http://localhost:3000/api/products/' + productId)
            .then(function(response) {
                if (response.ok) 
                {
                    return response.json();
                } 
                else 
                {
                    throw new Error('Product request failed');
                }
            })
            .catch(error => console.error(error));
}

//fetch product information for all items in the cart concurrently
function fetchAllProductInfo(cart) 
{
    const promises = cart.map(function(item) {
      return fetchProductInfo(item._id);
    });
  
    return Promise.all(promises);
}
  
//render cart items on the page
function renderCart(cart) 
{
    //get HTML element that has id="cart__items"
    const cartItemsElement = document.getElementById('cart__items');
    if(!cartItemsElement)
    {
        throw new Error('No element with ID cart__items.');
    }

    //populate DOM with items in cart
    for(let i = 0; i < cart.length; i++)
    {
        const cartItem = cart[i];

        //deconstruct cartItem object
        const {color, quantity, _id, price, altTxt, imageUrl, name} = cartItem;

        //add current cart item to DOM
        const cartItemDesc =`<article class="cart__item" data-id="${_id}" data-color="${color}">
                                <div class="cart__item__img">
                                    <img src="${imageUrl}" alt="${altTxt}">
                                </div>
                                <div class="cart__item__content">
                                    <div class="cart__item__content__description">
                                        <h2>${name}</h2>
                                        <p>${color}</p>
                                        <p>€${price}</p>
                                    </div>
                                    <div class="cart__item__content__settings">
                                        <div class="cart__item__content__settings__quantity">
                                            <p>Quantity: </p>
                                            <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${quantity}">
                                        </div>
                                        <div class="cart__item__content__settings__delete">
                                            <p class="deleteItem">Delete</p>
                                        </div>
                                    </div>
                                </div>
                            </article>`
        cartItemsElement.innerHTML += cartItemDesc;
    }
}
  
//update total quantity and total price on the page
function updateTotals(cart) 
{
    //iterate through cart's items and calculate total quantity and price
    const totalQuantity = cart.reduce(function(total, item) {
      return total + parseInt(item.quantity);
    }, 0);
    const totalPrice = cart.reduce(function(total, item) {
      return total + parseInt(item.quantity) * parseInt(item.price);
    }, 0);
  
    //get HTML element that has id="totalQuantity"
    const totalQuantityElement = document.getElementById('totalQuantity');
    if(!totalQuantityElement)
    {
        throw new Error('No element with ID totalQuantity.');
    }

    //get HTML element that has id="totalPrice"
    const totalPriceElement = document.getElementById('totalPrice');
    if(!totalPriceElement)
    {
        throw new Error('No element with ID totalPrice.');
    }

    //add final total quantity and total price values to DOM
    totalQuantityElement.innerHTML = totalQuantity;
    totalPriceElement.innerHTML = totalPrice;
}

//remove item from the cart
function removeItemFromCart(cart, itemId, itemColor) 
{
    //filter out cart item 
    const updatedCart = cart.filter(function(item) {
        return (item._id !== itemId || item.color !== itemColor);
    });
    //save updated cart to local storage and re-render page
    saveCartToLocalStorage(updatedCart);
    initializeCartPage();
    console.log(updatedCart);
}

//change quantity of an item in the cart
function changeItemQuantity(cart, itemId, itemColor, newQuantity)
{
    //maps new item quantity to the cart item matching ID of current item, and returns new updated cart
    const updatedCart = cart.map(function(item) {
      if (item._id === itemId && item.color === itemColor) {
        return {_id: item._id, color: item.color, quantity: newQuantity, name: item.name, price: item.price, altTxt: item.altTxt, imageUrl: item.imageUrl};
      }
      return item;
    });
    //save updated cart to local storage and re-render page
    saveCartToLocalStorage(updatedCart);
    initializeCartPage();
    console.log(updatedCart);
}

//validate form submission
function formValidation(event)
{
    const orderForm = document.getElementsByClassName('cart__order__form')[0];
    
    //prevent the default form submission action
    event.preventDefault();
    event.stopPropagation();

    //get form field values to validate
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const email = document.getElementById('email').value;
    
    //define regular expressions for validation
    const nameRegex = /^[a-zA-Z]+$/; //only letters for first and last name
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //basic email format

    //validate first name
    if (!nameRegex.test(firstName)) 
    {
        document.getElementById('firstNameErrorMsg').textContent = 'Please enter a valid first name.';
        return;
    } 
    else 
    {
        document.getElementById('firstNameErrorMsg').textContent = '';
    }

    //validate last name
    if (!nameRegex.test(lastName)) 
    {
        document.getElementById('lastNameErrorMsg').textContent = 'Please enter a valid last name.';
        return;
    } 
    else 
    {
        document.getElementById('lastNameErrorMsg').textContent = '';
    }

    //validate email
    if (!emailRegex.test(email)) 
    {
        document.getElementById('emailErrorMsg').textContent = 'Please enter a valid email address.';
        return;
    } 
    else 
    {
        document.getElementById('emailErrorMsg').textContent = '';
    }

    //define contact
    //save contact properties to contact object
    const contact = {firstName, lastName, address, city, email};
    
    //define products
    //pull IDs from cart into new products array
    const products = getCartFromLocalStorage().map((item) => item._id);


    //make sure cart is not empty: throw error otherwise

    //post info to server
    fetch('http://localhost:3000/api/products/order', 
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
            body: JSON.stringify({contact, products})
        }
    )
    .then(
        function(response) {
            if (response.ok) 
            {
                return response.json();
            } 
            else 
            {
                throw new Error('Order not sent');
            }
        }
    )
    .then(
        function(data) {
            const confirmationNumber = data.orderId;
            window.location.href = 'confirmation.html?confirmationNumber=' + confirmationNumber;
        }
    )
    .catch(
        error => alert('There was an error while sending the order', error)
    )

}

//initialize cart page on page load
function initializeCartPage() 
{
    //clear contents of cart items section
    const section = document.getElementById('cart__items');
    section.innerHTML = '';

    const cart = getCartFromLocalStorage();
  
    //fetch product information for all items in the cart
    fetchAllProductInfo(cart)
    .then(function (productInfoArray) {
        //merge product information into the cart items
        cart.forEach(function (item, index) {
            item.name = productInfoArray[index].name;
            item.price = productInfoArray[index].price;
            item.altTxt = productInfoArray[index].altTxt;
            item.imageUrl = productInfoArray[index].imageUrl;
        });

        //render cart and totals in DOM
        renderCart(cart);
        updateTotals(cart);

        //add event listeners for delete and change item quantity buttons
        const deleteButtons = document.querySelectorAll('.deleteItem');
        const quantityInputs = document.querySelectorAll('.itemQuantity');    

        //iterate over each delete button and attach an event listener
        deleteButtons.forEach(function (deleteButton) {
            deleteButton.addEventListener('click', function () {
                //retrieve the item ID and color from the data-id and data-color attributes of the parent article
                const itemIdToDelete = deleteButton.closest('.cart__item').dataset.id;
                const itemColor = deleteButton.closest('.cart__item').dataset.color;
                removeItemFromCart(cart, itemIdToDelete, itemColor);
            });
        });

        //iterate over each quantity input and attach an event listener
        quantityInputs.forEach(function (quantityInput) {
            quantityInput.addEventListener('change', function (event) {
                //retrieve the item ID and color from the data-id and data-color attributes of the parent article
                const itemIdToChange = quantityInput.closest('.cart__item').dataset.id;
                const itemColor = quantityInput.closest('.cart__item').dataset.color;
                changeItemQuantity(cart, itemIdToChange, itemColor, event.target.value);
            });
        });
    })
    .catch(function (error) {
        console.error('Error fetching product information:', error);
    });

    //add an event listener to the form submit button
    const btn = document.getElementById('order');

    btn.addEventListener('click', formValidation);
}
  
// Call the initialization function
initializeCartPage();