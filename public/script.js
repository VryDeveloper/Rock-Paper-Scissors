// Variáveis globais
let wins = 0;
let loses = 0;
let winsInRow = 0;
let losesInRow = 0;
let points = 0;
let fire = 0;
let flintandsteal = false;

// Variáveis multiplayer
let socket = null;
let playerName = '';
let roomCode = '';
let gameState = 'lobby'; // lobby, waiting, playing, result
let adversarioNome = '';
let minhaEscolha = null;
let aguardandoAdversario = false;

let placar = {
    player1: 0,
    player2: 0
};


// Carregar dados salvos
function carregarDados() {
    const dadosSalvos = localStorage.getItem('rpsGameData');
    if (dadosSalvos) {
        const dados = JSON.parse(dadosSalvos);
        wins = dados.wins || 0;
        loses = dados.loses || 0;
        points = dados.points || 0;
        flintandsteal = dados.flintandsteal || false;
        
        atualizarInterface();
    }
}

// Salvar dados
function salvarDados() {
    const dados = {
        wins,
        loses,
        points,
        flintandsteal
    };
    localStorage.setItem('rpsGameData', JSON.stringify(dados));
}

// Atualizar interface com dados salvos
function atualizarInterface() {
    document.getElementById('vitoriaMenu').textContent = `Vitórias: ${wins}`;
    document.getElementById('derrotaMenu').textContent = `Derrotas: ${loses}`;
    document.getElementById('points').textContent = `Pontos: ${points}`;
    
    if (flintandsteal) {
        document.getElementById('btnFlintAndSteal').style.display = 'inline-block';
        document.getElementById('btnFlintAndStealPC').style.display = 'inline-block';
    }
}

// Inicializar Socket.IO
function inicializarSocket() {
    socket = io(""); //Inicia o Servidor Local no meu IP!!!
    
    // Eventos do socket
    socket.on('salacriada', (data) => {
        roomCode = data.codigo;
        document.getElementById('codigoSalaAtual').textContent = roomCode;
        document.getElementById('salaInfo').style.display = 'block';
        document.getElementById('lobby-buttons').style.display = 'none';
        mostrarMensagem(`Sala criada! Código: ${roomCode}`, 'success');
        gameState = 'waiting';
    });
    
    socket.on('jogadorEntrou', (data) => {
        mostrarMensagem(data.mensagem, 'info');
        atualizarListaJogadores(data.jogadores);
    });
    
    socket.on('jogoComecou', (data) => {
        adversarioNome = data.jogadores.find(j => j.nome !== playerName)?.nome || 'Adversário';
        document.getElementById('nomeAdversario').textContent = `Adversário: ${adversarioNome}`;
        mostrarTelaJogo();
        gameState = 'playing';
        mostrarMensagem('Jogo iniciado! Faça sua escolha.', 'success');
    });
    
    socket.on('adversarioEscolheu', () => {
        document.getElementById('statusAdversario').textContent = 'Adversário fez sua escolha!';
    });
    
    socket.on('resultado', (data) => {
        mostrarResultado(data);
        gameState = 'result';
    });
    
    socket.on('novaRodada', () => {
        iniciarNovaRodada();
    });
    
    socket.on('jogadorSaiu', (mensagem) => {
        mostrarMensagem(mensagem, 'warning');
        voltarAoLobby();
    });
    
    socket.on('jogadorDesconectou', (mensagem) => {
        mostrarMensagem(mensagem, 'danger');
        voltarAoLobby();
    });
    
    socket.on('erro', (mensagem) => {
        mostrarMensagem(mensagem, 'danger');
    });
}

// Funções do lobby
function criarSala() {
    const nome = document.getElementById('playerName').value.trim();
    if (!nome) {
        mostrarMensagem('Digite seu nome primeiro!', 'warning');
        return;
    }
    
    playerName = nome;
    socket.emit('criarSala', playerName);
}

function mostrarEntrarSala() {
    document.getElementById('entrarSalaDiv').style.display = 'block';
    document.getElementById('lobby-buttons').style.display = 'flex';
}

function cancelarEntrada() {
    document.getElementById('entrarSalaDiv').style.display = 'none';
    document.getElementById('lobby-buttons').style.display = 'flex';
    document.getElementById('codigoSala').value = '';
}

function entrarNaSala() {
    const nome = document.getElementById('playerName').value.trim();
    const codigo = document.getElementById('codigoSala').value.trim();
    
    if (!nome) {
        mostrarMensagem('Digite seu nome primeiro!', 'warning');
        return;
    }
    
    if (!codigo || codigo.length !== 6) {
        mostrarMensagem('Digite um código válido de 6 dígitos!', 'warning');
        return;
    }
    
    playerName = nome;
    roomCode = codigo;
    socket.emit('entrarNaSala', { codigo, nomeJogador: playerName });
}

