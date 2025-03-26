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
});// कार्ट एक खाली एरे है जिसमें सभी चुने गए आइटम्स स्टोर होंगे
// इसे खाली करने से सारे सिलेक्ठेड आइटम्स गायब हो जाएंगे
// Initialize empty cart array to store selected items
// Each item will have: name, price, and quantity
let cart = [];

// Initialize total amount to 0
// This will be updated as items are added/removed
let total = 0;

// API endpoints for order submission and menu fetching
const API_URL = "https://raiguesthouse-orujgkxvc-raiguesthouses-projects-f2380489.vercel.app/submit-order";
const MENU_URL = "https://rai-guest-house-proxy-kkzhkqxan-raiguesthouses-projects.vercel.app/menu";

// showInitialWarning फंक्शन
// यह फंक्शन वेबसाइट पर एक महत्वपूर्ण सूचना दिखाता है
// जब यूजर पहली बार वेबसाइट खोलता है तब हह सूचना दिखाई देती है
// localStorage का उपयोग करके यह चेक किया जाता है कि यूजर ने पहले इस सूचना को देखा है या नहीं
function showInitialWarning() {
    // localStorage से चेक करें कि यूजर ने पहले सूचना को स्वीकार किया है या नहीं
    const agreed = localStorage.getItem('warningAgreed');
    if (!agreed) {
        // मॉडल एलयड बनाएं जो पूरी स्क्रीन पर दिखेगा
        const modal = document.createElement('div');
        
        // मॉडल का स्टाइल सेट करें - यह पूरी स्क्रीन पर फिक्स्ड रहेगा
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.right = '0';
        modal.style.bottom = '0';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // अर्ध-पारदर्शी काला बैकग्राउंड
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '99999'; // बह॥त ज्यादा z-index ताकि यह सबसे ऊपर दिखे

        // मॉडल का कंटेंट बॉक्स बनाएं जिसमें सूचना दिखेगी
        const modalContent = document.createElement('div');
        modalContent.style.backgroundColor = '#FFFBEB'; // हल्का पीला बैकग्राउंड
        modalContent.style.padding = '20px';
        modalContent.style.borderRadius = '8px'; // गोल कोने
        modalContent.style.maxWidth = '90%';
        modalContent.style.width = '400px';
        modalContent.style.margin = '20px';
        modalContent.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'; // हल्की शैडो
        modalContent.style.position = 'relative'; // रिलेटिव पोजिशन ताकि अंदर के एलिमेंट्स सही जगह पर रहें

        // मॉडल का HTML कंटेंट सेट करें - शीर्षक, सूचना और बटन
        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-size: 18px; color: #92400E;">जरूरी सूचना / Important Notice</h3>
                <button id="close-warning" style="border: none; background: none; font-size: 20px; cursor: pointer; color: #92400E; padding: 8px;">✕</button>
            </div>
            <div style="margin-bottom: 20px;">
                <p style="margin: 0 0 10px 0; color: #92400E; font-size: 14px;">कृपया सुनिश्चित करें / Please ensure:</p>
                <ul style="margin: 0 0 15px 20px; padding: 0; color: #92400E; font-size: 14px;">
                    <li style="margin-bottom: 5px">वही मोबाइल नंबर डालें जो check-in के समय दिया था</li>
                    <li style="margin-bottom: 5px">Enter the SAME mobile number you provided during check-in</li>
                    <li style="margin-bottom: 5px">सही रूम नंबर चुनें</li>
                    <li style="margin-bottom: 5px">Select your correct room number</li>
                </ul>
                <p style="margin: 0; color: #B91C1C; font-weight: 500; font-size: 14px;">
                    अगर ये details गलत होंगी तो आपका ऑर्डर process नहीं होगा<br>
                    Your order will NOT be processed if these details don't match
                </p>
            </div>
            <div style="text-align: right;">
                <button id="accept-warning" style="background-color: #92400E; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; font-size: 16px; transition: background-color 0.2s; -webkit-tap-highlight-color: transparent;">
                    समझ गया / I Understand
                </button>
            </div>
        `;

        // मॉडल को पेज पर जोड़ें
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // मॉडल को बंद करने के लिए फंक्शन - यह localStorage में सेट करेगा कि यूजर ने सूचना देख ली है
        const closeModal = () => {
            modal.remove();
            localStorage.setItem('warningAgreed', 'true');
        };

        // बटन्स के लिए वेरिएबल्स बनाएं
        const closeBtn = document.getElementById('close-warning');
        const acceptBtn = document.getElementById('accept-warning');

        // क्बोज बटन पर क्लिक और टच इवेंट्स जोड़ें - मोबाइल डिवाइस के लिए महत्वपूर्ण
        if (closeBtn) {
            ['click', 'touchend'].forEach(eventType => {
                closeBtn.addEventListener(eventType, function(e) {
                    e.preventDefault(); // डिफॉल्ट इवेंट को रोकें
                    e.stopPropagation(); // इवेंट को आगे बढ़ने से रोकें
                    closeModal();
                }, false);
            });
        }

        // स्वीकार बटन पर क्लिक और टच इवेंट्स जोड़ें - मोबाइल डिवाइस के लिए महत्वपूर्ण
        if (acceptBtn) {
            ['click', 'touchend'].forEach(eventType => {
                acceptBtn.addEventListener(eventType, function(e) {
                    e.preventDefault(); // डिफॉल्ट इवेंट को रोकें
                    e.stopPropagation(); // इवेंट को आगे बढ़ने से रोकें
                    closeModal();
                }, false);
            });
            
            // बटन को अधिक आकर्षक बनाएं
            acceptBtn.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            
            // होवर और एक्टिव स्टेट्स जोड़ें - बेहतर यूजर फीडबैक के लिए
            acceptBtn.addEventListener('mouseover', function() {
                this.style.backgroundColor = '#B45309'; // होवर पर गहरा रंग
            });
            
            acceptBtn.addEventListener('mouseout', function() {
                this.style.backgroundColor = '#92400E'; // सामान्त रंग
            });
            
            // टच स्क्रीन के लिए टचस्टार्ट इवेंट
            acceptBtn.addEventListener('touchstart', function() {
                this.style.backgroundColor = '#B45309'; // टच पर गहरा रंग
            });
        }
    }
}

// fetchMenu फंक्शन
// सर्वर से मेनू आइटम्स को फेच करता है
// अगर कोई एरर आता है तो एरर मैसेज दिखाता है
// In the fetchMenu function, remove the call to showInitialWarning()
async function fetchMenu() {
    try {
        // Remove this line:
        // showInitialWarning();
        
        // Add loading indicator
        const menuDiv = document.getElementById('menu-items');
        if (menuDiv) {
            menuDiv.innerHTML = `
                <div style="text-align: center; width: 100%; padding: 20px;">
                    <p style="color: #FFD700; font-size: 18px; margin-bottom: 10px;">Loading menu...</p>
                    <div style="display: inline-block; width: 50px; height: 50px; border: 5px solid #FFD700; 
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
                <div style="text-align: center; width: 100%; padding: 20px; background: rgba(128, 0, 0, 0.1); border-radius: 8px;">
                    <p style="color: #FFD700; font-size: 18px; margin-bottom: 10px;">
                        <i class="fas fa-wifi" style="margin-right: 8px;"></i>
                        Network connection is slow
                    </p>
                    <p style="color: #FFD700; font-size: 16px; margin-bottom: 15px;">
                        Please wait a moment and refresh the page
                    </p>
                    <button onclick="location.reload()" style="background: #800000; color: #FFD700; border: none; 
                                                              padding: 8px 16px; border-radius: 4px; cursor: pointer;">
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

// displayMenu फंक्शन
// मेनू आइटम्स को वेबसाइट पर दिखाता है
// हर कैटेगरी के लिए अलग सुक्शन बनाता है
// हर आइटम के साथ Add बटन दिखाता है
// कैटेगरी का कलर, साइज, स्पेसिंग यहीं से कंट्लो��ol होती है
function displayMenu(menuItems) {
    // Add background style to document body
    if (!document.querySelector('#pageBackground')) {
        const style = document.createElement('style');
        style.id = 'pageBackground';
        style.textContent = `
            body {
                background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
                          url('./background.jpg') no-repeat center center fixed;
                -webkit-background-size: cover;
                -moz-background-size: cover;
                -o-background-size: cover;
                background-size: cover;
                min-height: 100vh;
                color: white;
            }
            
            #menu-items {
                border-radius: 16px;
                padding: 20px;
                margin-top: 20px;
            }
        `;
        document.head.appendChild(style);
    }

    const menuDiv = document.getElementById('menu-items');
    menuDiv.innerHTML = '';
    menuDiv.style.maxWidth = '375px';
    menuDiv.style.margin = '20px auto';
    menuDiv.style.padding = '20px 10px';
    menuDiv.style.background = 'none'; // Remove dark background
    menuDiv.style.backdropFilter = 'none'; // Remove blur effect

    const groupedItems = {};
    menuItems.forEach(item => {
        if (!groupedItems[item.category]) {
            groupedItems[item.category] = [];
        }
        groupedItems[item.category].push(item);
    });

    // Create a flex container for ovals
    const categoriesWrapper = document.createElement('div');
    categoriesWrapper.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 20px;
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
        headerDiv.className = 'cursor-pointer rounded-full flex items-center justify-center';
        headerDiv.style.cssText = `
            width: 200px;
            height: 80px;
            transition: transform 0.3s ease;
            background: transparent;
            border: 2px solid #FFD700;
            border-radius: 40px;
            box-shadow: 
                0 0 10px rgba(255, 215, 0, 0.3),
                0 0 20px rgba(255, 215, 0, 0.2),
                0 0 30px rgba(255, 215, 0, 0.1);
            position: relative;
            z-index: 1;
        `;
        
        // Text styling update for better visibility
        headerDiv.innerHTML = `
            <div class="text-center p-2">
                <h2 style="
                    color: #FFD700;
                    font-size: 1rem;
                    font-weight: 600;
                    line-height: 1.2;
                    margin: 0;
                    word-break: break-word;
                    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
                ">
                    ${category}
                </h2>
            </div>
        `;
        
        // Add velvet shine animation
        if (!document.querySelector('#velvetShineAnimation')) {
            const style = document.createElement('style');
            style.id = 'velvetShineAnimation';
            style.textContent = `
                @keyframes velvetShine {
                    0%, 100% { 
                        filter: brightness(100%) saturate(100%);
                        box-shadow: 
                            0 6px 24px rgba(75, 0, 0, 0.6),
                            inset 0 3px 12px rgba(255, 255, 255, 0.15),
                            inset 0 -4px 12px rgba(0, 0, 0, 0.4),
                            0 0 0 2px #800000,
                            0 0 0 4px #FFD700,
                            0 0 0 6px #800000,
                            0 0 2px 6px rgba(128, 0, 0, 0.5),
                            0 0 4px 6px rgba(128, 0, 0, 0.3)
                    }
                    50% { 
                        filter: brightness(120%) saturate(110%);
                        box-shadow: 
                            0 6px 28px rgba(75, 0, 0, 0.7),
                            inset 0 3px 12px rgba(255, 255, 255, 0.2),
                            inset 0 -4px 12px rgba(0, 0, 0, 0.5),
                            0 0 0 2px #800000,
                            0 0 0 4px #FFD700,
                            0 0 0 6px #800000,
                            0 0 3px 6px rgba(128, 0, 0, 0.6),
                            0 0 5px 6px rgba(128, 0, 0, 0.4);
                    }
                }
            `;
            document.head.appendChild(style);
            headerDiv.style.animation = 'velvetShine 3s infinite';
        }
    
        // Content div styling updated
        const contentDiv = document.createElement('div');
        contentDiv.className = 'hidden mt-4 w-full';
        
        const itemsContainer = document.createElement('div');
        itemsContainer.style.cssText = `
            background: linear-gradient(145deg, #FFD700, #DAA520);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(218, 165, 32, 0.3);
            overflow: hidden;
        `;
        itemsContainer.className = 'divide-y divide-[#B8860B]';
        
        groupedItems[category].forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'p-3';
            itemDiv.style.cssText = `
                transition: all 0.3s ease;
                background: transparent;
            `;
            
            // Add hover effect through CSS
            const styleSheet = document.createElement('style');
            styleSheet.textContent = `
                .menu-item:hover {
                    background: rgba(255, 255, 0, 0.15);
                    box-shadow: 0 0 10px rgba(255, 255, 0, 0.3);
                }
            `;
            document.head.appendChild(styleSheet);
            itemDiv.classList.add('menu-item');

            itemDiv.innerHTML = `
                <div class="flex justify-between items-center">
                    <div class="flex-1 flex items-center">
                        <span class="text-sm font-medium block" style="color: #800000;">${item.name}</span>
                    </div>
                    <button onclick="addToCart('${item.name}', ${item.price})" 
                            class="bg-[#800000] text-[#FFD700] border-none px-3 py-1 rounded-md text-sm 
                                   hover:bg-[#A00000] hover:text-[#FFFF00] transition-all duration-300">
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

        // Click handler remains same
        headerDiv.addEventListener('click', () => {
            document.querySelectorAll('.category-section').forEach(section => {
                if (section !== categoryDiv) {
                    section.querySelector('div:nth-child(2)').classList.add('hidden');
                    section.querySelector('span').style.transform = '';
                }
            });
            
            contentDiv.classList.toggle('hidden');
            const arrow = headerDiv.querySelector('span');
            arrow.style.transform = contentDiv.classList.contains('hidden') ? '' : 'rotate(180deg)';
        });
    });
}

// Update cart styling too
function updateCart() {
    const cartDiv = document.getElementById('cart-items');
    cartDiv.innerHTML = '';
    
    if (cart.length === 0) {
        cartDiv.innerHTML = '<div class="text-base text-white text-center p-3">Your cart is empty</div>';
    } else {
        cart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'py-2 px-3 border-b border-gray-100 last:border-0';
            itemDiv.innerHTML = `
                <div class="flex justify-between items-center">
                    <div class="flex-1">
                        <span class="text-base font-bold text-white">${item.name}</span>
                        <div class="flex items-center mt-1">
                            <span class="text-sm text-white">Qty: ${item.quantity}</span>
                            <span class="text-base font-bold text-white ml-2">₹${item.price * item.quantity}</span>
                        </div>
                    </div>
                    <button onclick="removeFromCart('${item.name}', ${item.price})" 
                            class="text-red-500 text-sm px-2 py-1 hover:bg-red-50 rounded">
                        Remove
                    </button>
                </div>
            `;
            cartDiv.appendChild(itemDiv);
        });
    }

    // Update both total displays with dynamic color
    const totalDiv = document.getElementById('cart-total');
    const floatingTotal = document.getElementById('floating-total');
    const floatingTotalParent = floatingTotal.parentElement;
    
    if (totalDiv) {
        totalDiv.innerHTML = total;
    }
    if (floatingTotal) {
        floatingTotal.innerHTML = total;
        // Change color based on background
        const computedStyle = window.getComputedStyle(document.body);
        const backgroundColor = computedStyle.backgroundColor;
        
        if (backgroundColor.includes('rgba(255, 215, 0') || backgroundColor.includes('#FFD700')) {
            floatingTotalParent.style.color = '#800000'; // Dark maroon text for yellow background
        } else {
            floatingTotalParent.style.color = '#FFD700'; // Yellow text for dark background
        }
    }
}

// addToCart फंक्शन
// जब कोई Add बटन पर क्लिक करता है तो यह फंक्शन चलता है
// चेक करता है कि आइटम पहले से कार्ट में है या नहीं
// अगर है तो क्वांटिटी बढ़ाता है, नहीं तो नया आइटम एड करता है
// टोटल अमाउंट को अपडेट करता है
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

// removeFromCart फंक्शन
// Remove बटन पर क्��clिक करने पर चलता है
// आइटम की क्वांटिटी कम करता है
// अगर क्वांटिटी 0 हो जाती है तो आइटम को कार्ट से हटा देता है
// ���������� अमाउंट को अपडेट करता है
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

// submitOrder फंक्शन
// ऑर्डर बटन पर क्��clिक करने पर चलता है
// चेक करता है:
// - कार्ट खाली तो नहीं
// - रूम नंबर और मोबाइल नंबर भरे गए हैं या नहीं
// - टर्स एक्सेप्ट किए गए हैं या नहीं
// सब ठीक होने पर ऑर्डर को सर्वर पर भेजता है
// सक्सेस या एरर मैसेज दिखाता है
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

// इवेंट लिसनर
// ऑर्डर बटन पर क्��clिक इवेंट को सुनता है
// क्��clिक होने पर submitOrder फंक्शन को कॉल करता है
// Make sure DOM is loaded before adding event listener
document.addEventListener('DOMContentLoaded', function() {
    // Fix: Check for both possible button IDs
    const submitButton = document.getElementById('submit-order') || document.querySelector('button:contains("Place Order")');
    
    // If button still not found, try to find by text content
    if (!submitButton) {
        const allButtons = document.querySelectorAll('button');
        for (let btn of allButtons) {
            if (btn.textContent.trim().includes('Place Order')) {
                btn.id = 'submit-order'; // Add ID to the button
                btn.addEventListener('click', submitOrder);
                console.log('Found and attached event to Place Order button');
                break;
            }
        }
    } else {
        submitButton.addEventListener('click', submitOrder);
        console.log('Event attached to submit-order button');
    }
});

// वेबसाइट लोड होते ही fetchMenu फंक्शन को कॉल करता है
// इससे मेनू आइटम्स तुरंत लोड हो जाते हैं
fetchMenu();


// Replace with just
document.addEventListener('DOMContentLoaded', fetchMenu);

// Add this function after the displayMenu function
function styleVisitButton() {
    // "Places to visit in Ujjain" बटन को स्टाइल करने के लिए फंक्शन
    // इस फंक्शन का उद्देश्य है सभी लिंक्स को ढूंढना और उन्हें स्टाइल करना
    const visitLinks = document.querySelectorAll('a');
    
    visitLinks.forEach(link => {
        if (link.textContent.includes('Places to visit in Ujjain') || 
            link.textContent.includes('Places to Visit in Ujjain')) {
            
            // पुराने लिंक की जगह नया बटन बनाना
            // यह पुराने टेक्स्अड को हटाकर स्टाइल किया हुआ बटन दिखाएगा
            const button = document.createElement('a');
            button.href = link.href;
            button.textContent = 'Places to Visit in Ujjain'; // बटन पर दिखने वाला टेक्स्अड - इसे बदल सकते हैं
            button.target = '_blank'; // नए टैब में खुलेगा - इसे '_self' में बदल सकते हैं अगर उसी टैब में खोलना है
            
            // बटन का स्टाइल - इन सभी प्रॉपर्टीज को अपने हिसाब से बदल सकते हैं
            button.style.display = 'inline-block';
            button.style.backgroundColor = '#800000'; // बटन का बैकग्राउंड कलर - मरून कलर है, इसे बदल सकते हैं
            button.style.color = '#FFD700'; // बटन का टेक्स्अड कलर - गोल्डन कलर है, इसे बदल सकते हैं
            button.style.padding = '8px 16px'; // बटन का पैडिंग - इसे बढ़ा या घटा सकते हैं
            button.style.borderRadius = '8px'; // बटन के कोनों का गोलापन - इसे बदल सकते हैं
            button.style.textDecoration = 'none'; // अंडरलाइन हटाने के लिए
            button.style.fontWeight = 'bold'; // टेक्स्अड को बोल्ड करने के लिए
            button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)'; // बटन की शैडो - इसे बदल सकते हैं
            button.style.margin = '10px 0'; // बटन के चारों ओर स्पेस
            button.style.transition = 'all 0.3s ease'; // एनिमेशन इफेक्ट के लिए
            button.style.fontSize = '14px'; // फॉन्ट साइज - इसे बदल सकते हैं
            button.style.textAlign = 'center'; // टेक्स्अलाइनमेंट
            button.style.width = 'auto'; // बटन की चौड़ाई
            
            // होवर इफेक्ट - जब माउस बटन पर जाए तो क्या होगा
            // इन प्रॉपर्टीज को भी अपने हिसाब से बदल सकते हैं
            button.onmouseover = function() {
                this.style.backgroundColor = '#A00000'; // होवर पर बैकग्राउंड कलर - इसे बदल सकते हैं
                this.style.transform = 'translateY(-2px)'; // होवर पर बटन थोड़ा ऊपर उठेगा
                this.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4)'; // होवर पर शैडो बड़ी होगी
            };
            
            // माउस टाने पर बटन वापस नॉर्मल हो जाएगा
            button.onmouseout = function() {
                this.style.backgroundColor = '#800000'; // नॉर्मल बैकग्राउंड कलर
                this.style.transform = 'translateY(0)'; // नॉर्मल पोजीशन
                this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)'; // नॉर्मल शैडो
            };
            
            // पुराने लिंक को नए बटन से रिप्लेस करना
            // यह लाइन सबसे महत्वपूर्ण है - यह पुराने टेक्स्अड को हटाकर नया बटन दिखाएगी
            link.parentNode.replaceChild(button, link);
        }
    });
}

// DOMContentLoaded इवेंट पर इस फंक्शन को कॉल करना
// यह सुनिश्चित करता है कि पेज लोड होने के बाद ही बटन स्टाइल हो
document.addEventListener('DOMContentLoaded', () => {
    fetchMenu();
    
    // थोड़ा डिले देना ताकि सभी एलिमेंट्स लोड हो जाएं
    // अगर बटन तुरंत नहीं दिखता है तो इस टाइम को बढ़ा सकते हैं (जैसे 2000 या 3000)
    setTimeout(styleVisitButton, 1000);
    
    // Style the input fields for room number and mobile number
    const roomNumberInput = document.getElementById('room-number');
    const mobileNumberInput = document.getElementById('mobile-number');
    
    if (roomNumberInput) {
        roomNumberInput.style.backgroundColor = '#FFFBEB'; // Light golden background
        roomNumberInput.style.borderColor = '#FFD700'; // Golden border
        roomNumberInput.style.color = '#800000'; // Maroon text
        roomNumberInput.style.boxShadow = '0 0 5px rgba(255, 215, 0, 0.3)'; // Subtle golden glow
    }
    
    if (mobileNumberInput) {
        mobileNumberInput.style.backgroundColor = '#FFFBEB'; // Light golden background
        mobileNumberInput.style.borderColor = '#FFD700'; // Golden border
        mobileNumberInput.style.color = '#800000'; // Maroon text
        mobileNumberInput.style.boxShadow = '0 0 5px rgba(255, 215, 0, 0.3)'; // Subtle golden glow
    }
    
    // Add focus effect for better user experience
    const styleInputs = (input) => {
        if (!input) return;
        
        input.addEventListener('focus', () => {
            input.style.backgroundColor = '#FFF8E1'; // Slightly different color on focus
            input.style.boxShadow = '0 0 8px rgba(255, 215, 0, 0.5)'; // Enhanced glow on focus
            input.style.borderColor = '#DAA520'; // Darker gold on focus
        });
        
        input.addEventListener('blur', () => {
            input.style.backgroundColor = '#FFFBEB'; // Back to original color
            input.style.boxShadow = '0 0 5px rgba(255, 215, 0, 0.3)'; // Back to original shadow
            input.style.borderColor = '#FFD700'; // Back to original border
        });
    };
    
    styleInputs(roomNumberInput);
    styleInputs(mobileNumberInput);
});
