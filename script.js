let cart = [];

const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeModal = document.querySelector('.close-modal');
const cartCount = document.getElementById('cartCount');
const cartItemsList = document.getElementById('cartItemsList');
const totalPriceElement = document.getElementById('totalPrice');
const orderForm = document.getElementById('orderForm');

// Открытие и закрытие корзины
cartBtn.addEventListener('click', () => cartModal.classList.add('active'));
const closeCart = () => cartModal.classList.remove('active');
closeModal.addEventListener('click', closeCart);
window.addEventListener('click', (e) => { if(e.target === cartModal) closeCart(); });

// АНИМАЦИЯ ПОЛЁТА И ДОБАВЛЕНИЕ В КОРЗИНУ
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        const id = card.dataset.id;
        const name = card.dataset.name;
        const price = parseInt(card.dataset.price);

        // --- ЛОГИКА АНИМАЦИИ ПОЛЁТА ---
        const iconElement = card.querySelector('.card-icon-box i');
        const iconClone = iconElement.cloneNode(true);
        
        const cardRect = iconElement.getBoundingClientRect();
        const cartRect = cartBtn.getBoundingClientRect();
        
        iconClone.classList.add('flying-icon');
        iconClone.style.left = `${cardRect.left}px`;
        iconClone.style.top = `${cardRect.top}px`;
        document.body.appendChild(iconClone);
        
        setTimeout(() => {
            iconClone.style.left = `${cartRect.left + 10}px`;
            iconClone.style.top = `${cartRect.top + 10}px`;
            iconClone.style.transform = 'scale(0.2) rotate(360deg)';
            iconClone.style.opacity = '0.2';
        }, 10);
        
        setTimeout(() => { iconClone.remove(); }, 800);
        // --- КОНЕЦ АНИМАЦИИ ---

        const existingItem = cart.find(item => item.id === id);
        if(existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }

        updateCartUI();
        
        button.innerText = 'Добавлено';
        button.style.color = '#34c759';
        setTimeout(() => {
            button.innerText = 'В корзину';
            button.style.color = '#0071e3';
        }, 800);
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
        itemElement.innerHTML = `
            <span>${item.name} (x${item.quantity})</span>
            <span>${item.price * item.quantity} ₽</span>
        `;
        cartItemsList.appendChild(itemElement);
    });

    totalPriceElement.innerText = `${totalPrice} ₽`;
}

// ОТПРАВКА НА ЛОКАЛЬНЫЙ PYTHON СЕРВЕР (БЕЗ ПЕРЕХОДОВ НА САЙТЫ ТГ)
orderForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('userName').value;
    const phone = document.getElementById('userPhone').value;

    let message = `🔔 <b>Новый заказ с сайта!</b>\n\n`;
    message += `👤 <b>Имя:</b> ${name}\n`;
    message += `📞 <b>Телефон:</b> ${phone}\n\n`;
    message += `📦 <b>Товары:</b>\n`;
    cart.forEach(item => {
        message += `• ${item.name} (x${item.quantity}) — ${item.price * item.quantity} ₽\n`;
    });
    message += `\n💰 <b>Итого к оплате:</b> ${totalPriceElement.innerText}`;

    try {
        // Шлем скрытый запрос на питоновский сервер на твоем компе
        const response = await fetch('http://localhost:5000/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: message })
        });

        if (response.ok) {
            closeCart();
            
            // Всплывающая плашка успеха сверху экрана
            const notification = document.createElement('div');
            notification.innerHTML = `
                <div style="position: fixed; top: -100px; left: 50%; transform: translateX(-50%); background: #1c1c1e; color: #fff; padding: 14px 28px; border-radius: 20px; font-weight: 500; font-size: 14px; box-shadow: 0 12px 30px rgba(0,0,0,0.3); z-index: 9999; display: flex; align-items: center; gap: 10px; transition: top 0.4s cubic-bezier(0.25, 1, 0.5, 1); border: 1px solid rgba(255,255,255,0.05);">
                    <i class="fas fa-check-circle" style="color: #34c759;"></i> Заказ успешно оформлен!
                </div>
            `;
            const node = notification.firstElementChild;
            document.body.appendChild(node);
            setTimeout(() => { node.style.top = '24px'; }, 100);
            setTimeout(() => { node.style.top = '-100px'; setTimeout(() => node.remove(), 500); }, 4000);

            cart = [];
            updateCartUI();
            orderForm.reset();
        } else {
            alert('Ошибка сервера Python при пересылке.');
        }
    } catch (error) {
        alert('Не удалось связаться с сервером Python! Убедитесь, что запущен скрипт server.py в командной строке.');
    }
});
