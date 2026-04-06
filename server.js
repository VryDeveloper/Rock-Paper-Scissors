// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const salas = {};
const escolhas = {};
const jogadores = {};

// Função para gerar código único de sala
function gerarCodigoSala() {
    let codigo;
    do {
        codigo = Math.floor(100000 + Math.random() * 900000).toString();
    } while (salas[codigo]);
    return codigo;
}

io.on('connection', (socket) => {
    console.log(`Jogador conectado: ${socket.id}`);

    // Criar nova sala
    socket.on('criarSala', (nomeJogador) => {
        const codigo = gerarCodigoSala();
        salas[codigo] = {
            jogadores: [{ id: socket.id, nome: nomeJogador, pronto: false }],
            estado: 'aguardando',
            rodada: 0
        };
        escolhas[codigo] = {};
        
        socket.join(codigo);
        socket.codigoSala = codigo;
        socket.nomeJogador = nomeJogador;
        
        socket.emit('salacriada', { codigo, jogadores: salas[codigo].jogadores });
        console.log(`Sala ${codigo} criada por ${nomeJogador}`);
    });

    // Entrar em sala existente
    socket.on('entrarNaSala', (data) => {
        const { codigo, nomeJogador } = data;
        
        if (!salas[codigo]) {
            socket.emit('erro', 'Sala não encontrada');
            return;
        }
        
        if (salas[codigo].jogadores.length >= 2) {
            socket.emit('erro', 'Sala está cheia');
            return;
        }

        salas[codigo].jogadores.push({ id: socket.id, nome: nomeJogador, pronto: false });
        socket.join(codigo);
        socket.codigoSala = codigo;
        socket.nomeJogador = nomeJogador;

        // Notificar todos na sala sobre o novo jogador
        io.to(codigo).emit('jogadorEntrou', { 
            jogadores: salas[codigo].jogadores,
            mensagem: `${nomeJogador} entrou na sala`
        });

        // Se agora temos 2 jogadores, iniciar o jogo
        if (salas[codigo].jogadores.length === 2) {
            salas[codigo].estado = 'jogando';
            io.to(codigo).emit('jogoComecou', { jogadores: salas[codigo].jogadores });
        }
        
        console.log(`${nomeJogador} entrou na sala ${codigo}`);
    });

    // Receber jogada
    socket.on('jogada', (escolha) => {
        const codigo = socket.codigoSala;
        if (!codigo || !salas[codigo]) return;

        escolhas[codigo][socket.id] = escolha;
        const jogadoresNaSala = salas[codigo].jogadores;

        // Notificar que jogador fez sua escolha (sem revelar qual)
        socket.to(codigo).emit('adversarioEscolheu');

        // Verificar se ambos jogadores fizeram suas escolhas
        if (jogadoresNaSala.length === 2 && Object.keys(escolhas[codigo]).length === 2) {
            const [jogador1, jogador2] = jogadoresNaSala;
            const escolha1 = escolhas[codigo][jogador1.id];
            const escolha2 = escolhas[codigo][jogador2.id];

            const resultado = determinarResultado(escolha1, escolha2);
            
            // Incrementar rodada
            salas[codigo].rodada++;

            // Enviar resultado para cada jogador
            io.to(jogador1.id).emit('resultado', { 
                sua: escolha1, 
                adversario: escolha2, 
                resultado: resultado[0],
                nomeAdversario: jogador2.nome,
                rodada: salas[codigo].rodada
            });
            
            io.to(jogador2.id).emit('resultado', { 
                sua: escolha2, 
                adversario: escolha1, 
                resultado: resultado[1],
                nomeAdversario: jogador1.nome,
                rodada: salas[codigo].rodada
            });

            // Limpar escolhas para próxima rodada
            escolhas[codigo] = {};
        }
    });

    // Jogador pronto para nova rodada
    socket.on('prontoParaNovaRodada', () => {
        const codigo = socket.codigoSala;
        if (!codigo || !salas[codigo]) return;

        // Marcar jogador como pronto
        const jogador = salas[codigo].jogadores.find(j => j.id === socket.id);
        if (jogador) {
            jogador.pronto = true;
        }

        // Verificar se ambos estão prontos
        const todosProtos = salas[codigo].jogadores.every(j => j.pronto);
        if (todosProtos && salas[codigo].jogadores.length === 2) {
            // Resetar status de pronto
            salas[codigo].jogadores.forEach(j => j.pronto = false);
            io.to(codigo).emit('novaRodada');
        }
    });

    // Sair da sala
    socket.on('sairDaSala', () => {
        const codigo = socket.codigoSala;
        if (!codigo || !salas[codigo]) return;

        salas[codigo].jogadores = salas[codigo].jogadores.filter(j => j.id !== socket.id);
        socket.to(codigo).emit('jogadorSaiu', `${socket.nomeJogador} saiu da sala`);
        
        // Se sala ficou vazia, remover
        if (salas[codigo].jogadores.length === 0) {
            delete salas[codigo];
            delete escolhas[codigo];
        }
        
        socket.leave(codigo);
        socket.codigoSala = null;
        socket.nomeJogador = null;
    });

    // Desconexão
    socket.on('disconnect', () => {
        const codigo = socket.codigoSala;
        if (!codigo || !salas[codigo]) return;

        const nomeJogador = socket.nomeJogador || 'Jogador';
        salas[codigo].jogadores = salas[codigo].jogadores.filter(j => j.id !== socket.id);
        
        if (salas[codigo].jogadores.length > 0) {
            socket.to(codigo).emit('jogadorDesconectou', `${nomeJogador} se desconectou`);
        } else {
            // Sala vazia, remover
            delete salas[codigo];
            delete escolhas[codigo];
        }
        
        console.log(`${nomeJogador} desconectou da sala ${codigo}`);
    });
});

function determinarResultado(e1, e2) {
    if (e1 === e2) return ['Empate!', 'Empate!'];
    
    const vence = {
        Pedra: ['Tesoura'],
        Papel: ['Pedra'],
        Tesoura: ['Papel'],
        Isqueiro: ['Papel', 'Tesoura'] // Isqueiro vence Papel e Tesoura
    };
    
    if (vence[e1] && vence[e1].includes(e2)) {
        return ['Você venceu!', 'Você perdeu!'];
    }
    return ['Você perdeu!', 'Você venceu!'];
}

server.listen(3000, () => {
    console.log('Servidor multiplayer rodando em http://localhost:3000');
});
