let cart = [];
let total = 0;

// ✅ Vercel Proxy API
const API_URL = "https://rai-guest-house-proxy-kkzhkqxan-raiguesthouses-projects.vercel.app/submit-order";
const MENU_URL = "https://rai-guest-house-proxy-kkzhkqxan-raiguesthouses-projects.vercel.app/menu";

// 🚨 Show warning on page load
function showInitialWarning() {
    const agreed = localStorage.getItem('warningAgreed');
    if (!agreed) {
        const hindiMessage = "जरूरी सूचना (Important Notice):\n\n" +
            "कृपया सुनिश्चित करें:\n" +
            "- वही मोबाइल नंबर डालें जो आपने check-in के समय दिया था\n" +
            "- सही रूम नंबर चुनें\n\n" +
            "अगर ये details गलत होंगी तो आपका ऑर्डर process नहीं होगा,\n" +
            "चाहे website success message दिखाए।\n\n" +
            "OK दबाकर आगे बढ़ें।";

        const englishMessage = "Important Notice:\n\n" +
            "Please ensure:\n" +
            "- Enter the SAME mobile number you provided during check-in\n" +
            "- Select your correct room number\n\n" +
            "Your order will NOT be processed if these details don't match,\n" +
            "even if you receive a success message.\n\n" +
            "Click OK to proceed.";

        const languageChoice = confirm("Choose language / भाषा चुनें:\n\n" +
            "English = English\n" +
            "हिंदी = हिंदी");

        const result = confirm(languageChoice ? englishMessage : hindiMessage);
        if (result) {
            localStorage.setItem('warningAgreed', 'true');
        }
    }
}

// ✅ Fetch menu items
async function fetchMenu() {
    try {
        showInitialWarning();
        const response = await fetch(MENU_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors' // CORS mode add kiya
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }

        const menuItems = await response.json();

        // Check if response is an error
        if (menuItems.error) {
            throw new Error(menuItems.error + (menuItems.details ? `: ${menuItems.details}` : ''));
        }

        // Ensure menuItems is an array
        if (!Array.isArray(menuItems)) {
            throw new Error('Menu items is not an array');
        }

        displayMenu(menuItems);
    } catch (error) {
        console.error('Error fetching menu:', error);
        alert('Failed to load menu: ' + error.message);
    }
}

// ✅ Display menu items
function displayMenu(menuItems) {
    const menuDiv = document.getElementById('menu-items');
    menuDiv.innerHTML = '';

    const groupedItems = {};
    menuItems.forEach(item => {
        if (!groupedItems[item.category]) {
            groupedItems[item.category] = [];
        }
        groupedItems[item.category].push(item);
    });

    Object.keys(groupedItems).forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-section mb-8';
        categoryDiv.innerHTML = `
            <h2 class="text-2xl font-bold text-yellow-800 mb-4 border-b-2 border-yellow-600 pb-2">
                ${category}
            </h2>
        `;
        menuDiv.appendChild(categoryDiv);

        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
        
        groupedItems[category].forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'bg-white p-4 rounded-lg shadow-md';
            itemDiv.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="text-base font-semibold">${item.name}</span>
                    <button onclick="addToCart('${item.name}', ${item.price})" 
                            class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">
                        ₹${item.price}
                    </button>
                </div>
            `;
            itemsContainer.appendChild(itemDiv);
        });

        categoryDiv.appendChild(itemsContainer);
    });
}

// ✅ Add to cart
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    total += price;
    updateCart();
}

// ✅ Update cart
function updateCart() {
    const cartDiv = document.getElementById('cart-items');
    cartDiv.innerHTML = '';
    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <span>${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}</span>
            <button onclick="removeFromCart('${item.name}', ${item.price})">Remove</button>
        `;
        cartDiv.appendChild(itemDiv);
    });
    document.getElementById('cart-total').textContent = total;
}

// ✅ Remove from cart
function removeFromCart(name, price) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity -= 1;
        total -= price;
        if (item.quantity === 0) {
            cart = cart.filter(i => i.name !== name);
        }
        updateCart();
    }
}

// ✅ Submit order (with Vercel Proxy)
async function submitOrder() {
    if (cart.length === 0) {
        alert('कृपया कुछ आइटम्स ऑर्डर करें / Please add some items to order');
        return;
    }

    const roomNumber = document.getElementById('room-number').value;
    const mobileNumber = document.getElementById('mobile-number').value;
    const termsAccepted = document.getElementById('terms-checkbox').checked;

    if (!roomNumber || !mobileNumber) {
        alert('कृपया रूम नंबर और मोबाइल नंबर दोनों भरें / Please enter both room number and mobile number');
        return;
    }

    if (!termsAccepted) {
        alert('कृपया नीचे दिए गए checkbox को टिक करें / Please check the terms checkbox below');
        return;
    }

    const orderData = {
        cart: cart,
        total: total,
        roomNumber: roomNumber,
        mobileNumber: mobileNumber
    };

    try {
        console.log('Submitting order with data:', orderData);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(orderData),
            mode: 'cors' // CORS mode add kiya
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Response body:', result);

        if (result.status === 'success') {
            alert('Order placed successfully! / ऑर्डर सफलतापूर्वक रखा गया!');
            cart = [];
            total = 0;
            updateCart();
            document.getElementById('room-number').value = '';
            document.getElementById('mobile-number').value = '';
            document.getElementById('terms-checkbox').checked = false;
        } else {
            throw new Error(result.message || 'Unknown error occurred');
        }
    } catch (error) {
        console.error('Error submitting order:', error);
        alert('Error placing order: ' + error.message);
    }
}

// ✅ Attach event listener to submit button
document.getElementById('submit-order').addEventListener('click', submitOrder);

// ✅ Fetch menu on page load
fetchMenu();
