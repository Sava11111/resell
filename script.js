const TELEGRAM_BOT_TOKEN = '8609189640:AAGRBaOHTqVUNETHHwdpZ8AfK8SenkUjpl4'; 
const TELEGRAM_CHAT_ID = '1344498721';

let cart = [];

// DOM Элементы
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeModal = document.querySelector('.close-modal');
const cartCount = document.getElementById('cartCount');
const cartItemsList = document.getElementById('cartItemsList');
const totalPriceElement = document.getElementById('totalPrice');
const orderForm = document.getElementById('orderForm');

// 1. ДИНАМИЧЕСКИЙ ФИЛЬТР КАТЕГОРИЙ
const filterButtons = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Меняем активную кнопку
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');

        const filterValue = btn.dataset.filter;

        productCards.forEach(card => {
            if (filterValue === 'all' || card.dataset.category === filterValue) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

// 2. ИНТЕРАКТИВНЫЙ FAQ (АККОРДЕОН)
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Закрываем другие открытые вкладки FAQ
        document.querySelectorAll('.faq-item.active').forEach(openItem => openItem.classList.remove('active'));
        // Тогглим текущую
        if (!isActive) item.classList.add('active');
    });
});

// 3. ЛОГИКА КОРЗИНЫ
cartBtn.addEventListener('click', () => {
    cartModal.style.display = 'flex';
    setTimeout(() => cartModal.classList.add('active'), 10);
});

const closeCart = () => {
    cartModal.classList.remove('active');
    setTimeout(() => cartModal.style.display = 'none', 300);
};

closeModal.addEventListener('click', closeCart);
window.addEventListener('click', (e) => { if(e.target === cartModal) closeCart(); });

document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        const id = card.dataset.id;
        const name = card.dataset.name;
        const price = parseInt(card.dataset.price);

        const existingItem = cart.find(item => item.id === id);
        if(existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }

        updateCartUI();
        
        button.innerText = 'Добавлено';
        button.style.background = '#34c759'; // Зеленый цвет успешного добавления
        setTimeout(() => {
            button.innerText = 'В корзину';
            button.style.background = '#1d1d1f';
        }, 800);
    });
});

function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalCount;
    cartItemsList.innerHTML = '';

    if(cart.length === 0) {
        cartItemsList.innerHTML = '<p class="empty-text">В корзине пока ничего нет</p>';
        totalPriceElement.innerText = '0 ₽';
        return;
    }

    let totalPrice = 0;
    cart.forEach(item => {
        totalPrice += item.price * item.quantity;
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
            <span>${item.name} × ${item.quantity}</span>
            <span>${item.price * item.quantity} ₽</span>
        `;
        cartItemsList.appendChild(itemElement);
    });

    totalPriceElement.innerText = `${totalPrice} ₽`;
}

// 4. ФУНКЦИОНАЛ ОТПРАВКИ В TELEGRAM ЧЕРЕЗ БОТА
orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('userName').value;
    const phone = document.getElementById('userPhone').value;

    // Формируем красивый текст сообщения
    let message = `🔔 <b>Новый заказ с сайта!</b>\n\n`;
    message += `👤 <b>Имя:</b> ${name}\n`;
    message += `📞 <b>Телефон:</b> ${phone}\n\n`;
    message += `📦 <b>Товары:</b>\n`;
    
    cart.forEach(item => {
        message += `• ${item.name} (x${item.quantity}) — ${item.price * item.quantity} ₽\n`;
    });
    
    message += `\n💰 <b>Итого:</b> ${totalPriceElement.innerText}`;

    // Отправка запроса в Telegram API
    try {
        const response = await fetch(`https://telegram.org{TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });

        if (response.ok) {
            alert(`Спасибо за заказ, ${name}! Мы уже получили вашу заявку и свяжемся с вами в ближайшее время.`);
            cart = [];
            updateCartUI();
            orderForm.reset();
            closeCart();
        } else {
            alert('Произошла ошибка при отправке. Проверьте настройки токена бота.');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось связаться с сервером Telegram. Проверьте интернет-соединение.');
    }
});
