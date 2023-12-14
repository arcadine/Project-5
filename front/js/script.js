async function getProducts(){
    //get products from API
    const products = await fetch('http://localhost:3000/api/products')
                    .then(data => {
                        if(data.ok){
                            return data.json();
                        }
                        else{
                            throw new Error('Product request failed');
                        }
                    })
                    .catch(error => console.error(error));
    
    console.log(products); 
    
    //get HTML element that has id="items"
    const itemsElement = document.getElementById('items');
    if(!itemsElement)
    {
        throw new Error('No element with ID items.');
    }

    //iterate through array
    for(let i = 0; i < products.length; i++)                
    {
        const product = products[i];
        //deconstruct product object
        const {altTxt, description, imageUrl, name, _id} = product;
        //insert product elements from array into string
        const productElements = `<a href="./product.html?id=${_id}">
                                    <article>
                                        <img src="${imageUrl}" alt="${altTxt}">
                                        <h3 class="productName">${name}</h3>
                                        <p class="productDescription">${description}</p>
                                    </article>
                                </a>`
        //insert into HTML
        itemsElement.innerHTML += productElements;
    }
}

getProducts();
