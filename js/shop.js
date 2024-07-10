document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch("./product.json");
    const products = await response.json();

    const bestSellerContainer = document.getElementById('best-seller-container');
    const shopNameElement = document.getElementById('shop-name');

    const shopName = sessionStorage.getItem("shop");
    const filteredProducts = products.filter(product => product.shop.name === shopName);

    shopNameElement.textContent = shopName;

    const createProductCard = (product) => {
        const discountedPrice = product.price - (product.price * (product.discount_percentage / 100));
        return `
            <div id="${product.id}" class="product-card w-72 h-[440px] mx-3 mt-3">
                <img src="${product.images[1]}" alt="${product.title}">
                <div class="p-1 flex justify-between">
                    <div>
                        <h3 class="text-2xl font-semibold">${product.title}</h3>
                        <p class="">${product.description}</p>
                        <div class="flex justify-between">
                            <p class="font-bold">
                                <span class="font-normal line-through text-sm">$${product.price.toFixed(2)}</span>
                                $${discountedPrice.toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <button onclick="addToCart(${product.id})" class="self-start hover:scale-150 duration-300 text-2xl"><i class="fa-solid fa-basket-shopping"></i></button>
                </div>
            </div>
        `;
    };

    const getRandomProducts = (products, count) => {
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    const bestSellerProducts = getRandomProducts(filteredProducts, 3);
    bestSellerContainer.innerHTML = bestSellerProducts.map(product => createProductCard(product, true)).join('');

    const productCards = filteredProducts.map(product => createProductCard(product)).join('');
    bestSellerContainer.innerHTML += productCards;
});