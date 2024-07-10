document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch("./product.json");
    const products = await response.json();
    const productContainerForCart = document.getElementById('product-container-cart');
    const cartTotal = document.getElementById('cart-total');

    const groupProductsByShopForCart = (products) => {
        return products.reduce((acc, product) => {
            const shopName = product.product.shop.name;
            if (!acc[shopName]) {
                acc[shopName] = [];
            }
            acc[shopName].push(product);
            return acc;
        }, {});
    };

    const createProductCardForCart = (product) => {
        const discountedPrice = product.product.price - (product.product.price * (product.product.discount_percentage / 100));
        return `
            <div class="w-full h-32 flex">
                <input type="checkbox" value="${product.product.id}" class="product-checkbox mr-2">
                <img class="object-cover h-32 w-32" src="${product.product.images[0]}">
                <div class="mx-2 w-full flex flex-col gap-1">
                    <h3 class="text-xl font-semibold">${product.product.title}</h3>
                    <p><span class="line-through text-sm">${product.product.price.toFixed(2)}</span> ${discountedPrice.toFixed(2)}</p>
                    <div class="flex items-center justify-self-end gap-2">
                        <button onclick="decreaseQuantity(${product.product.id})" class="text-xl"><i class="fa-solid fa-minus"></i></button>
                        <input class="w-6 text-center focus:ring-0" value="${product.quantity}">
                        <button onclick="increaseQuantity(${product.product.id})" class="text-xl"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
                <button onclick="removeProduct(${product.product.id})" class="self-start mr-1 mt-1 text-xl duration-300 hover:scale-150"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    };

    const createShopSectionForCart = (shopName, products) => {
        let productCards = products.map(product => createProductCardForCart(product)).join('');
        return `
            <div class="border-2 border-gray-400 p-4 rounded-md">
                <div class="flex items-center gap-2 border-b-2 border-gray-400 mb-4">
                    <input type="checkbox" class="shop-checkbox mb-2" value="${shopName}">
                    <h2 class="uppercase font-semibold text-2xl mb-2">${shopName}</h2>
                    <button onclick="removeShop('${products[0].product.shop.name}')" class="mb-1 flex items-center text-xl duration-300 hover:scale-150"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="flex flex-col gap-2">
                    ${productCards}
                </div>
            </div>
        `;
    };

    const displayCart = () => {
        productContainerForCart.innerHTML = "";

        const cart = JSON.parse(sessionStorage.getItem("cart"));
        if (!cart) {
            return;
        }

        const items = cart.map(cartItem => {
            const product = products.find(product => product.id === cartItem.id);
            return { product, quantity: cartItem.quantity };
        });

        const groupedProductsForCart = groupProductsByShopForCart(items);
        for (const shopName in groupedProductsForCart) {
            productContainerForCart.innerHTML += createShopSectionForCart(shopName, groupedProductsForCart[shopName]);
        }

        const shopCheckboxes = document.querySelectorAll('.shop-checkbox');
        shopCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                const shopName = event.target.value;
                const productCheckboxes = document.querySelectorAll(`.product-checkbox`);
                productCheckboxes.forEach(productCheckbox => {
                    const product = products.find(p => p.id === parseInt(productCheckbox.value));
                    if (product && product.shop.name === shopName) {
                        productCheckbox.checked = event.target.checked;
                    }
                });
                calculateTotal();
            });
        });

        const productCheckboxes = document.querySelectorAll('.product-checkbox');
        productCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', calculateTotal);
        });

        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        selectAllCheckbox.addEventListener('change', calculateTotal);

        const quantityInputs = document.querySelectorAll('.quantity-input');
        quantityInputs.forEach(input => {
            input.addEventListener('input', calculateTotal);
        });

        calculateTotal();
    }

    const calculateTotal = () => {
        const productCheckboxes = document.querySelectorAll('.product-checkbox:checked');
        let total = 0;
        productCheckboxes.forEach(checkbox => {
            const productId = parseInt(checkbox.value);
            const product = products.find(product => product.id === productId);
            const cart = JSON.parse(sessionStorage.getItem("cart"));
            const cartItem = cart.find(item => item.id === productId);
            const quantity = cartItem ? cartItem.quantity : 1;
            const discountedPrice = product.price - (product.price * (product.discount_percentage / 100));
            total += discountedPrice * quantity;
        });

        cartTotal.innerText = `Total Price: $${total.toFixed(2)}`;
    }

    const addToCart = async (id) => {
        let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
        let itemIndex = cart.findIndex(item => item.id === id);

        if (itemIndex > -1) {
            cart[itemIndex].quantity += 1;
        } else {
            cart.push({ id, quantity: 1 });
        }

        sessionStorage.setItem("cart", JSON.stringify(cart));
        displayCart();
    }

    const removeProduct = (id) => {
        let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
        cart = cart.filter(product => product.id !== id);
        sessionStorage.setItem("cart", JSON.stringify(cart));
        displayCart();
    };

    const removeShop = (shopName) => {
        let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
        const productsToRemove = products.filter(product => product.shop.name === shopName).map(product => product.id.toString());
        cart = cart.filter(product => !productsToRemove.includes(product.id.toString()));
        sessionStorage.setItem("cart", JSON.stringify(cart));
        displayCart();
    };

    const increaseQuantity = (id) => {
        let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
        let itemIndex = cart.findIndex(item => item.id === id);

        if (itemIndex > -1) {
            cart[itemIndex].quantity += 1;
            sessionStorage.setItem("cart", JSON.stringify(cart));
            displayCart();
        }
    }

    const decreaseQuantity = (id) => {
        let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
        let itemIndex = cart.findIndex(item => item.id === id);

        if (itemIndex > -1) {
            cart[itemIndex].quantity -= 1;

            if (cart[itemIndex].quantity < 0) {
                return;
            }

            sessionStorage.setItem("cart", JSON.stringify(cart));
            displayCart();
        }
    }

    const deleteAll = () => {
        const checkedCheckboxes = document.querySelectorAll('.product-checkbox:checked');
        let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
        const checkedProductIds = Array.from(checkedCheckboxes).map(checkbox => parseInt(checkbox.value));

        cart = cart.filter(item => !checkedProductIds.includes(item.id));
        sessionStorage.setItem("cart", JSON.stringify(cart));

        displayCart();
    }

    const checkout = () => {
        const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
        const productCheckboxes = document.querySelectorAll('.product-checkbox');

        const itemsToDelete = [];
        productCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                itemsToDelete.push(parseInt(checkbox.value));
            }
        });

        let updatedCart = cart.filter(item => !itemsToDelete.includes(item.id));
        sessionStorage.setItem("cart", JSON.stringify(updatedCart));

        displayCart();
    };

    window.addToCart = addToCart;
    window.increaseQuantity = increaseQuantity;
    window.decreaseQuantity = decreaseQuantity;
    window.removeProduct = removeProduct;
    window.removeShop = removeShop;
    window.deleteAll = deleteAll;
    window.checkout = checkout;

    displayCart();

});

const toggleSelectAll = () => {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const productCheckboxes = document.querySelectorAll('.product-checkbox');
    const shopCheckboxes = document.querySelectorAll('.shop-checkbox');

    productCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });

    shopCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
};