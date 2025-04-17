// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация бургер-меню
    const burgerMenu = document.querySelector('.burger-menu');
    const nav = document.querySelector('nav');
    const overlay = document.querySelector('.nav-overlay');

    if (burgerMenu && nav && overlay) {
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
    }

    // Инициализация чата (только если есть необходимые элементы)
    const nameInput = document.getElementById('nameInput');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messagesDiv = document.getElementById('messages');

    if (nameInput && messageInput && sendButton && messagesDiv) {
        // Инициализация Pusher
        const pusher = new Pusher('NZEdl04669f636mMy9XCkax3S_t20_0GToZQXd4Mj5Q', {
            cluster: 'eu',
            forceTLS: true
        });

        // Загрузка сохраненного имени пользователя
        const savedUsername = localStorage.getItem('chatUsername');
        if (savedUsername) {
            nameInput.value = savedUsername;
        }

        // Загрузка истории чата
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        console.log('Загружена история чата:', chatHistory.length, 'сообщений');

        // Отображение истории чата при загрузке страницы
        chatHistory.forEach(message => {
            displayMessage(message);
        });

        // Подписка на общий канал чата
        const channel = pusher.subscribe('public-chat');
        console.log('Подписка на общий канал чата');

        // Проверяем состояние подключения
        pusher.connection.bind('connected', () => {
            console.log('Pusher подключен');
            
            // Отправляем информацию о новом пользователе
            const joinData = {
                username: savedUsername || 'Новый пользователь',
                timestamp: new Date().toISOString()
            };
            
            console.log('Отправка данных о подключении:', JSON.stringify(joinData, null, 2));
            channel.trigger('client-joined', joinData);
        });

        // Обработка ошибок подключения
        pusher.connection.bind('error', (err) => {
            console.error('Ошибка подключения Pusher:', err);
        });

        // Обработка входящих сообщений
        channel.bind('client-message', function(data) {
            console.log('Получено сообщение:', JSON.stringify(data, null, 2));
            displayMessage(data);
            saveMessageToHistory(data);
        });

        // Отправка сообщения
        sendButton.addEventListener('click', function() {
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
                    timestamp: new Date().toISOString()
                };
                
                console.log('Отправка сообщения:', JSON.stringify(messageData, null, 2));
                channel.trigger('client-message', messageData);
                
                // Отображаем сообщение локально
                displayMessage(messageData);
                
                // Сохраняем сообщение в историю
                saveMessageToHistory(messageData);
                
                messageInput.value = '';
            } catch (error) {
                console.error('Error sending message:', error);
                alert('Ошибка при отправке сообщения. Пожалуйста, попробуйте снова.');
            }
        });

        // Функция для сохранения сообщения в историю
        function saveMessageToHistory(message) {
            const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
            chatHistory.push(message);
            if (chatHistory.length > 100) {
                chatHistory.shift();
            }
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
            console.log('Сообщение сохранено в историю. Всего сообщений:', chatHistory.length);
        }

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
    }

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