function sairDaSala() {
    socket.emit('sairDaSala');
    voltarAoLobby();
}

function voltarAoLobby() {
    // Resetar estado
    gameState = 'lobby';
    roomCode = '';
    adversarioNome = '';
    minhaEscolha = null;
    aguardandoAdversario = false;
    resetarPlacar();
    
    // Mostrar lobby
    document.getElementById('lobby').style.display = 'block';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('gameFooter').style.display = 'none';
    
    
    // Resetar interface do lobby
    document.getElementById('salaInfo').style.display = 'none';
    document.getElementById('entrarSalaDiv').style.display = 'none';
    document.getElementById('lobby-buttons').style.display = 'flex';
    document.getElementById('codigoSala').value = '';
    
    // Limpar mensagens
    document.getElementById('mensagensLobby').innerHTML = '';
}

function mostrarTelaJogo() {
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    
    // Resetar interface do jogo
    document.getElementById('texto-principal').textContent = 'Faça sua escolha!';
    document.getElementById('texto-secundario').textContent = '';
    document.getElementById('texto-terciario').textContent = '';
    document.getElementById('statusAdversario').textContent = '';
    document.getElementById('btnNovaRodada').style.display = 'none';
    document.getElementById('gameFooter').style.display = 'block';
    
    
    resetarEstilosEscolha();
}

// Funções do jogo
function fazerJogada(escolha) {
    if (gameState !== 'playing' || aguardandoAdversario) return;
    
    minhaEscolha = escolha;
    aguardandoAdversario = true;
    
    // Atualizar interface
    document.getElementById('texto-principal').textContent = `Você escolheu: ${escolha}`;
    document.getElementById('statusAdversario').textContent = 'Aguardando adversário...';
    
    // Aplicar animação e efeitos visuais
    const botaoId = getBotaoId(escolha);
    applyAnimation(botaoId, 'animate-bounce');
    bgOnClick(getCorBotao(escolha));
    
    // Tocar som
    tocarSomEscolha(escolha);
    
    // Efeito especial do isqueiro
    if (escolha === 'Isqueiro') {
        fireAdd();
    }
    
    // Enviar jogada para servidor
    socket.emit('jogada', escolha);
}


function mostrarResultado(data) {
    const { sua, adversario, resultado, nomeAdversario, rodada } = data;
    
    // Atualizar textos
    document.getElementById('texto-secundario').textContent = `${nomeAdversario} escolheu: ${adversario}`;
    document.getElementById('texto-terciario').textContent = resultado;

    // Atualizar placar se houver vencedor
    if (resultado.includes('Você venceu')) {
        placar.player1++;
    } else if (resultado.includes('Você perdeu')) {
        placar.player2++;
    }
    atualizarPlacar();
    
    // Destacar escolha do adversário
    destacarEscolhaAdversario(adversario);
    
    // Aplicar cores do resultado
    aplicarCoresResultado(resultado);
    
    // Atualizar estatísticas
    atualizarEstatisticas(resultado);
    
    // Mostrar botão para próxima rodada
    document.getElementById('btnNovaRodada').style.display = 'inline-block';
    document.getElementById('statusAdversario').textContent = '';
    
    aguardandoAdversario = false;
}

// Função para atualizar o placar no HTML
function atualizarPlacar() {
    const elementoPlacar = document.getElementById('statusPartida');
    elementoPlacar.textContent = `${placar.player1}x${placar.player2}`;
}

function resetarPlacar() {
    placar.player1 = 0;
    placar.player2 = 0;
    atualizarPlacar();
}


function prontoParaNovaRodada() {
    socket.emit('prontoParaNovaRodada');
    document.getElementById('btnNovaRodada').style.display = 'none';
    document.getElementById('statusAdversario').textContent = 'Aguardando adversário estar pronto...';
}

function iniciarNovaRodada() {
    // Resetar interface
    document.getElementById('texto-principal').textContent = 'Faça sua escolha!';
    document.getElementById('texto-secundario').textContent = '';
    document.getElementById('texto-terciario').textContent = '';
    document.getElementById('statusAdversario').textContent = '';
    document.getElementById('btnNovaRodada').style.display = 'none';
    
    resetarEstilosEscolha();
    atualizarPlacar();
    
    minhaEscolha = null;
    aguardandoAdversario = false;
    gameState = 'playing';
}

// Funções auxiliares
function getBotaoId(escolha) {
    const mapa = {
        'Pedra': 'btnRock',
        'Papel': 'btnPaper',
        'Tesoura': 'btnScissors',
        'Isqueiro': 'btnFlintAndSteal'
    };
    return mapa[escolha];
}

