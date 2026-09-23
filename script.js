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

// АНИМАЦИЯ ПОЛЁТА В КОРЗИНУ ЧЕРЕЗ ФИКСИРОВАННЫЕ КООРДИНАТЫ
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        const id = card.dataset.id;
        const name = card.dataset.name;
        const price = parseInt(card.dataset.price);

        // --- БЕЗОТКАЗНЫЙ СКРИПТ ПОЛЁТА ЧЕК-ПОИНТОВ ---
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
            flyer.style.transform = 'scale(0.1) rotate(180deg)';
            flyer.style.opacity = '0';
        }, 30);
        
        setTimeout(() => { flyer.remove(); }, 700);

        const existingItem = cart.find(item => item.id === id);
        if(existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }

        updateCartUI();
    });
});

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
        itemElement.innerHTML = `<span>${item.name} (x${item.quantity})</span><span>${item.price * item.quantity} ₽</span>`;
        cartItemsList.appendChild(itemElement);
    });

    totalPriceElement.innerText = totalPrice + ' ₽';
}

// ПРОВЕРКА НА ПУСТОТУ И ОТПРАВКА НА PYTHON СЕРВЕР
orderForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // ПЛАШКА: ПРОВЕРКА НА ПУСТУЮ КОРЗИНУ
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
            alert('Заказ успешно оформлен! Проверьте ваш Telegram.');
            
            // Защита от автозаполнения — обнуляем всё до чистых строк
            cart = [];
            updateCartUI();
            orderForm.reset();
            document.getElementById('userName').value = '';
            document.getElementById('userPhone').value = '';
        } else {
            alert('Ошибка сервера при отправке заказа.');
        }
    } catch (error) {
        alert('Не удалось связаться с сервером Python! Проверьте окно cmd.');
    }
});
