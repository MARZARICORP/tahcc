// Arquivo: app.js (VERSÃO CORRIGIDA)

class SimpleChatApp {
    constructor() {
        // CORREÇÃO: Removemos o array this.messages = []. Ele não é mais necessário.
        this.currentUserId = 1;
        
        this.users = {
            1: { name: 'Usuário 1', color: 'user1' },
            2: { name: 'Usuário 2', color: 'user2' }
        };

        // DOM elements (continua igual)
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.activeUserSelect = document.getElementById('activeUser');
        this.charCount = document.getElementById('charCount');

        // CORREÇÃO: Adicionamos a referência à coleção 'messages' do Firestore.
        // A variável 'db' vem do arquivo firebase-config.js.
        this.messagesCollection = db.collection('messages');

        this.initializeEventListeners();
        this.updateCharCounter();
        this.updateSendButtonState();
        
        // CORREÇÃO: Chamada para o método que "ouve" as mensagens em tempo real.
        this.listenForMessages();
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.messageInput.addEventListener('input', () => {
            this.updateCharCounter();
            this.updateSendButtonState();
        });

        this.activeUserSelect.addEventListener('change', (e) => {
            this.currentUserId = parseInt(e.target.value);
            console.log(`Switched to user ${this.currentUserId}: ${this.users[this.currentUserId].name}`);
            this.messageInput.focus();
        });

        setTimeout(() => {
            this.messageInput.focus();
        }, 100);
    }

    // CORREÇÃO: Este é o método sendMessage() correto e único.
    // Ele envia a mensagem para o Firestore e limpa o campo de texto.
    sendMessage() {
        const messageText = this.messageInput.value.trim();

        if (!messageText || messageText.length > 500) {
            this.messageInput.focus();
            return;
        }

        const message = {
            userId: this.currentUserId,
            userName: this.users[this.currentUserId].name,
            userColor: this.users[this.currentUserId].color,
            text: messageText,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        this.messagesCollection.add(message)
            .then(() => {
                console.log('Mensagem enviada para o Firestore!');
                this.messageInput.value = '';
                this.updateCharCounter();
                this.updateSendButtonState();
                this.messageInput.focus();
            })
            .catch((error) => {
                console.error("Erro ao enviar mensagem: ", error);
                alert("Não foi possível enviar sua mensagem. Tente novamente.");
            });
        
        // CORREÇÃO: Removemos todo o código antigo que vinha depois daqui,
        // como this.messages.push() e this.displayMessage().
    }

    // CORREÇÃO: O método listenForMessages() foi colocado aqui, no lugar correto,
    // como um método da classe, e não dentro de outro método.
    listenForMessages() {
        this.messagesCollection
            .orderBy('timestamp')
            .onSnapshot((querySnapshot) => {
                querySnapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const messageData = change.doc.data();

                        const message = {
                            ...messageData,
                            timestamp: messageData.timestamp ? messageData.timestamp.toDate() : new Date()
                        };

                        this.displayMessage(message);
                    }
                });
                
                // Rola para o final APENAS se o usuário não estiver com o scroll pra cima
                // Isso evita que a tela pule para o final se o usuário estiver lendo mensagens antigas
                const isScrolledToBottom = this.chatMessages.scrollHeight - this.chatMessages.clientHeight <= this.chatMessages.scrollTop + 1;
                if(isScrolledToBottom) {
                    this.scrollToBottom();
                }
            });
    }

    // O método displayMessage não precisa de grandes mudanças.
    displayMessage(message) {
        const welcomeMessage = this.chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = `message message--${message.userColor}`;
        
        const timeString = this.formatTime(message.timestamp);
        
        const authorElement = document.createElement('span');
        authorElement.className = `message__author message__author--${message.userColor}`;
        authorElement.textContent = message.userName;

        const timeElement = document.createElement('span');
        timeElement.className = 'message__time';
        timeElement.textContent = timeString;

        const contentElement = document.createElement('p');
        contentElement.className = 'message__content';
        contentElement.textContent = message.text;

        const headerElement = document.createElement('div');
        headerElement.className = 'message__header';
        headerElement.appendChild(authorElement);
        headerElement.appendChild(timeElement);

        messageElement.appendChild(headerElement);
        messageElement.appendChild(contentElement);

        this.chatMessages.appendChild(messageElement);
    }
    
    // Nenhuma mudança necessária nos métodos abaixo.
    formatTime(date) {
        const now = new Date();
        const messageDate = new Date(date);
        
        if (messageDate.toDateString() === now.toDateString()) {
            return messageDate.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return messageDate.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    updateCharCounter() {
        const currentLength = this.messageInput.value.length;
        if (this.charCount) {
            this.charCount.textContent = currentLength;
            const counterElement = this.charCount.parentElement;
            counterElement.classList.remove('warning', 'danger');
            if (currentLength > 450) {
                counterElement.classList.add('danger');
            } else if (currentLength > 400) {
                counterElement.classList.add('warning');
            }
        }
    }

    updateSendButtonState() {
        const currentLength = this.messageInput.value.trim().length;
        this.sendButton.disabled = currentLength === 0 || currentLength > 500;
    }

    scrollToBottom() {
        this.chatMessages.scrollTo({
            top: this.chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }

    // O restante da lógica (clearMessages, getStats, etc.) foi removido
    // pois dependia do array `this.messages` que não existe mais.
    // Pode ser recriado no futuro, se necessário, usando dados do Firestore.
}

// Inicializa o chat
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing chat...');
    window.chatApp = new SimpleChatApp();
    console.log('💬 Chat Simples com Firebase carregado com sucesso!');
});