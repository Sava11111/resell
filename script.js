const TELEGRAM_USERNAME = 'kvasmennn';

let cart = [];

const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeModal = document.querySelector('.close-modal');
const cartCount = document.getElementById('cartCount');
const cartItemsList = document.getElementById('cartItemsList');
const totalPriceElement = document.getElementById('totalPrice');
const orderForm = document.getElementById('orderForm');

// 1. ФИЛЬТР КАТЕГОРИЙ
const filterButtons = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
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

// 2. FAQ АККОРДЕОН
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item.active').forEach(openItem => openItem.classList.remove('active'));
        if (!isActive) item.classList.add('active');
    });
});

// 3. УПРАВЛЕНИЕ КОРЗИНОЙ
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
        button.style.background = '#34c759';
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

// 4. НАДЕЖНАЯ ОТПРАВКА БЕЗ БЛОКИРОВОК И ОШИБОК
orderForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('userName').value;
    const phone = document.getElementById('userPhone').value;

    // Генерируем красивый текст сообщения
    let message = `🔔 Новый заказ с сайта!\n\n`;
    message += `👤 Имя: ${name}\n`;
    message += `📞 Телефон: ${phone}\n\n`;
    message += `📦 Товары:\n`;
    
    cart.forEach(item => {
        message += `• ${item.name} (x${item.quantity}) — ${item.price * item.quantity} ₽\n`;
    });
    
    message += `\n💰 Итого: ${totalPriceElement.innerText}`;

    const encodedMessage = encodeURIComponent(message);
    const tgUrl = `https://t.me{TELEGRAM_USERNAME}?text=${encodedMessage}`;

    // Сворачиваем модальное окно
    closeCart();

    // Показываем зеленую всплывающую плашку сверху экрана
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="
            position: fixed; top: -100px; left: 50%; transform: translateX(-50%);
            background: #34c759; color: #fff; padding: 16px 32px;
            border-radius: 30px; font-weight: 600; font-size: 15px;
            box-shadow: 0 10px 25px rgba(52, 199, 89, 0.3);
            z-index: 9999; display: flex; align-items: center; gap: 10px;
            transition: top 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        ">
            <i class="fas fa-check-circle"></i> Заказ сформирован! Перенаправляем в Telegram...
        </div>
    `;
    
    const notificationNode = notification.firstElementChild;
    document.body.appendChild(notificationNode);

    // Плашка выплывает сверху
    setTimeout(() => { notificationNode.style.top = '30px'; }, 100);

    // Через 1.5 секунды открываем Telegram с готовым сообщением
    setTimeout(() => {
        window.open(tgUrl, '_blank');
    }, 1500);

    // Через 4 секунды плашка улетает назад
    setTimeout(() => {
        notificationNode.style.top = '-100px';
        setTimeout(() => notificationNode.remove(), 500);
    }, 4000);

    // Сброс корзины
    cart = [];
    updateCartUI();
    orderForm.reset();
});
