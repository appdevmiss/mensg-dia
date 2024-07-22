// Função para adicionar mensagem
async function addMessage(event) {
  event.preventDefault();

  const message = document.getElementById('message').value;
  const author = document.getElementById('author').value;

  const response = await fetch('/addMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, author }),
  });

  if (response.ok) {
    alert('Mensagem adicionada com sucesso!');
    document.getElementById('messageForm').reset();
    fetchMessagesForAdmin();
  } else {
    const error = await response.json();
    alert('Erro ao adicionar mensagem: ' + error.error);
  }
}

// Função para buscar mensagens
async function fetchMessagesForAdmin() {
  const response = await fetch('/fetchMessages');
  const mensagens = await response.json();

  const messageHistory = document.getElementById('messageHistory');
  messageHistory.innerHTML = '';

  mensagens.forEach((msg) => {
    const messageCard = document.createElement('div');
    messageCard.className = 'card';
    messageCard.innerHTML = `
      <div class="card-body">
        <p class="card-text">${msg.mensagem}</p>
        <p class="card-text"><small class="text-muted">${msg.autor}</small></p>
        <p class="card-text"><small class="text-muted">${msg.data}</small></p>
        <button class="btn btn-warning btn-sm mr-2" onclick="editMessage('${msg.id}', '${msg.mensagem}', '${msg.autor}' ,'${msg.data}')">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="deleteMessage('${msg.id}')">Apagar</button>
      </div>
    `;
    messageHistory.appendChild(messageCard);
  });
}

// Variável para armazenar o ID da mensagem que está sendo editada
let currentEditingId = null;

// Função para editar mensagem
async function editMessage(id, message, date, author) {
  currentEditingId = id;
  document.getElementById('message').value = message;
  document.getElementById('author').value = author;

  document.getElementById('messageForm').removeEventListener('submit', addMessage);
  document.getElementById('messageForm').addEventListener('submit', updateMessage);
}

// Função para atualizar mensagem
async function updateMessage(event) {
  event.preventDefault();

  const newMessage = document.getElementById('message').value;
  const newAuthor = document.getElementById('author').value;

  const response = await fetch(`/updateMessage/${currentEditingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: newMessage, author: newAuthor }),
  });

  if (response.ok) {
    alert('Mensagem atualizada com sucesso!');
    document.getElementById('messageForm').reset();
    fetchMessagesForAdmin();
    document.getElementById('messageForm').removeEventListener('submit', updateMessage);
    document.getElementById('messageForm').addEventListener('submit', addMessage);
    currentEditingId = null;
  } else {
    const error = await response.json();
    alert('Erro ao atualizar mensagem: ' + error.error);
  }
}

// Função para apagar mensagem
async function deleteMessage(id) {
  const response = await fetch(`/deleteMessage/${id}`, {
    method: 'DELETE',
  });

  if (response.ok) {
    alert('Mensagem apagada com sucesso!');
    fetchMessagesForAdmin();
  } else {
    const error = await response.json();
    alert('Erro ao apagar mensagem: ' + error.error);
  }
}

document.getElementById('messageForm').addEventListener('submit', addMessage);
fetchMessagesForAdmin();
