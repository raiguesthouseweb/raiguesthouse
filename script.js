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
let cart = [];

// Initialize total amount to 0
let total = 0;

// API endpoints for order submission and menu fetching
const API_URL = "https://raiguesthouse-orujgkxvc-raiguesthouses-projects-f2380489.vercel.app/submit-order";
const MENU_URL = "https://rai-guest-house-proxy-kkzhkqxan-raiguesthouses-projects.vercel.app/menu";

// Windows XP UI functions
function toggleStartMenu() {
    const startMenu = document.getElementById('start-menu');
    if (startMenu.style.display === 'block') {
        startMenu.style.display = 'none';
    } else {
        startMenu.style.display = 'block';
    }
}

function openWindow(windowId) {
    // Close start menu if open
    document.getElementById('start-menu').style.display = 'none';
    
    // Show the window
    const window = document.getElementById(windowId);
    window.style.display = 'block';
    
    // Center the window
    centerWindow(window);
    
    // Bring to front
    window.style.zIndex = getHighestZIndex() + 1;
}

function closeWindow(windowId) {
    document.getElementById(windowId).style.display = 'none';
}

function centerWindow(windowElement) {
    const windowWidth = windowElement.offsetWidth;
    const windowHeight = windowElement.offsetHeight;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    windowElement.style.left = (screenWidth - windowWidth) / 2 + 'px';
    windowElement.style.top = (screenHeight - windowHeight) / 2 + 'px';
}

function getHighestZIndex() {
    const windows = document.querySelectorAll('.window');
    let highest = 100;
    
    windows.forEach(window => {
        const zIndex = parseInt(window.style.zIndex || 100);
        if (zIndex > highest) {
            highest = zIndex;
        }
    });
    
    return highest;
}

function toggleCart() {
    const cartWindow = document.getElementById('cart-window');
    if (cartWindow.style.display === 'block') {
        cartWindow.style.display = 'none';
    } else {
        cartWindow.style.display = 'block';
        cartWindow.style.zIndex = getHighestZIndex() + 1;
    }
}

// Make windows draggable
document.addEventListener('DOMContentLoaded', function() {
    const windows = document.querySelectorAll('.window');
    
    windows.forEach(window => {
        const header = window.querySelector('.window-header');
        
        let isDragging = false;
        let offsetX, offsetY;
        
        header.addEventListener('mousedown', function(e) {
            isDragging = true;
            offsetX = e.clientX - window.getBoundingClientRect().left;
            offsetY = e.clientY - window.getBoundingClientRect().top;
            window.style.zIndex = getHighestZIndex() + 1;
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            window.style.left = (e.clientX - offsetX) + 'px';
            window.style.top = (e.clientY - offsetY) + 'px';
        });
        
        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
    });
    
    // Start button event
    document.getElementById('start-button').addEventListener('click', toggleStartMenu);
    
    // Desktop icon event
    document.getElementById('menu-icon').addEventListener('click', function() {
        openWindow('menu-window');
    });
    
    // Close start menu when clicking elsewhere
    document.addEventListener('click', function(e) {
        const startMenu = document.getElementById('start-menu');
        const startButton = document.getElementById('start-button');
        
        if (startMenu.style.display === 'block' && 
            !startMenu.contains(e.target) && 
            !startButton.contains(e.target)) {
            startMenu.style.display = 'none';
        }
    });
    
    // Submit order button
    document.getElementById('submit-order').addEventListener('click', submitOrder);
    
    // Fetch menu
    fetchMenu();
});

