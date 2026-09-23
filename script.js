let cart = [];

const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeModal = document.querySelector('.close-modal');
const cartCount = document.getElementById('cartCount');
const cartItemsList = document.getElementById('cartItemsList');
const totalPriceElement = document.getElementById('totalPrice');
const orderForm = document.getElementById('orderForm');

cartBtn.addEventListener('click', () => cartModal.classList.add('active'));
const closeCart = () => cartModal.classList.remove('active');
closeModal.addEventListener('click', closeCart);
window.addEventListener('click', (e) => { if(e.target === cartModal) closeCart(); });

// МЕДЛЕННЫЙ ПОЛЁТ И ДОБАВЛЕНИЕ
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        const id = card.dataset.id;
        const name = card.dataset.name;
        const price = parseInt(card.dataset.price);

        const iconBox = card.querySelector('.card-icon-box');
        const flyer = document.createElement('div');
        flyer.classList.add('flying-item');
        flyer.innerText = '🎧';
        
        const boxRect = iconBox.getBoundingClientRect();
        const btnRect = cartBtn.getBoundingClientRect();
        
        flyer.style.left = boxRect.left + 15 + 'px';
        flyer.style.top = boxRect.top + 15 + 'px';
        document.body.appendChild(flyer);
        
        setTimeout(() => {
            flyer.style.left = btnRect.left + 10 + 'px';
            flyer.style.top = btnRect.top + 10 + 'px';
            flyer.style.transform = 'scale(0.05) rotate(270deg)';
            flyer.style.opacity = '0';
        }, 50);
        
        setTimeout(() => { flyer.remove(); }, 950);

        const existingItem = cart.find(item => item.id === id);
        if(existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }

        updateCartUI();
    });
});

// ИНТЕРАКТИВНОЕ ИЗМЕНЕНИЕ КОЛИЧЕСТВА И УДАЛЕНИЕ ИЗ КОРЗИНЫ
function changeQuantity(id, delta) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== id);
        }
    }
    updateCartUI();
}

function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalCount;
    cartItemsList.innerHTML = '';

    if(cart.length === 0) {
        cartItemsList.innerHTML = '<p class="empty-text">В корзине пусто</p>';
        totalPriceElement.innerText = '0 ₽';
        return;
    }

    let totalPrice = 0;
    cart.forEach(item => {
        totalPrice += item.price * item.quantity;
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <br><span style="color:#6e6e73">${item.price * item.quantity} ₽</span>
            </div>
            <div class="cart-item-controls">
                <button class="btn-qty" onclick="changeQuantity('${item.id}', -1)">-</button>
                <span>${item.quantity}</span>
                <button class="btn-qty" onclick="changeQuantity('${item.id}', 1)">+</button>
                <button class="btn-remove" onclick="removeItem('${item.id}')">Удалить</button>
            </div>
        `;
        cartItemsList.appendChild(itemElement);
    });

    totalPriceElement.innerText = totalPrice + ' ₽';
}

// ПРОВЕРКА НА ПУСТОТУ И JSON-ОТПРАВКА НА PYTHON В ОДИН КЛИК
orderForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // ПЛАШКА ПРЕДУПРЕЖДЕНИЯ ЕСЛИ КОРЗИНА ПУСТА
    if (cart.length === 0) {
        alert('Ваша корзина пуста! Добавьте наушники перед оформлением заказа.');
        return;
    }

    const name = document.getElementById('userName').value;
    const phone = document.getElementById('userPhone').value;

    let itemsText = '';
    cart.forEach(item => {
        itemsText += `• ${item.name} (x${item.quantity}) — ${item.price * item.quantity} ₽\n`;
    });

    const payload = {
        name: name,
        phone: phone,
        items: itemsText,
        total: totalPriceElement.innerText
    };

    try {
        const response = await fetch('http://localhost:5000/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            closeCart();
            alert('Заказ успешно оформлен! Чек отправлен вам в Telegram.');
            
            // Начисто сбрасываем корзину и поля от автозаполнения
            cart = [];
            updateCartUI();
            orderForm.reset();
            document.getElementById('userName').value = '';
            document.getElementById('userPhone').value = '';
        } else {
            alert('Ошибка сервера Python при пересылке.');
        }
    } catch (error) {
        alert('Не удалось связаться с сервером Python! Убедитесь, что запущен скрипт server.py.');
    }
});
