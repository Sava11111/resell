let cart = [];

const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeModal = document.querySelector('.close-modal');
const cartCount = document.getElementById('cartCount');
const cartItemsList = document.getElementById('cartItemsList');
const totalPriceElement = document.getElementById('totalPrice');
const orderForm = document.getElementById('orderForm');
const tgMessageText = document.getElementById('tgMessageText');

// Открытие и закрытие корзины
cartBtn.addEventListener('click', () => cartModal.classList.add('active'));
closeModal.addEventListener('click', () => cartModal.classList.remove('active'));
window.addEventListener('click', (e) => { if(e.target === cartModal) cartModal.classList.remove('active'); });

// Добавление наушников в корзину
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

// Формирование текста заказа перед физической отправкой формы
orderForm.addEventListener('submit', function(e) {
    if (cart.length === 0) {
        e.preventDefault();
        alert('Ваша корзина пуста.');
        return;
    }

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

    tgMessageText.value = message;

    setTimeout(() => {
        cartModal.classList.remove('active');
        cart = [];
        updateCartUI();
        orderForm.reset();
    }, 50);
});