// fetchMenu function - modified for Windows XP style
async function fetchMenu() {
    try {
        const response = await fetch(MENU_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const menuItems = await response.json();
        
        if (!Array.isArray(menuItems)) {
            throw new Error('Menu items is not an array');
        }
        
        displayMenuCategories(menuItems);
    } catch (error) {
        console.error('Error fetching menu:', error);
        document.getElementById('menu-categories').innerHTML = `
            <div style="text-align: center; width: 100%; padding: 20px;">
                <p style="color: red; font-size: 14px;">Error loading menu. Please try again later.</p>
            </div>
        `;
    }
}

// Display menu categories as folders
function displayMenuCategories(menuItems) {
    const categoriesDiv = document.getElementById('menu-categories');
    categoriesDiv.innerHTML = '';
    
    // Group items by category
    const groupedItems = {};
    menuItems.forEach(item => {
        if (!groupedItems[item.category]) {
            groupedItems[item.category] = [];
        }
        groupedItems[item.category].push(item);
    });
    
    // Create folder for each category
    Object.keys(groupedItems).forEach(category => {
        const folderDiv = document.createElement('div');
        folderDiv.className = 'folder-item';
        folderDiv.innerHTML = `
            <img src="https://win98icons.alexmeub.com/icons/png/directory_closed-4.png" alt="${category}">
            <span>${category}</span>
        `;
        
        folderDiv.addEventListener('click', () => {
            openCategoryWindow(category, groupedItems[category]);
        });
        
        categoriesDiv.appendChild(folderDiv);
    });
}

// Open category window with items
function openCategoryWindow(category, items) {
    const categoryWindow = document.getElementById('category-window');
    const categoryTitle = document.getElementById('category-title');
    const categoryContent = document.getElementById('category-content');
    
    categoryTitle.textContent = category;
    categoryContent.innerHTML = '';
    
    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'menu-item';
        
        // Get quantity of this item in cart
        const cartItem = cart.find(cartItem => cartItem.name === item.name);
        const quantity = cartItem ? cartItem.quantity : 0;
        
        itemDiv.innerHTML = `
            <div>
                <div style="font-weight: bold;">${item.name}</div>
                <div style="font-size: 12px;">₹${item.price}</div>
                ${quantity > 0 ? `<div style="color: green; font-size: 12px;">In cart: ${quantity}</div>` : ''}
            </div>
            <button class="add-button" onclick="addToCart('${item.name}', ${item.price})">Add to Cart</button>
        `;
        
        categoryContent.appendChild(itemDiv);
    });
    
    openWindow('category-window');
}

// addToCart function
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    total += price;
    updateCart();
    
    // Update the category window if open
    const categoryWindow = document.getElementById('category-window');
    if (categoryWindow.style.display === 'block') {
        const categoryTitle = document.getElementById('category-title').textContent;
        const categoryContent = document.getElementById('category-content');
        
        // Find all menu items in the current category window
        const menuItems = categoryContent.querySelectorAll('.menu-item');
        menuItems.forEach(menuItem => {
            const itemName = menuItem.querySelector('div > div:first-child').textContent;
            if (itemName === name) {
                const cartItem = cart.find(item => item.name === name);
                const quantityDiv = menuItem.querySelector('div > div:nth-child(3)');
                
                if (quantityDiv && quantityDiv.textContent.includes('In cart:')) {
                    quantityDiv.textContent = `In cart: ${cartItem.quantity}`;
                } else {
                    const priceDiv = menuItem.querySelector('div > div:nth-child(2)');
                    const quantityDiv = document.createElement('div');
                    quantityDiv.style.color = 'green';
                    quantityDiv.style.fontSize = '12px';
                    quantityDiv.textContent = `In cart: ${cartItem.quantity}`;
                    priceDiv.insertAdjacentElement('afterend', quantityDiv);
                }
            }
        });
    }
}

// removeFromCart function
function removeFromCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity -= 1;
        total -= price;
        
        if (existingItem.quantity <= 0) {
            cart = cart.filter(item => item.name !== name);
        }
        
        updateCart();
        
        // Update the category window if open
        const categoryWindow = document.getElementById('category-window');
        if (categoryWindow.style.display === 'block') {
            const categoryTitle = document.getElementById('category-title').textContent;
            const categoryContent = document.getElementById('category-content');
            
            // Find all menu items in the current category window
            const menuItems = categoryContent.querySelectorAll('.menu-item');
            menuItems.forEach(menuItem => {
                const itemName = menuItem.querySelector('div > div:first-child').textContent;
                if (itemName === name) {
                    const cartItem = cart.find(item => item.name === name);
                    const quantityDiv = menuItem.querySelector('div > div:nth-child(3)');
                    
                    if (quantityDiv && quantityDiv.textContent.includes('In cart:')) {
                        if (cartItem) {
                            quantityDiv.textContent = `In cart: ${cartItem.quantity}`;
                        } else {
                            quantityDiv.remove();
                        }
                    }
                }
            });
        }
    }
}

