const TELEGRAM_USERNAME = 'ТВОЙ_ЛОГИН_В_ТЕЛЕГРАМ';

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
closeModal.addEventListener('click', () => cartModal.classList.remove('active'));
window.addEventListener('click', (e) => { if(e.target === cartModal) cartModal.classList.remove('active'); });

// БЕЗОШИБОЧНОЕ ДОБАВЛЕНИЕ В КОРЗИНУ
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
        
        // Быстрый отклик кнопки
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

// СВЕРХНАДЕЖНАЯ ОТПРАВКА ЗАКАЗА БЕЗ ОШИБОК СЕТИ
orderForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('userName').value;
    const phone = document.getElementById('userPhone').value;

    let message = `🔔 Новый заказ с сайта!\n\n`;
    message += `👤 Имя: ${name}\n`;
    message += `📞 Телефон: ${phone}\n\n`;
    message += `📦 Товары:\n`;
    
    cart.forEach(item => {
        message += `• ${item.name} (x${item.quantity}) — ${item.price * item.quantity} ₽\n`;
    });
    
    message += `\n💰 Итого к оплате: ${totalPriceElement.innerText}`;

    const encodedMessage = encodeURIComponent(message);
    const tgUrl = `https://t.me{TELEGRAM_USERNAME}?text=${encodedMessage}`;

    // Закрываем окно
    cartModal.classList.remove('active');

    // Открываем Telegram с готовым текстом
    window.open(tgUrl, '_blank');

    // Мгновенная очистка корзины
    cart = [];
    updateCartUI();
    orderForm.reset();
});
