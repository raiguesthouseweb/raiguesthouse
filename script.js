// Add this at the start of your script file
window.addEventListener('scroll', function() {
    const footer = document.querySelector('footer');
    const floatingCart = document.querySelector('.floating-cart');
    
    if (footer && floatingCart) {
        const footerTop = footer.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        // Hide floating cart when footer is visible
        if (footerTop < windowHeight) {
            floatingCart.style.opacity = '0';
            floatingCart.style.pointerEvents = 'none';
        } else {
            floatingCart.style.opacity = '1';
            floatingCart.style.pointerEvents = 'auto';
        }
    }
});

// Initialize empty cart array to store selected items
// Each item will have: name, price, and quantity
let cart = [];

// Initialize total amount to 0
// This will be updated as items are added/removed
let total = 0;

// API endpoints for order submission and menu fetching
const API_URL = "https://raiguesthouse-orujgkxvc-raiguesthouses-projects-kkzhkqxan.vercel.app/submit-order";
const MENU_URL = "https://rai-guest-house-proxy-kkzhkqxan-raiguesthouses-projects.vercel.app/menu";

// showInitialWarning function - modified to never show the warning
function showInitialWarning() {
    // Set the localStorage item to true to prevent the warning from showing
    localStorage.setItem('warningAgreed', 'true');
    
    // Function is now empty - warning will never show
    return;
}

