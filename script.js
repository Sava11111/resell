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

// 4. НАДЕЖНАЯ ОТПРАВКА В TELEGRAM (БЕЗ СКРЫТЫХ ЗАПРОСОВ)
orderForm.addEventListener('submit', function(e) {
    // Мы НЕ отменяем действие по умолчанию, позволяя форме отправиться через HTML
    const name = document.getElementById('userName').value;
    const phone = document.getElementById('userPhone').value;

    // Собираем текст сообщения
    let message = `🔔 Новый заказ с сайта!\n\nИмя: ${name}\nТелефон: ${phone}\n\nТовары:\n`;
    cart.forEach(item => {
        message += `• ${item.name} (x${item.quantity}) — ${item.price * item.quantity} ₽\n`;
    });
    message += `\nИтого: ${totalPriceElement.innerText}`;

    // Создаем скрытое поле внутри формы, чтобы передать текст в Telegram
    let hiddenText = document.getElementById('tgHiddenText');
    if (!hiddenText) {
        hiddenText = document.createElement('input');
        hiddenText.type = 'hidden';
        hiddenText.name = 'text';
        hiddenText.id = 'tgHiddenText';
        orderForm.appendChild(hiddenText);
    }
    hiddenText.value = message;
    
    // Очищаем корзину перед уходом со страницы
    cart = [];
    updateCartUI();
});