function getCorBotao(escolha) {
    const mapa = {
        'Pedra': 'success',
        'Papel': 'primary',
        'Tesoura': 'danger',
        'Isqueiro': 'warning'
    };
    return mapa[escolha];
}

function tocarSomEscolha(escolha) {
    const sons = {
        'Pedra': './assets/sounds/Calcite_break1.ogg',
        'Papel': './assets/sounds/Page_turn1.ogg',
        'Tesoura': './assets/sounds/Shear.ogg',
        'Isqueiro': './assets/sounds/Flint_and_steel_click.ogg'
    };
    if (sons[escolha]) {
        tocarSom(sons[escolha]);
    }
}

function destacarEscolhaAdversario(escolha) {
    const imgPcRock = document.querySelector(".rockpc");
    const imgPcPaper = document.querySelector(".paperpc");
    const imgPcScissors = document.querySelector(".scissorspc");
    const imgPcFlintAndSteal = document.querySelector(".flintandstealpc");

    // Resetar estilos
    [imgPcRock, imgPcPaper, imgPcScissors, imgPcFlintAndSteal].forEach(img => {
        img.style.backgroundColor = "transparent";
        img.style.borderColor = "transparent";
    });

    // Destacar escolha do adversário
    const cores = {
        'Pedra': '#198754',
        'Papel': '#007bff',
        'Tesoura': '#dc3545',
        'Isqueiro': '#ffc107'
    };

    const imagens = {
        'Pedra': imgPcRock,
        'Papel': imgPcPaper,
        'Tesoura': imgPcScissors,
        'Isqueiro': imgPcFlintAndSteal
    };

    if (imagens[escolha] && cores[escolha]) {
        imagens[escolha].style.backgroundColor = cores[escolha];
        imagens[escolha].style.borderColor = cores[escolha];
    }
}

function aplicarCoresResultado(resultado) {
    const textoPrincipal = document.getElementById("texto-principal");
    const textoTerciario = document.getElementById("texto-terciario");

    // Resetar classes
    textoPrincipal.classList.remove("bg-success", "bg-danger", "bg-warning");
    textoTerciario.classList.remove("text-success", "text-danger", "text-warning");
    textoPrincipal.style.color = "#000";

    if (resultado.includes('Empate')) {
        textoTerciario.classList.add("text-warning");
        textoPrincipal.classList.add("bg-warning");
        textoPrincipal.style.color = "#fff";
    } else if (resultado.includes('venceu')) {
        textoTerciario.classList.add("text-success");
        textoPrincipal.classList.add("bg-success");
        textoPrincipal.style.color = "#fff";
    } else {
        textoTerciario.classList.add("text-danger");
        textoPrincipal.classList.add("bg-danger");
        textoPrincipal.style.color = "#fff";
    }
}

function atualizarEstatisticas(resultado) {
    if (resultado.includes('venceu')) {
        wins++;
        pointsAdd(10);
        desafioCheckWins();
    } else if (resultado.includes('perdeu')) {
        loses++;
        desafioCheckLoses();
    }
    
    document.getElementById('vitoriaMenu').textContent = `Vitórias: ${wins}`;
    document.getElementById('derrotaMenu').textContent = `Derrotas: ${loses}`;
    
    salvarDados();
}

function resetarEstilosEscolha() {
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach(button => {
        button.classList.remove("active", "rm-border");
    });

    const textoPrincipal = document.getElementById("texto-principal");
    textoPrincipal.classList.remove("bg-success", "bg-danger", "bg-warning");
    textoPrincipal.style.color = "#000";

    // Resetar imagens do adversário
    [".rockpc", ".paperpc", ".scissorspc", ".flintandstealpc"].forEach(selector => {
        const img = document.querySelector(selector);
        if (img) {
            img.style.backgroundColor = "transparent";
            img.style.borderColor = "transparent";
        }
    });
}

function mostrarMensagem(mensagem, tipo = 'info') {
    const container = document.getElementById('mensagensLobby');
    const div = document.createElement('div');
    div.className = `alert alert-${tipo} alert-dismissible fade show`;
    div.innerHTML = `
        ${mensagem}
    `;
    container.appendChild(div);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (div.parentNode) {
            div.remove();
        }
    }, 5000);
}

function atualizarListaJogadores(jogadores) {
    const lista = document.getElementById('jogadoresLista');
    lista.innerHTML = '<h5>Jogadores:</h5>';
    jogadores.forEach(jogador => {
        const p = document.createElement('p');
        p.textContent = `• ${jogador.nome}`;
        lista.appendChild(p);
    });
}

// Funções originais mantidas
function applyAnimation(buttonId, animationClass) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    button.style.pointerEvents = "none";
    button.classList.add(animationClass);

    button.addEventListener("animationend", () => {
        button.classList.remove(animationClass);
        button.style.pointerEvents = "auto";
    }, { once: true });
}

