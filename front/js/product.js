const productId = (new URL(document.location).searchParams).get("id");

async function insertProduct() {
    if(!productId)
    {
        throw new Error('No product specified.');
    }

    //get product from API
    const product = await fetch('http://localhost:3000/api/products/' + productId)
                    .then(data => {
                        if(data.ok){
                            return data.json();
                        }
                        else{
                            throw new Error('Product request failed');
                        }
                    })
                    .catch(error => console.error(error));
    
    console.log(product); 

    //get relevant HTML elements to populate with product info
    const itemImg = document.getElementsByClassName('item__img')[0];
    if (!itemImg)
    {
        throw new Error('No element with class item__img');
    }

    const titleElement = document.getElementById('title');
    if(!titleElement)
    {
        throw new Error('No element with ID title.');
    }

    const priceElement = document.getElementById('price');
    if(!priceElement)
    {
        throw new Error('No element with ID price.');
    }

    const descElement = document.getElementById('description');
    if(!descElement)
    {
        throw new Error('No element with ID description.');
    }

    const colorsElement = document.getElementById('colors');
    if(!colorsElement)
    {
        throw new Error('No element with ID colors.');
    }


    
    //deconstruct product object
    const {colors, price, altTxt, description, imageUrl, name, _id} = product;

    //populate page on match
    titleElement.innerHTML = name;

    priceElement.innerHTML = price;

    descElement.innerHTML = description;

    itemImg.innerHTML = `<img src="${imageUrl}" alt="${altTxt}">`;

    for (let i = 0; i < colors.length; i++)
    {
        colorsElement.innerHTML += `<option value="${colors[i]}">${colors[i]}</option>`;
    }

    setEventListeners();
}

function setEventListeners()
{
    const btn = document.getElementById('addToCart');

    btn.addEventListener('click', addItem);

    function addItem(event) 
    {
        if(!document.getElementById('colors').value || !document.getElementById('quantity').value)
        {
            alert('Please select a color and quantity.');
            return;
        }

        console.log('Button clicked', event);
        const cart = getCart();
        //update cart if product is not same color
        const matchedItem = cart.find(i => i._id === productId && document.getElementById('colors').value === i.color)
        if(matchedItem)
        {
            matchedItem.quantity = document.getElementById('quantity').value;
        }
        //update cart product quantity if product is same color
        else
        {
            //populating cart array
            cart.push({_id:productId, quantity:document.getElementById('quantity').value, color:document.getElementById('colors').value});
        }

        //pass updated cart into cart
        setCart(cart);
    }
}

//read from cart
function getCart()
{
    //create cart in local storage, add backup empty erray
    return JSON.parse(localStorage.getItem('cart')||'[]');
}

//update cart
function setCart(cart)
{
    localStorage.setItem('cart', JSON.stringify(cart||[]));
}

insertProduct();