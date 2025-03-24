// कार्ट एक खाली एरे है जिसमें सभी चुने गए आइटम्स स्टोर होंगे
// इसे खाली करने से सारे सिलेक्ठेड आइटम्स गायब हो जाएंगे
let cart = [];

// टोटल वैरिएबल में कार्ट का कुल बिल स्टोर होता है
// इसे 0 करने से टोटल अमाउंट रीसेट हो जाएगा
let total = 0;

// ये दो URLs हैं जो सर्वर से कनेक्ट करने के लिए उपयोग होते हैं
// API_URL: ऑर्डर भेजने के लिए
// MENU_URL: मेनू आइटम्स लाने के लिए
// इन्हें बदलने से वेबसाइट काम नहीं करेगी
const API_URL = "https://rai-guest-house-proxy-kkzhkqxan-raiguesthouses-projects.vercel.app/submit-order";
const MENU_URL = "https://rai-guest-house-proxy-kkzhkqxan-raiguesthouses-projects.vercel.app/menu";

// showInitialWarning फंक्शन
// यह फंक्शन वेबसाइट खुलते ही एक वॉर्निंग मैसेज दिखाता है
// localStorage में 'warningAgreed' चेक करता है - अगर पहले से agreed है तो वॉर्निंग नहीं दिखेगी
// हिंदी और इंग्लिश दोनों में मैसेज दिखाता है
// OK क्लिक करने पर localStorage में 'warningAgreed' सेट हो जाता है
// Remove the old warning function and replace with this new one
function showInitialWarning() {
    const agreed = localStorage.getItem('warningAgreed');
    if (!agreed) {
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.right = '0';
        modal.style.bottom = '0';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';

        const modalContent = document.createElement('div');
        modalContent.style.backgroundColor = '#FFFBEB'; // Warm yellow background
        modalContent.style.padding = '20px';
        modalContent.style.borderRadius = '8px';
        modalContent.style.maxWidth = '90%';
        modalContent.style.width = '400px';
        modalContent.style.margin = '20px';
        modalContent.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-size: 18px; color: #92400E;">जरूरी सूचना / Important Notice</h3>
                <button id="close-warning" style="border: none; background: none; font-size: 20px; cursor: pointer; color: #92400E;">✕</button>
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
                <button id="accept-warning" style="background-color: #92400E; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px; transition: background-color 0.2s;">
                    समझ गया / I Understand
                </button>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        const closeModal = () => {
            modal.remove();
            localStorage.setItem('warningAgreed', 'true');
        };

        document.getElementById('close-warning').onclick = closeModal;
        document.getElementById('accept-warning').onclick = closeModal;
    }
}

// fetchMenu फंक्शन
// सर्वर से मेनू आइटम्स को फेच करता है
// अगर कोई एरर आता है तो एरर मैसेज दिखाता है
// सफल होने पर displayMenu फंक्शन को कॉल करता है
async function fetchMenu() {
    try {
        showInitialWarning();
        const response = await fetch(MENU_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
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

// displayMenu फंक्शन
// मेनू आइटम्स को वेबसाइट पर दिखाता है
// हर कैटेगरी के लिए अलग सुक्शन बनाता है
// हर आइटम के साथ Add बटन दिखाता है
// कैटेगरी का कलर, साइज, स्पेसिंग यहीं से कंट्रोल होती है
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
        categoryDiv.className = 'category-section mb-1.5 bg-white border-b border-gray-100';
        
        // Modernized header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'cursor-pointer p-2.5 hover:bg-gray-50 transition-colors duration-200';
        headerDiv.innerHTML = `
            <div class="flex justify-between items-center">
                <h2 class="text-base font-semibold text-gray-800">
                    ${category}
                </h2>
                <span class="text-gray-400 text-sm transform transition-transform duration-200">▼</span>
            </div>
        `;

        // Swiggy-like content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'hidden';
        
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'divide-y divide-gray-100';
        
        groupedItems[category].forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'p-3 hover:bg-gray-50';
            itemDiv.innerHTML = `
                <div class="flex justify-between items-center">
                    <div class="flex-1">
                        <span class="text-sm font-medium text-gray-800 block">${item.name}</span>
                    </div>
                    <button onclick="addToCart('${item.name}', ${item.price})" 
                            class="bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100 
                                   text-green-600 font-medium px-3 py-1 rounded-md text-sm">
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
        cartDiv.innerHTML = '<div class="text-sm text-gray-500 text-center p-3">Your cart is empty</div>';
    } else {
        cart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'py-2 px-3 border-b border-gray-100 last:border-0';
            itemDiv.innerHTML = `
                <div class="flex justify-between items-center">
                    <div class="flex-1">
                        <span class="text-sm font-medium text-gray-800">${item.name}</span>
                        <div class="flex items-center mt-1">
                            <span class="text-xs text-gray-500">Qty: ${item.quantity}</span>
                            <span class="text-sm font-medium text-gray-800 ml-2">₹${item.price * item.quantity}</span>
                        </div>
                    </div>
                    <button onclick="removeFromCart('${item.name}', ${item.price})" 
                            class="text-red-500 text-xs px-2 py-1 hover:bg-red-50 rounded">
                        Remove
                    </button>
                </div>
            `;
            cartDiv.appendChild(itemDiv);
        });
    }

    const totalDiv = document.getElementById('cart-total');
    if (totalDiv) {
        totalDiv.className = 'text-base font-semibold text-gray-800 p-3 border-t border-gray-200 bg-gray-50';
        totalDiv.innerHTML = `Total Amount: ₹${total}`;
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
// Remove बटन पर क्लिक करने पर चलता है
// आइटम की क्वांटिटी कम करता है
// अगर क्वांटिटी 0 हो जाती है तो आइटम को कार्ट से हटा देता है
// टोटल अमाउंट को अपडेट करता है
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
// ऑर्डर बटन पर क्लिक करने पर चलता है
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
// ऑर्डर बटन पर क्लिक इवेंट को सुनता है
// क्लिक होने पर submitOrder फंक्शन को कॉल करता है
document.getElementById('submit-order').addEventListener('click', submitOrder);

// वेबसाइट लोड होते ही fetchMenu फंक्शन को कॉल करता है
// इससे मेनू आइटम्स तुरंत लोड हो जाते हैं
fetchMenu();


function updateRestaurantStatus() {
    const statusDiv = document.createElement('div');
    statusDiv.className = 'bg-yellow-100 p-4 rounded-lg shadow-sm mb-4 text-center';
    statusDiv.innerHTML = `
        <p class="text-lg font-semibold text-yellow-800">
          <strong>  🕙 Restaurant Hours / रेस्टोरेंट का समय
        </p>
        <p class="text-md text-yellow-700">
            Full Menu: 10:00 AM - 11:00 PM / पूरा मेन्यू: सुबह 10:00 - रात 11:00
        </p>
        <p class="text-md text-yellow-700">
            Beverages Only: 10:0 AM - 1:00 AM / सिर्फ पेय पदार्थ: सुबह 10:00 - रात 1:00 </strong>
        </p>
    `;
    
    const menuDiv = document.getElementById('menu-items');
    menuDiv.parentNode.insertBefore(statusDiv, menuDiv);
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateRestaurantStatus();
    fetchMenu();
});
