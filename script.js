const TELEGRAM_BOT_TOKEN = '8609189640:AAGRBaOHTqVUNETHHwdpZ8AfK8SenkUjpl4'; 
const TELEGRAM_CHAT_ID = '1344498721';

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

// ДОБАВЛЕНИЕ В КОРЗИНУ
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

// АВТОМАТИЧЕСКАЯ ОТПРАВКА БОТОМ И КРАСИВАЯ АНИМАЦИЯ
orderForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Полностью блокируем любые переходы по ссылкам и ошибки серверов

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

    const encodedMessage = encodeURIComponent(message);

    // Сверхнадежный метод отправки боту через создание системного элемента (без CORS и IP ошибок)
    const tgUrl = `https://telegram.org{TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodedMessage}&parse_mode=HTML`;
    const pingImg = new Image();
    pingImg.src = tgUrl;

    // Мгновенно убираем корзину с экрана покупателя
    closeCart();

    // Создаем и плавно выводим красивое уведомление в стиле Apple сверху
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div id="appleNotification" style="
            position: fixed; top: -100px; left: 50%; transform: translateX(-50%);
            background: #1d1d1f; color: #fff; padding: 14px 28px;
            border-radius: 20px; font-weight: 500; font-size: 14px;
            box-shadow: 0 12px 30px rgba(0,0,0,0.15);
            z-index: 9999; display: flex; align-items: center; gap: 10px;
            transition: top 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        ">
            <i class="fas fa-check-circle" style="color: #34c759;"></i> Заказ успешно оформлен! Мы свяжемся с вами.
        </div>
    `;
    
    const notificationNode = notification.firstElementChild;
    document.body.appendChild(notificationNode);

    // Мягкое появление плашки сверху через 100мс
    setTimeout(() => { notificationNode.style.top = '24px'; }, 100);

    // Плавное исчезновение плашки через 4 секунды
    setTimeout(() => {
        notificationNode.style.top = '-100px';
        setTimeout(() => notificationNode.remove(), 4000);
    }, 4000);

    // Очищаем внутренности корзины для следующего заказа
    cart = [];
    updateCartUI();
    orderForm.reset();
});
