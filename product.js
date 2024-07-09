fetch("./product.json")
    .then(response => response.json())
    .then(products => {
        const productContainer = document.getElementById('product-container');
        const bestSellerContainer = document.getElementById('best-seller-container');

        const groupProductsByShop = (products) => {
            return products.reduce((acc, product) => {
                const shopName = product.shop.name;
                if (!acc[shopName]) {
                    acc[shopName] = [];
                }
                acc[shopName].push(product);
                return acc;
            }, {});
        };

        const createProductCard = (product, isBestSeller = false) => {
            const discountedPrice = product.price - (product.price * (product.discount_percentage / 100));
            const cardSizeClass = isBestSeller ? 'w-72 h-96' : 'h-80';

            return `
                <div id="${product.id}" class="product-card ${cardSizeClass} mx-3 mt-3">
                    <img src="${product.images[1]}" alt="${product.title}">
                    <div class="p-1 flex justify-between">
                        <div>
                            <h3 class="text-xl font-semibold">${product.title}</h3>
                            <div class="flex justify-between">
                                <p>
                                    <span class="line-through text-sm">$${product.price.toFixed(2)}</span>
                                    $${discountedPrice.toFixed(2)}
                                </p>
                            </div>
                        </div>
                        <button onclick="addCart(${product.id})" class="self-center hover:scale-150 duration-300 text-2xl"><i class="fa-solid fa-basket-shopping"></i></button>
                    </div>
                </div>
            `;
        };

        const createShopSection = (shopName, products) => {
            let productCards = products.map(product => createProductCard(product)).join('');
            return `
                <div class="shop-section flex flex-col gap-2">
                    <div class="flex justify-between">
                        <h2 class="text-4xl uppercase font-bold mx-4">${shopName}</h2>
                        <a href="#" class="self-end h-12 w-32 p-2 hover:bg-black hover:text-white duration-300 border-2 border-black flex items-center justify-center font-bold">Show More</a>
                    </div>
                    <div class="product-list px-4">
                        ${productCards}
                    </div>
                </div>
            `;
        };

        const getRandomProducts = (products, count) => {
            const shuffled = [...products].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        };

        const bestSellerProducts = getRandomProducts(products, 3);
        bestSellerContainer.innerHTML = bestSellerProducts.map(product => createProductCard(product, true)).join('');

        const groupedProducts = groupProductsByShop(products);
        for (const shopName in groupedProducts) {
            productContainer.innerHTML += createShopSection(shopName, groupedProducts[shopName]);
        }

    })
    .catch(error => console.error('Error loading products:', error));

const addCart = async (id) => {
    const response = await fetch("./product.json");
    const products = await response.json();
    const container = document.getElementById("")

    console.log(products)
    const item = products.filter((product) => {
        return product.id == id;
    })
    let cart = [
        id.toString()
    ]
    const session = sessionStorage.getItem("cart");
    if (session) {
        cart.push(session)
        console.log(cart)
    }
    sessionStorage.setItem("cart", cart)

}

const createCartShopSection = (shopName, products) => {
    let productCards = products.map(product => createProductCard(product)).join('');
    return `
        <div class="shop-section flex flex-col gap-2">
            <div class="flex justify-between">
                <h2 class="text-4xl uppercase font-bold mx-4">${shopName}</h2>
                <a href="#" class="self-end h-12 w-32 p-2 hover:bg-black hover:text-white duration-300 border-2 border-black flex items-center justify-center font-bold">Show More</a>
            </div>
            <div class="product-list px-4">
                ${productCards}
            </div>
        </div>
    `;
};