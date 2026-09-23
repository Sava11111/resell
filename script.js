// ==========================================
// НАСТРОЙКА TELEGRAM БОТА 
// Вставь свои данные строго внутри одинарных кавычек ''
// ==========================================
const TELEGRAM_BOT_TOKEN = 'СЮДА_ВСТАВИТЬ_ТОКЕН_БОТА'; 
const TELEGRAM_CHAT_ID = 'СЮДА_ВСТАВИТЬ_ТВОЙ_ID_ЧАТА';

// Переменная для хранения товаров в корзине
let cart = [];

// DOM Элементы интерфейса
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeModal = document.querySelector('.close-modal');
const cartCount = document.getElementById('cartCount');
const cartItemsList = document.getElementById('cartItemsList');
const totalPriceElement = document.getElementById('totalPrice');
const orderForm = document.getElementById('orderForm');

// Функция закрытия корзины
const closeCart = () => cartModal.classList.remove('active');

// Слушатели событий для открытия и закрытия окна корзины
cartBtn.addEventListener('click', () => cartModal.classList.add('active'));
closeModal.addEventListener('click', closeCart);
window.addEventListener('click', (e) => { if(e.target === cartModal) closeCart(); });

// ЛОГИКА ДОБАВЛЕНИЯ НАУШНИКОВ В КОРЗИНУ
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

        // Обновляем внешний вид корзины
        updateCartUI();
        
        // Визуальный отклик кнопки при успешном добавлении
        button.innerText = 'Добавлено';
        button.style.color = '#34c759';
        setTimeout(() => {
            button.innerText = 'В корзину';
            button.style.color = '#0071e3';
        }, 800);
    });
});

// ФУНКЦИЯ ОБНОВЛЕНИЯ ИНТЕРФЕЙСА КОРЗИНЫ
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

// ОФИЦИАЛЬНАЯ ОТПРАВКА ЗАКАЗА БОТОМ С КОНТРОЛЕМ ОШИБОК
orderForm.addEventListener('submit', async function(e) {
    e.preventDefault(); // Полностью блокируем перезагрузку страницы браузером

    // Защита от отправки пустой корзины
    if (cart.length === 0) {
        alert('Ваша корзина пуста. Добавьте товары перед оформлением!');
        return;
    }

    const name = document.getElementById('userName').value;
    const phone = document.getElementById('userPhone').value;

    // Генерируем структурированный текст чека для Telegram
    let message = `🔔 <b>Новый заказ с сайта!</b>\n\n`;
    message += `👤 <b>Имя:</b> ${name}\n`;
    message += `📞 <b>Телефон:</b> ${phone}\n\n`;
    message += `📦 <b>Товары:</b>\n`;
    
    cart.forEach(item => {
        message += `• ${item.name} (x${item.quantity}) — ${item.price * item.quantity} ₽\n`;
    });
    
    message += `\n💰 <b>Итого к оплате:</b> ${totalPriceElement.innerText}`;

    const encodedMessage = encodeURIComponent(message);
    const tgUrl = `https://telegram.org{TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodedMessage}&parse_mode=HTML`;

    try {
        // Отправляем открытый защищенный запрос напрямую в Telegram API
        const response = await fetch(tgUrl);
        
        if (response.ok) {
            // ШАГ 1. Закрываем корзину на экране покупателя
            closeCart();

            // ШАГ 2. Создаем и выводим фирменную плашку Apple-стиля сверху экрана
            const notification = document.createElement('div');
            notification.innerHTML = `
                <div style="
                    position: fixed; top: -100px; left: 50%; transform: translateX(-50%);
                    background: #1d1d1f; color: #fff; padding: 14px 28px;
                    border-radius: 20px; font-weight: 500; font-size: 14px;
                    box-shadow: 0 12px 30px rgba(0,0,0,0.15);
                    z-index: 9999; display: flex; align-items: center; gap: 10px;
                    transition: top 0.4s cubic-bezier(0.25, 1, 0.5, 1);
                ">
                    <i class="fas fa-check-circle" style="color: #34c759;"></i> Заказ успешно оформлен! Проверьте Telegram.
                </div>
            `;
            
            const notificationNode = notification.firstElementChild;
            document.body.appendChild(notificationNode);

            // Мягкое выплывание плашки сверху вниз
            setTimeout(() => { notificationNode.style.top = '24px'; }, 100);

            // Мягкое улетание плашки наверх спустя 4 секунды
            setTimeout(() => {
                notificationNode.style.top = '-100px';
                setTimeout(() => notificationNode.remove(), 500);
            }, 4000);

            // ШАГ 3. Полностью очищаем корзину и сбрасываем поля ввода формы
            cart = [];
            updateCartUI();
            orderForm.reset();
        } else {
            // Если сервер Telegram вернул ошибку (например, статус 400 или 404)
            alert('Telegram отклонил запрос. Проверьте правильность TOKEN бота и CHAT_ID в самом верху файла script.js! Также убедитесь, что вы запустили бота кнопкой Старт в Telegram.');
        }
    } catch (error) {
        // Если запрос заблокирован на уровне браузера/расширений или нет интернета
        console.error('Ошибка сети:', error);
        alert('Не удалось связаться с сервером Telegram API. Проверьте интернет-соединение или настройки блокировщиков рекламы.');
    }
});