// fetchMenu function - keeping functionality intact
async function fetchMenu() {
    try {
        // Add loading indicator
        const menuDiv = document.getElementById('menu-items');
        if (menuDiv) {
            menuDiv.innerHTML = `
                <div style="text-align: center; width: 100%; padding: 20px;">
                    <p style="color: #F5E050; font-size: 18px; margin-bottom: 10px; font-family: 'Lora', serif;">Loading menu...</p>
                    <div style="display: inline-block; width: 50px; height: 50px; border: 5px solid #F5E050; 
                                border-radius: 50%; border-top-color: transparent; 
                                animation: spin 1s linear infinite;"></div>
                </div>
            `;
            
            // Add the spinner animation
            if (!document.querySelector('#spinnerAnimation')) {
                const style = document.createElement('style');
                style.id = 'spinnerAnimation';
                style.textContent = `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        // Add a timeout to prevent quick error messages
        const fetchWithTimeout = async (url, options, timeout = 10000) => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            
            try {
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });
                clearTimeout(id);
                return response;
            } catch (error) {
                clearTimeout(id);
                throw error;
            }
        };
        
        // Try up to 3 times with increasing delays
        let attempts = 0;
        let error;
        
        while (attempts < 3) {
            try {
                const response = await fetchWithTimeout(MENU_URL, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }, 15000); // 15 second timeout
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const menuItems = await response.json();
                
                // Validate response data
                if (menuItems.error) {
                    throw new Error(menuItems.error + (menuItems.details ? `: ${menuItems.details}` : ''));
                }
                
                if (!Array.isArray(menuItems)) {
                    throw new Error('Menu items is not an array');
                }
                
                displayMenu(menuItems);
                return; // Success, exit the function
            } catch (e) {
                error = e;
                attempts++;
                
                // Wait longer between each retry
                if (attempts < 3) {
                    await new Promise(resolve => setTimeout(resolve, attempts * 2000));
                }
            }
        }
        
        // If we get here, all attempts failed
        console.error('Error fetching menu after multiple attempts:', error);
        
        // Show a more user-friendly message instead of an alert
        if (menuDiv) {
            menuDiv.innerHTML = `
                <div style="text-align: center; width: 100%; padding: 20px; background: rgba(10, 26, 47, 0.1); border-radius: 8px;">
                    <p style="color: #F5E050; font-size: 18px; margin-bottom: 10px; font-family: 'Lora', serif;">
                        <i class="fas fa-wifi" style="margin-right: 8px;"></i>
                        Network connection is slow
                    </p>
                    <p style="color: #F5E050; font-size: 16px; margin-bottom: 15px; font-family: 'Lora', serif;">
                        Please wait a moment and refresh the page
                    </p>
                    <button onclick="location.reload()" style="background: #0A1A2F; color: #F5E050; border: none; 
                                                              padding: 8px 16px; border-radius: 4px; cursor: pointer; font-family: 'Lora', serif;">
                        Refresh Page
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error in fetchMenu function:', error);
        // Don't show alert, just log to console
    }
}

// displayMenu function - updated with new design
function displayMenu(menuItems) {
    // Add Google Fonts if not already present
    if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
        const fontLink = document.createElement('link');
        fontLink.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lora:wght@400;500;600&display=swap";
        fontLink.rel = "stylesheet";
        document.head.appendChild(fontLink);
    }
    
    // Add background style to document body
    if (!document.querySelector('#pageBackground')) {
        const style = document.createElement('style');
        style.id = 'pageBackground';
        style.textContent = `
            body {
                font-family: 'Lora', serif;
                background: linear-gradient(135deg, #0A1A2F 0%, #1E3A5F 100%);
                color: #F5E050;
                margin: 0;
                padding: 0;
                overflow-x: hidden;
                min-height: 100vh;
            }
            
            h1, h2, h3 {
                font-family: 'Cinzel', serif;
            }
            
            #menu-items {
                border-radius: 16px;
                padding: 20px;
                margin-top: 20px;
            }
            
            @keyframes velvetShine {
                0%, 100% { box-shadow: 0 0 10px rgba(245, 224, 80, 0.3); }
                50% { box-shadow: 0 0 20px rgba(245, 224, 80, 0.5); }
            }
            
            @keyframes glow {
                from { text-shadow: 0 0 10px #F5E050; }
                to { text-shadow: 0 0 20px #F5E050, 0 0 30px #F5E050; }
            }
        `;
        document.head.appendChild(style);
    }

    const menuDiv = document.getElementById('menu-items');
    menuDiv.innerHTML = '';
    menuDiv.style.maxWidth = '375px';
    menuDiv.style.margin = '20px auto';
    menuDiv.style.padding = '20px 10px';
    menuDiv.style.background = 'none';
    menuDiv.style.backdropFilter = 'none';

    const groupedItems = {};
    menuItems.forEach(item => {
        if (!groupedItems[item.category]) {
            groupedItems[item.category] = [];
        }
        groupedItems[item.category].push(item);
    });

    // Create a flex container for categories
    const categoriesWrapper = document.createElement('div');
    categoriesWrapper.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 80px;
        align-items: center;
        width: 100%;
        padding: 10px;
    `;
    menuDiv.appendChild(categoriesWrapper);

    Object.keys(groupedItems).forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-section';
        categoryDiv.style.cssText = `
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
        `;
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'cursor-pointer category-header';
        headerDiv.style.cssText = `
            width: 320px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
            background: linear-gradient(145deg, #0A1A2F, #1E3A5F);
            border: 2px solid #F5E050;
            border-radius: 40px;
            box-shadow: 0 0 10px rgba(245, 224, 80, 0.3);
            position: relative;
            z-index: 1;
            animation: velvetShine 3s infinite;
        `;
        
        // Text styling update for better visibility
        headerDiv.innerHTML = `
            <div class="text-center p-2">
                <h2 style="
                    color: #F5E050;
                    font-size: 1rem;
                    font-weight: 600;
                    line-height: 1.2;
                    margin: 0;
                    word-break: break-word;
                    text-shadow: 0 0 10px rgba(245, 224, 80, 0.5);
                    font-family: 'Cinzel', serif;
                ">
                    ${category}
                </h2>
            </div>
        `;
        
        // Content div styling updated to match width of header
        const contentDiv = document.createElement('div');
        contentDiv.className = 'hidden mt-4 w-full';
        contentDiv.style.cssText = `
            display: none;
            justify-content: center;
            width: 100%;
        `;
        
        const itemsContainer = document.createElement('div');
        itemsContainer.style.cssText = `
            background: none;
            border-radius: 8px;
            overflow: hidden;
            width: 320px;
            padding: 10px;
        `;
        itemsContainer.className = 'menu-card';
        itemsContainer.style.background = 'linear-gradient(145deg, #F5E050, #DAA520);';
        itemsContainer.boxShadow = '0 4px 12px rgba(218, 165, 32, 0.3);';
        itemsContainer.overflow = 'hidden;';
        itemsContainer.width = '320px;';
        itemsContainer.padding = '10px;';
        itemsContainer.className = 'menu-card divide-y divide-[#0A1A2F]';
        
        groupedItems[category].forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'p-3';
            itemDiv.style.cssText = `
                transition: all 0.3s ease;
                background: transparent;
            `;
            
            // Add hover effect through CSS
            if (!document.querySelector('#menuItemHover')) {
                const styleSheet = document.createElement('style');
                styleSheet.id = 'menuItemHover';
                styleSheet.textContent = `
                    .menu-item {
                        margin: 22px 0;
                        border-radius: 12px;
                        background: transparent;
                        overflow: hidden;
                        transition: all 0.3s ease;
                        border: 1px solid rgba(218, 165, 32, 0.5);
                        box-shadow: 0 0 8px rgba(218, 165, 32, 0.4);
                        width: 100%;
                        max-width: 320px;
                    }
                    
                    .menu-item:hover {
                        background: rgba(255, 255, 255, 0.1);
                        box-shadow: 0 0 12px rgba(218, 165, 32, 0.7);
                        transform: translateY(-2px);
                        border-color: rgba(218, 165, 32, 0.8);
                    }
                    
                    .category-header {
                        box-shadow: 0 0 15px rgba(245, 224, 80, 0.5) !important;
                        transition: all 0.3s ease !important;
                    }
                    
                    .category-header:hover {
                        box-shadow: 0 0 20px rgba(245, 224, 80, 0.8) !important;
                        transform: translateY(-3px) !important;
                    }
                    
                    @keyframes goldPulse {
                        0%, 100% { box-shadow: 0 0 8px rgba(218, 165, 32, 0.4); border-color: rgba(218, 165, 32, 0.5); }
                        50% { box-shadow: 0 0 12px rgba(218, 165, 32, 0.7); border-color: rgba(218, 165, 32, 0.8); }
                    }
                    
                    .menu-item {
                        animation: goldPulse 3s infinite;
                    }
                    
                    .add-button {
                        background-color: #4CAF50 !important;
                        color: white !important;
                        border: none;
                        border-radius: 20px;
                        padding: 5px 15px;
                        min-width: 80px;
                        font-weight: 500;
                        transition: all 0.3s ease;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                    
                    .add-button:hover {
                        background-color: #45a049 !important;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                        transform: translateY(-2px);
                    }
                    
                    .item-quantity {
                        color: #FF0000;
                        font-weight: bold;
                        font-size: 1.2rem;
                        display: inline-block;
                        margin: 0 5px;
                    }
                    
                    .menu-item-row {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        width: 100%;
                        padding: 8px;
                    }
                    
                    .dish-name-container {
                        display: flex;
                        align-items: center;
                        flex: 1;
                    }
                    
                    .quantity-controls {
                        display: flex;
                        align-items: center;
                        margin-left: 5px;
                    }
                    
                    .decrement-button {
                        background-color: #f44336 !important;
                        color: white !important;
                        border: none;
                        border-radius: 50%;
                        width: 24px;
                        height: 24px;
                        font-weight: bold;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        margin-right: 5px;
                    }
                    
                    .decrement-button:hover {
                        background-color: #d32f2f !important;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                    }
                    
                    .hidden-control {
                        visibility: hidden;
                        opacity: 0;
                    }
                `;
                document.head.appendChild(styleSheet);
            }
            itemDiv.classList.add('menu-item');

            // Get quantity of this item in cart
            const cartItem = cart.find(cartItem => cartItem.name === item.name);
            const quantity = cartItem ? cartItem.quantity : 0;
            
            // Create quantity controls with decrement button
            const decrementClass = quantity > 0 ? 'decrement-button' : 'decrement-button hidden-control';
            const quantityDisplay = quantity > 0 ? `<span class="item-quantity">(${quantity})</span>` : '';

            itemDiv.innerHTML = `
                <div class="menu-item-row">
                    <div class="dish-name-container">
                        <span class="text-sm font-medium" style="color: #DAA520; font-family: 'Lora', serif; text-shadow: 0 0 3px rgba(218, 165, 32, 0.3);">${item.name}</span>
                        <div class="quantity-controls">
                            <button onclick="removeFromCart('${item.name}', ${item.price})" class="${decrementClass}">-</button>
                            ${quantityDisplay}
                        </div>
                    </div>
                    <button onclick="addToCart('${item.name}', ${item.price})" 
                            class="add-button"
                            style="font-family: 'Lora', serif;">
                        ₹${item.price}
                    </button>
                </div>
            `;
            itemsContainer.appendChild(itemDiv);
        });

        contentDiv.appendChild(itemsContainer);
        categoryDiv.appendChild(headerDiv);
        categoryDiv.appendChild(contentDiv);
        menuDiv.appendChild(categoryDiv);

        // Click handler updated to properly toggle visibility
        headerDiv.addEventListener('click', () => {
            document.querySelectorAll('.category-section').forEach(section => {
                if (section !== categoryDiv) {
                    const content = section.querySelector('div:nth-child(2)');
                    content.style.display = 'none';
                    content.classList.add('hidden');
                }
            });
            
            if (contentDiv.classList.contains('hidden')) {
                contentDiv.style.display = 'flex';
                contentDiv.classList.remove('hidden');
            } else {
                contentDiv.style.display = 'none';
                contentDiv.classList.add('hidden');
            }
        });
    });
}

// Update cart styling with new design
function updateCart() {
    const cartDiv = document.getElementById('cart-items');
    cartDiv.innerHTML = '';
    
    if (cart.length === 0) {
        cartDiv.innerHTML = '<div class="text-base text-center p-3" style="font-family: \'Lora\', serif; color: #000000;">Your cart is empty</div>';
    } else {
        cart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'py-2 px-3 border-b border-gray-100 last:border-0';
            itemDiv.innerHTML = `
                <div class="flex justify-between items-center">
                    <div class="flex-1">
                        <span class="text-base font-bold" style="font-family: 'Lora', serif; color: #000000;">${item.name}</span>
                        <div class="flex items-center mt-1">
                            <span class="text-sm" style="font-family: 'Lora', serif; color: #000000;">Qty: ${item.quantity}</span>
                            <span class="text-base font-bold ml-2" style="font-family: 'Lora', serif; color: #000000;">₹${item.price * item.quantity}</span>
                        </div>
                    </div>
                    <button onclick="removeFromCart('${item.name}', ${item.price})" 
                            class="text-sm px-2 py-1 hover:bg-[#0A1A2F] hover:text-[#F5E050] rounded transition-all duration-300"
                            style="font-family: 'Lora', serif; color: #000000; border: 1px solid #000000;">
                        Remove
                    </button>
                </div>
            `;
            cartDiv.appendChild(itemDiv);
        });
    }

    // Update both total displays with new design colors
    const totalDiv = document.getElementById('cart-total');
    const floatingTotal = document.getElementById('floating-total');
    
    if (totalDiv) {
        totalDiv.innerHTML = total;
        totalDiv.style.fontFamily = "'Lora', serif";
        totalDiv.style.color = "#000000";
    }
    if (floatingTotal) {
        floatingTotal.innerHTML = total;
        floatingTotal.parentElement.style.color = '#F5E050';
        floatingTotal.parentElement.style.textShadow = '0 0 10px #F5E050';
        floatingTotal.parentElement.style.animation = 'glow 1.5s ease-in-out infinite alternate';
    }
}

// addToCart function - updated to refresh menu display with quantities and decrement button
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    total += price;
    updateCart();
    
    // Update the menu item display to show updated quantities
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(menuItem => {
        const nameSpan = menuItem.querySelector('.dish-name-container span:first-child');
        if (nameSpan && nameSpan.textContent === name) {
            const container = nameSpan.parentElement;
            const cartItem = cart.find(item => item.name === name);
            
            // Get the quantity controls container
            const quantityControls = container.querySelector('.quantity-controls');
            if (quantityControls) {
                // Update decrement button visibility
                const decrementButton = quantityControls.querySelector('button');
                if (decrementButton) {
                    decrementButton.classList.remove('hidden-control');
                }
                
                // Update quantity display
                let quantitySpan = quantityControls.querySelector('.item-quantity');
                if (!quantitySpan && cartItem && cartItem.quantity > 0) {
                    // Create quantity span if it doesn't exist
                    quantitySpan = document.createElement('span');
                    quantitySpan.className = 'item-quantity';
                    quantityControls.appendChild(quantitySpan);
                }
                
                if (quantitySpan && cartItem) {
                    quantitySpan.textContent = `(${cartItem.quantity})`;
                }
            }
        }
    });
}

// removeFromCart function - updated to refresh menu display with quantities and decrement button
function removeFromCart(name, price) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity -= 1;
        total -= price;
        if (item.quantity === 0) {
            cart = cart.filter(i => i.name !== name);
        }
        updateCart();
        
        // Update the menu item display to show updated quantities
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(menuItem => {
            const nameSpan = menuItem.querySelector('.dish-name-container span:first-child');
            if (nameSpan && nameSpan.textContent === name) {
                const container = nameSpan.parentElement;
                const cartItem = cart.find(item => item.name === name);
                
                // Get the quantity controls container
                const quantityControls = container.querySelector('.quantity-controls');
                if (quantityControls) {
                    // Update decrement button visibility
                    const decrementButton = quantityControls.querySelector('button');
                    if (decrementButton) {
                        if (!cartItem || cartItem.quantity === 0) {
                            decrementButton.classList.add('hidden-control');
                        }
                    }
                    
                    // Update quantity display
                    const quantitySpan = quantityControls.querySelector('.item-quantity');
                    if (quantitySpan) {
                        if (cartItem && cartItem.quantity > 0) {
                            quantitySpan.textContent = `(${cartItem.quantity})`;
                        } else {
                            quantitySpan.textContent = '';
                        }
                    }
                }
            }
        });
    }
}

// submitOrder function - fixing the implementation
async function submitOrder() {
    if (cart.length === 0) {
        alert('कृपया कुछ आइटम्स ऑर्डर करें');
        return;
    }

    const roomNumber = document.getElementById('room-number').value;
    const mobileNumber = document.getElementById('mobile-number').value;
    const termsAccepted = document.getElementById('terms-checkbox').checked;

    // Validate room number
    const validRooms = ['Dorm', 'Dormitory', 'R0', 'R1', 'R2', 'R3', 'R4', 'F2', 'F3', 'F4', 'F5', 'F6'];
    if (!validRooms.includes(roomNumber)) {
        alert('कृपया सही रूम नंबर डालें\nValid rooms are: Dormitory/Dorm, R0, R1, R2, R3, R4, F2, F3, F4, F5, F6');
        return;
    }

    // Validate mobile number
    if (!/^\d{10}$/.test(mobileNumber)) {
        alert('कृपया 10 अंकों का मोबाइल नंबर डालें\nPlease enter a 10-digit mobile number');
        return;
    }

    if (!termsAccepted) {
        alert('Please accept the terms and conditions');
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

        // Send email notification first
        sendOrderEmail(orderData);

        // Then submit order to API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();
        console.log('Response body:', result);

        if (result.status === 'success') {
            alert('Order placed successfully!');
            cart = [];
            total = 0;
            updateCart();
        } else {
            alert('Error placing order: ' + result.message);
        }
    } catch (error) {
        console.error('Error submitting order:', error);
        alert('Error placing order: ' + error.message);
    }
}

// Add this function to send email notifications
function sendOrderEmail(orderDetails) {
    // Format order items for email
    let itemsList = '';
    orderDetails.cart.forEach(item => {
        itemsList += `${item.name} x ${item.quantity} - ₹${item.price * item.quantity}\n`;
    });
    
    // Prepare template parameters
    const templateParams = {
        room_number: orderDetails.roomNumber,
        mobile_number: orderDetails.mobileNumber,
        order_items: itemsList,
        order_total: orderDetails.total,
        order_time: new Date().toLocaleString()
    };
    
    // Send email using EmailJS
    emailjs.send("service_0k0kvk8", "template_2cy2428", templateParams)
        .then(function(response) {
            console.log('Email sent successfully!', response.status, response.text);
        }, function(error) {
            console.error('Failed to send email:', error);
        });
}

// Event listener for order button
document.addEventListener('DOMContentLoaded', function() {
    // Show initial warning
    showInitialWarning();
    
    // Fetch menu
    fetchMenu();
    
    // Style the "Places to Visit" button
    setTimeout(styleVisitButton, 1000);
    
    // Style form inputs
    styleFormInputs();
    
    // Attach event to submit button
    const submitButton = document.getElementById('submit-order');
    if (submitButton) {
        submitButton.addEventListener('click', submitOrder);
    } else {
        // If button not found by ID, try to find by text content
        const allButtons = document.querySelectorAll('button');
        for (let btn of allButtons) {
            if (btn.textContent.trim().includes('Place Order')) {
                btn.id = 'submit-order';
                btn.addEventListener('click', submitOrder);
                break;
            }
        }
    }
});

// Style the "Places to Visit" button
function styleVisitButton() {
    const visitLinks = document.querySelectorAll('a');
    
    visitLinks.forEach(link => {
        if (link.textContent.includes('Places to visit in Ujjain') || 
            link.textContent.includes('Places to Visit in Ujjain')) {
            
            // Skip if link already has the places-button class
            if (link.classList.contains('places-button')) return;
            
            // Apply the new styling directly to the existing link
            link.className = 'places-button';
            link.style.background = 'linear-gradient(45deg, #0A1A2F, #F5E050)';
            link.style.color = '#FFFFFF';
            link.style.padding = '10px 20px';
            link.style.borderRadius = '8px';
            link.style.fontWeight = 'bold';
            link.style.textAlign = 'center';
            link.style.margin = '0 auto 20px auto';
            link.style.display = 'block';
            link.style.maxWidth = '300px';
            link.style.boxShadow = '0 0 10px rgba(245, 224, 80, 0.5)';
            link.style.transition = 'all 0.3s ease';
            link.style.textDecoration = 'none';
            link.style.fontFamily = "'Lora', serif";
            
            // Add hover effects
            link.onmouseover = function() {
                this.style.background = 'linear-gradient(45deg, #F5E050, #0A1A2F)';
                this.style.boxShadow = '0 0 15px rgba(245, 224, 80, 0.8)';
                this.style.transform = 'translateY(-2px)';
            };
            
            link.onmouseout = function() {
                this.style.background = 'linear-gradient(45deg, #0A1A2F, #F5E050)';
                this.style.boxShadow = '0 0 10px rgba(245, 224, 80, 0.5)';
                this.style.transform = 'translateY(0)';
            };
        }
    });
}

// Style form inputs
function styleFormInputs() {
    const roomNumberInput = document.getElementById('room-number');
    const mobileNumberInput = document.getElementById('mobile-number');
    const termsCheckbox = document.getElementById('terms-checkbox');
    const submitButton = document.getElementById('submit-order');
    
    // Style select and input fields
    [roomNumberInput, mobileNumberInput].forEach(input => {
        if (!input) return;
        
        input.className = 'input-field w-full';
        input.style.background = '#F8F7F2';
        input.style.border = '2px solid #F5E050';
        input.style.borderRadius = '8px';
        input.style.padding = '10px';
        input.style.color = '#0A1A2F';
        input.style.transition = 'border-color 0.3s ease, box-shadow 0.3s ease';
        input.style.fontFamily = "'Lora', serif";
        
        // Add focus effects
        input.addEventListener('focus', () => {
            input.style.borderColor = '#DAA520';
            input.style.boxShadow = '0 0 8px rgba(245, 224, 80, 0.5)';
        });
        
        input.addEventListener('blur', () => {
            input.style.borderColor = '#F5E050';
            input.style.boxShadow = 'none';
        });
    });
    
    // Style submit button
    if (submitButton) {
        submitButton.className = 'w-full order-button';
        submitButton.style.background = '#0A1A2F';
        submitButton.style.color = '#F5E050';
        submitButton.style.border = 'none';
        submitButton.style.borderRadius = '8px';
        submitButton.style.padding = '12px';
        submitButton.style.fontSize = '16px';
        submitButton.style.fontWeight = '600';
        submitButton.style.transition = 'background 0.3s ease, color 0.3s ease';
        submitButton.style.fontFamily = "'Lora', serif";
        
        // Add hover effects
        submitButton.addEventListener('mouseover', function() {
            this.style.background = '#F5E050';
            this.style.color = '#0A1A2F';
        });
        
        submitButton.addEventListener('mouseout', function() {
            this.style.background = '#0A1A2F';
            this.style.color = '#F5E050';
        });
    }
    
    // Style floating cart
    const floatingCart = document.querySelector('.floating-cart');
    if (floatingCart) {
        floatingCart.style.background = '#0A1A2F';
        floatingCart.style.border = '3px solid #F5E050';
        floatingCart.style.boxShadow = '0 0 15px rgba(245, 224, 80, 0.4)';
    }
}

// Add a function to apply the new fonts to the entire page
function applyFonts() {
    // Add Google Fonts if not already present
    if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lora:wght@400;500;600"]')) {
        const fontLink = document.createElement('link');
        fontLink.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lora:wght@400;500;600&display=swap";
        fontLink.rel = "stylesheet";
        document.head.appendChild(fontLink);
    }
    
    // Apply fonts to elements
    const style = document.createElement('style');
    style.textContent = `
        body, p, span, div, button, input, select, textarea {
            font-family: 'Lora', serif;
        }
        
        h1, h2, h3, h4, h5, h6 {
            font-family: 'Cinzel', serif;
        }
    `;
    document.head.appendChild(style);
}

// Add a function to apply the new background to the page
function applyBackground() {
    const style = document.createElement('style');
    style.textContent = `
        body {
            font-family: 'Lora', serif;
            background: linear-gradient(135deg, #0A1A2F 0%, #1E3A5F 100%);
            color: #F5E050;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            min-height: 100vh;
        }
    `;
    document.head.appendChild(style);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Show initial warning
    showInitialWarning();
    
    // Fetch menu
    fetchMenu();
    
    // Style the "Places to Visit" button
    setTimeout(styleVisitButton, 1000);
    
    // Style form inputs
    styleFormInputs();
    
    // Apply fonts and background
    applyFonts();
    applyBackground();
});
