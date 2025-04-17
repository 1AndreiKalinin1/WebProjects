// Инициализация Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

import { ref, onValue, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем существование необходимых элементов
    const nameInput = document.getElementById('nameInput');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messagesDiv = document.getElementById('messages');

    if (!nameInput || !messageInput || !sendButton || !messagesDiv) {
        console.error('Не найдены необходимые элементы DOM');
        return;
    }

    // Загрузка сохраненного имени пользователя
    const savedUsername = localStorage.getItem('chatUsername');
    if (savedUsername) {
        nameInput.value = savedUsername;
    }

    // Ссылка на сообщения в базе данных
    const messagesRef = ref(database, 'messages');

    // Загрузка истории чата
    onValue(messagesRef, (snapshot) => {
        const messages = snapshot.val() || {};
        messagesDiv.innerHTML = ''; // Очищаем текущие сообщения
        
        // Преобразуем объект в массив и сортируем по времени
        const messagesArray = Object.values(messages).sort((a, b) => a.timestamp - b.timestamp);
        
        messagesArray.forEach(message => {
            displayMessage(message);
        });
    });

    // Отправка сообщения
    sendButton.addEventListener('click', async function() {
        const username = nameInput.value.trim();
        const message = messageInput.value.trim();
        
        if (!username) {
            alert('Пожалуйста, введите ваше имя');
            return;
        }

        if (!message) {
            alert('Пожалуйста, введите сообщение');
            return;
        }

        // Сохраняем имя пользователя
        localStorage.setItem('chatUsername', username);

        try {
            const messageData = {
                user: username,
                message: message,
                timestamp: serverTimestamp()
            };
            
            // Добавляем сообщение в базу данных
            await push(messagesRef, messageData);
            messageInput.value = '';
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Ошибка при отправке сообщения. Пожалуйста, попробуйте снова.');
        }
    });

    // Функция для отображения сообщений
    function displayMessage(data) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${data.isOwner ? 'owner-message' : 'customer-message'}`;
        messageElement.innerHTML = `
            <strong>${data.user}</strong> 
            <span class="message-time">${new Date(data.timestamp).toLocaleTimeString()}</span>
            <div class="message-text">${data.message}</div>
        `;
        
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        console.log('Сообщение отображено:', data.user, data.message);
    }

    // Бургер-меню
    const burgerMenu = document.querySelector('.burger-menu');
    const nav = document.querySelector('nav');
    const overlay = document.querySelector('.nav-overlay');

    burgerMenu.addEventListener('click', function() {
        burgerMenu.classList.toggle('active');
        nav.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    overlay.addEventListener('click', function() {
        burgerMenu.classList.remove('active');
        nav.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Закрываем меню при клике на ссылку
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function() {
            burgerMenu.classList.remove('active');
            nav.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Обработка кнопки "Связаться с агентом"
    const contactButton = document.querySelector('.contact-button');
    const chatSection = document.getElementById('chat');

    if (contactButton && chatSection) {
        contactButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Добавляем класс для анимации
            chatSection.classList.add('smooth-scroll');
            
            // Прокручиваем к чату
            chatSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Удаляем класс анимации после завершения
            setTimeout(() => {
                chatSection.classList.remove('smooth-scroll');
            }, 500);

            // Фокусируем поле ввода имени
            const nameInput = document.getElementById('nameInput');
            if (nameInput) {
                setTimeout(() => {
                    nameInput.focus();
                }, 600);
            }
        });
    }
});