const bgOnClick = (classe) => {
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach(button => {
        button.classList.remove("active");
        button.classList.add("rm-border");
    });

    const activeButton = document.querySelector(`.btn-outline-${classe}`);
    if (activeButton) {
        activeButton.classList.add("active");
    }
};

const pointsAdd = (pointsToAdd) => {
    const textPoints = document.getElementById('points');
    points += pointsToAdd;
    textPoints.textContent = `Pontos: ${points}`;
    salvarDados();
};

const pointsRemove = (pointsToRemove) => {
    points -= pointsToRemove;
    const textPoints = document.getElementById('points');
    textPoints.textContent = `Pontos: ${points}`;
    salvarDados();
};

const desafioCheckWins = () => {
    const textDesafioWins = document.getElementById('6wins');
    if (wins === 6) {
        textDesafioWins.classList.add("text-success");
        pointsAdd(25);
    }
};

const desafioCheckLoses = () => {
    const textDesafioLoses = document.getElementById('6loses');
    if (loses === 6) {
        textDesafioLoses.classList.add("text-success");
        pointsAdd(20);
    }
};

const toggleMenu = (menuId) => {
    const menu = document.getElementById(menuId);
    if (!menu) return;

    if (menu.style.display === "none" || menu.style.display === "") {
        menu.style.display = "flex";
    } else {
        menu.style.display = "none";
    }
};

const toggleItem = (itemId) => {
    const item = document.getElementById(itemId);
    if (!item) return;

    if (item.style.display === "none" || item.style.display === "") {
        item.style.display = "inline";
    } else {
        item.style.display = "none";
    }
};

const shopBuyItemFlintAndSteal = (itemId, itemIdPc) => {
    if (!flintandsteal && points >= 300) {
        pointsRemove(300);
        toggleItem(itemId);
        toggleItem(itemIdPc);
        flintandsteal = true;
        salvarDados();
    }
};

// Funções de áudio
const audio = document.getElementById('audioFundo');
audio.volume = 0.2;

function toggleAudio() {
    if (audio.paused && points >= 100) {
        pointsRemove(100);
        audio.play();
    } else {
        audio.pause();
    }
}

function tocarSom(audioSrc) {
    const som = new Audio(audioSrc);
    som.volume = 0.3;
    som.play();
}


// Funções de efeitos visuais (fogo, etc.)
function addBackgroundImage(elementId, newImageUrl) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const currentBackground = element.style.backgroundImage;
    if (currentBackground) {
        element.style.backgroundImage = `${currentBackground}, url(${newImageUrl})`;
    } else {
        element.style.backgroundImage = `url(${newImageUrl})`;
    }

    element.style.backgroundPosition = 'center';
    element.style.backgroundSize = 'cover';
}

function changeImageSrc(elementId, newImageUrl) {
    const element = document.getElementById(elementId);
    if (!element || element.tagName.toLowerCase() !== 'img') return;
    element.src = newImageUrl;
}

function changeSiteBackground(newBackgroundUrl) {
    document.body.style.backgroundImage = `url(${newBackgroundUrl})`;
}

function apagarFogo() {
    const body = document.body;
    const estilo = window.getComputedStyle(body);
    const backgroundImage = estilo.backgroundImage;

    if (backgroundImage !== 'none' && points >= 500) {
        pointsRemove(500);
        body.style.backgroundImage = '';
        tocarSom('./assets/sounds/Fizz.ogg');
    }
}

function removeBackgroundImage(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.backgroundImage = '';
    }
}

const fireAdd = () => {
    fire += 1;
    fireCheck();
};

const fireCheck = () => {
    if (fire === 3) {
        addBackgroundImage('paperpc', './assets/Fire.webp');
        tocarSom('./assets/sounds/Fire.ogg');
    } else if (fire === 6) {
        addBackgroundImage('rockpc', './assets/Fire.webp');
        tocarSom('./assets/sounds/Fire.ogg');
    } else if (fire === 9) {
        removeBackgroundImage('paperpc');
        changeImageSrc('paperpc', './assets/Powder.webp');
        tocarSom('./assets/sounds/Pop.ogg');
    } else if (fire === 12) {
        removeBackgroundImage('rockpc');
        changeImageSrc('rockpc', './assets/Iron_Ingot.webp');
        tocarSom('./assets/sounds/Pop.ogg');
    } else if (fire >= 13) {
        changeSiteBackground('./assets/Fire.webp');
        tocarSom('./assets/sounds/Fire.ogg');
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    inicializarSocket();
    atualizarPlacar();
    
    const shopButtons = ['btn-shop1', 'btn-shop2', 'btn-shop3'];
    shopButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => tocarSom('./assets/sounds/Pop.ogg'));
        }
    });
});