// Update cart display
function updateCart() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const taskbarTotalSpan = document.getElementById('taskbar-total');
    
    cartItemsDiv.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<div style="text-align: center; padding: 20px;">Your cart is empty</div>';
    } else {
        cart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <div>
                    <div style="font-weight: bold;">${item.name}</div>
                    <div style="font-size: 12px;">₹${item.price} x ${item.quantity} = ₹${item.price * item.quantity}</div>
                </div>
                <button class="add-button" onclick="removeFromCart('${item.name}', ${item.price})" style="background: #D4D0C8; border: 1px solid #888;">Remove</button>
            `;
            cartItemsDiv.appendChild(itemDiv);
        });
    }
    
    cartTotalSpan.textContent = total;
    taskbarTotalSpan.textContent = total;
}

// Send order email
async function sendOrderEmailAsync(orderDetails) {
    try {
        const templateParams = {
            room_number: orderDetails.roomNumber,
            mobile_number: orderDetails.mobileNumber,
            order_details: orderDetails.cart.map(item => 
                `${item.name} - ₹${item.price} x ${item.quantity} = ₹${item.price * item.quantity}`
            ).join('\n'),
            total_amount: orderDetails.total
        };
        
        const response = await emailjs.send('service_rai_guest_house', 'template_rai_guest_house', templateParams);
        console.log('Email sent successfully:', response);
        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
}

// Submit order function
async function submitOrder() {
    if (cart.length === 0) {
        alert('Please add some items to your cart');
        return;
    }

    const roomNumber = document.getElementById('room-number').value;
    const mobileNumber = document.getElementById('mobile-number').value;
    const termsAccepted = document.getElementById('terms-checkbox').checked;

    // Validate room number
    const validRooms = ['Dorm', 'Dormitory', 'R0', 'R1', 'R2', 'R3', 'R4', 'F2', 'F3', 'F4', 'F5', 'F6'];
    if (!validRooms.includes(roomNumber)) {
        alert('Please enter a valid room number\nValid rooms are: Dormitory/Dorm, R0, R1, R2, R3, R4, F2, F3, F4, F5, F6');
        return;
    }

    // Validate mobile number
    if (!/^\d{10}$/.test(mobileNumber)) {
        alert('Please enter a 10-digit mobile number');
        return;
    }

    if (!termsAccepted) {
        alert('Please accept the terms and conditions');
        return;
    }

    // Show Windows XP style loading dialog
    showXPDialog('Processing', 'Please wait while your order is being processed...', true);

    const orderData = {
        cart: cart,
        total: total,
        roomNumber: roomNumber,
        mobileNumber: mobileNumber
    };

    try {
        console.log('Submitting order with data:', orderData);

        // First submit order to API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();
        console.log('Response body:', result);

        // Close the processing dialog
        closeXPDialog();

        if (result.status === 'success') {
            // Only send email if API call was successful
            await sendOrderEmailAsync(orderData);
            
            showXPDialog('Success', 'Your order has been placed successfully!', false);
            cart = [];
            total = 0;
            updateCart();
        } else {
            showXPDialog('Error', 'Error placing order: ' + result.message, false);
        }
    } catch (error) {
        console.error('Error submitting order:', error);
        closeXPDialog();
        showXPDialog('Error', 'Error placing order: ' + error.message, false);
    }
}

// Windows XP style dialog
function showXPDialog(title, message, isProcessing) {
    // Remove any existing dialog
    closeXPDialog();
    
    const dialog = document.createElement('div');
    dialog.id = 'xp-dialog';
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ECE9D8;
        border: 1px solid #0054E3;
        border-radius: 5px;
        box-shadow: 2px 2px 10px rgba(0,0,0,0.3);
        width: 300px;
        z-index: 1000;
    `;
    
    const header = document.createElement('div');
    header.style.cssText = `
        height: 30px;
        background: linear-gradient(to right, #0058E6 0%, #2B91ED 50%, #0058E6 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px;
        border-radius: 5px 5px 0 0;
    `;
    header.innerHTML = `
        <div style="display: flex; align-items: center; font-weight: bold; font-family: 'Tahoma', sans-serif;">
            <img src="https://win98icons.alexmeub.com/icons/png/msg_information-0.png" alt="Info" style="width: 16px; height: 16px; margin-right: 5px;">
            <span>${title}</span>
        </div>
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        padding: 20px;
        text-align: center;
        color: black;
        font-family: 'Tahoma', sans-serif;
    `;
    
    if (isProcessing) {
        content.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <img src="https://win98icons.alexmeub.com/icons/png/hourglass-0.png" alt="Loading" style="width: 32px; height: 32px; margin-right: 10px;">
                <span>${message}</span>
            </div>
            <div style="width: 100%; height: 20px; background: #D4D0C8; border: 1px solid #888; border-radius: 2px; overflow: hidden;">
                <div id="progress-bar" style="width: 0%; height: 100%; background: linear-gradient(to right, #0058E6 0%, #2B91ED 50%, #0058E6 100%);"></div>
            </div>
        `;
        
        // Animate progress bar
        setTimeout(() => {
            const progressBar = document.getElementById('progress-bar');
            if (progressBar) {
                let width = 0;
                const interval = setInterval(() => {
                    if (width >= 100) {
                        clearInterval(interval);
                    } else {
                        width += 1;
                        progressBar.style.width = width + '%';
                    }
                }, 50);
            }
        }, 100);
    } else {
        content.innerHTML = `
            <p style="margin-bottom: 20px;">${message}</p>
            <button id="dialog-ok" style="
                background: linear-gradient(to bottom, #FDFDFD 0%, #F6F6F6 50%, #E8E8E8 100%);
                border: 1px solid #999;
                border-radius: 3px;
                padding: 5px 20px;
                cursor: pointer;
                font-family: 'Tahoma', sans-serif;
                font-size: 12px;
            ">OK</button>
        `;
    }
    
    dialog.appendChild(header);
    dialog.appendChild(content);
    document.body.appendChild(dialog);
    
    // Add event listener to OK button
    const okButton = document.getElementById('dialog-ok');
    if (okButton) {
        okButton.addEventListener('click', closeXPDialog);
    }
}

function closeXPDialog() {
    const dialog = document.getElementById('xp-dialog');
    if (dialog) {
        dialog.remove();
    }
}

// Add Windows XP error sound - modified to require user interaction first
function playXPSound(type) {
    // Only play sounds after user has interacted with the page
    if (!document.documentElement.hasAttribute('data-user-interacted')) {
        console.log('Sound not played: waiting for user interaction');
        return;
    }
    
    const sounds = {
        error: 'https://www.101soundboards.com/storage/board_sounds_rendered/10835.mp3', // Windows XP Error sound
        success: 'https://www.101soundboards.com/storage/board_sounds_rendered/10834.mp3', // Windows XP Shutdown sound
        startup: 'https://www.101soundboards.com/storage/board_sounds_rendered/10833.mp3' // Windows XP Startup sound
    };
    
    if (sounds[type]) {
        const audio = new Audio(sounds[type]);
        audio.volume = 0.3; // Lower volume
        audio.play().catch(e => console.error('Error playing sound:', e));
    }
}

// Mark that user has interacted with the page
document.addEventListener('click', function() {
    if (!document.documentElement.hasAttribute('data-user-interacted')) {
        document.documentElement.setAttribute('data-user-interacted', 'true');
        console.log('User interaction detected, sounds enabled');
        // Now we can play the startup sound
        playXPSound('startup');
    }
});

// Remove automatic sound playing on load
// Instead, we'll play it after first user interaction
window.addEventListener('load', () => {
    console.log('Page loaded, waiting for user interaction before playing sounds');
});
