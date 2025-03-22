//Variabes
let wins = 0;
let loses = 0;
let winsInRow = 0;
let losesInRow = 0;
let points = 100000;
let fire = 0;


let flintandsteal = false;


function applyAnimation(buttonId, animationClass) {

    const button = document.getElementById(buttonId);
    
        button.style.pointerEvents = "none"
        button.classList.add(animationClass);

        button.addEventListener("animationend", () => {
            button.classList.remove(animationClass);
            button.style.pointerEvents = "auto"
        }, { once: true });
    };

    const bgOnClick = (classe) => {
        // Remove as classes "active" e qualquer classe de cor personalizada de todos os botões
        const buttons = document.querySelectorAll(".btn");
        buttons.forEach(button => {
            button.classList.remove("active");
            button.classList.add("rm-border");
        });
    
        // Adiciona a classe "active" e a classe personalizada ao botão clicado
        const activeButton = document.querySelector(`.btn-outline-${classe}`);
        activeButton.classList.add("active");
        };

function toggleBg(className) {
    const element = document.getElementById('btnPorkchop');
    if (element.classList.contains(className)) {
        element.classList.remove(className); // Remove a classe se já existir
    } else {
        element.classList.add(className); // Adiciona a classe se não existir
    }
}

const pointsAdd = (pointsToAdd) =>{
    const textPoints = document.getElementById('points')
    points += pointsToAdd;
    textPoints.textContent = `Pontos: ${points}`;
}

const desafioCheckWins = () => {
    const textDesafioWins = document.getElementById('6wins')
    const textPoints = document.getElementById('points')
    wins += 1;
    if (wins === 6){
        textDesafioWins.classList.add("text-success")
        pointsAdd(25);
        textPoints.textContent = `Pontos: ${points}`;
    }
}
const desafioCheckLoses = () => {
    const textDesafioLoses = document.getElementById('6loses')
    const textPoints = document.getElementById('points')
    loses += 1;
    if (loses === 6){
        textDesafioLoses.classList.add("text-success")
        pointsAdd(20);
        textPoints.textContent = `Pontos: ${points}`;
    }
}

const resultadoJogo = (escolhaComputador, escolhaUsuario) => {
    let venceu = null;
    const textoTerciario = document.getElementById("texto-terciario");
    const textoSecundario = document.getElementById("texto-secundario")
    const textoPrincipal = document.getElementById("texto-principal")
    const imgPcRock = document.querySelector(".rockpc");
    const imgPcPaper = document.querySelector(".paperpc");
    const imgPcScissors = document.querySelector(".scissorspc");
    const imgPcFlintAndSteal = document.querySelector(".flintandstealpc")

    const vitoriaMenu = document.getElementById("vitoriaMenu");
    const derrotaMenu = document.getElementById("derrotaMenu");

    // Resetar estilos anteriores
    imgPcRock.style.backgroundColor = "transparent";
    imgPcRock.style.borderColor = "transparent";
    imgPcPaper.style.backgroundColor = "transparent";
    imgPcPaper.style.borderColor = "transparent";
    imgPcScissors.style.backgroundColor = "transparent";
    imgPcScissors.style.borderColor = "transparent";
    imgPcFlintAndSteal.style.backgroundColor = "transparent";
    imgPcFlintAndSteal.style.borderColor = "transparent";

    textoPrincipal.classList.remove("bg-success")
    textoPrincipal.classList.remove("bg-danger")
    textoPrincipal.classList.remove("bg-warning")
    textoPrincipal.style.color = "#000"

    // Destacar a escolha do computador
    if (escolhaComputador === "Pedra") {
        imgPcRock.style.backgroundColor = "#198754";
        imgPcRock.style.borderColor = "#198754"; 
    } else if (escolhaComputador === "Papel") {
        imgPcPaper.style.backgroundColor = "#007bff";
        imgPcPaper.style.borderColor = "#007bff"; 
    } else if (escolhaComputador === "Tesoura") {
        imgPcScissors.style.backgroundColor = "#dc3545";
        imgPcScissors.style.borderColor = "#dc3545"; 
    } else if (escolhaComputador === "Isqueiro") {
        imgPcFlintAndSteal.style.backgroundColor = "#ffc107";
        imgPcFlintAndSteal.style.borderColor = "#ffc107"; 
    }

    // Determinar o resultado
    if (escolhaComputador === escolhaUsuario) {
        textoTerciario.textContent = "Empate!";
        textoTerciario.classList.remove("text-success", "text-danger");
        textoTerciario.classList.add("text-warning"); // Cor para empate
        textoPrincipal.classList.add("bg-warning")
        textoPrincipal.style.color = "#ffff"
    } else {
        if (
            (escolhaUsuario === "Pedra" && escolhaComputador === "Tesoura") ||
            (escolhaUsuario === "Papel" && escolhaComputador === "Pedra") ||
            (escolhaUsuario === "Tesoura" && escolhaComputador === "Papel") ||
            (escolhaUsuario === "Isqueiro" && escolhaComputador === "Papel") ||
            (escolhaUsuario === "Isqueiro" && escolhaComputador === "Pedra")
        ) {

            textoTerciario.textContent = "Você Venceu!";
            pointsAdd(10);
            textoTerciario.classList.remove("text-danger", "text-warning");
            textoTerciario.classList.add("text-success"); // Cor para vitória
            textoPrincipal.classList.add("bg-success")
            textoPrincipal.style.color = "#ffff"
            desafioCheckWins();
            vitoriaMenu.textContent = `Vitorias: ${wins}`
        } else {
            
            //'#dc3545'
            textoTerciario.textContent = "Você Perdeu.";
            textoTerciario.classList.remove("text-success", "text-warning");
            textoTerciario.classList.add("text-danger"); // Cor para derrota
            textoPrincipal.classList.add("bg-danger")
            textoPrincipal.style.color = "#ffff"
            desafioCheckLoses();
            derrotaMenu.textContent = `Derrotas: ${loses}`

        }


    }
};

let ultimaEscolha = null;
const jogo = (escolhaUsuario) => {

const opcoes = ["Pedra", "Papel", "Tesoura"];
if (flintandsteal === true){
    opcoes.push("Isqueiro")
}
let escolhaAleatoria;

do{
    escolhaAleatoria = Math.floor(Math.random() * opcoes.length);
}while(opcoes[escolhaAleatoria] === ultimaEscolha);

// Obtém a escolha correspondente
const escolhaComputador = opcoes[escolhaAleatoria];
ultimaEscolha = escolhaComputador;

// Exibe a escolha do computador
document.getElementById("texto-secundario").textContent = `Computador escolheu: ${escolhaComputador}`;
resultadoJogo(escolhaComputador, escolhaUsuario)
};


// Função para atualizar o texto do título
const principalText = (escolhaUsuario) => {
    // Seleciona o elemento pelo ID e atualiza o conteúdo
    document.getElementById("texto-principal").textContent = `Você escolheu: ${escolhaUsuario}`;
};


const toggleMenu = (menuId) => {
    const menu = document.getElementById(menuId);

    if (!menu) {
        console.error("Menu não encontrado.");
        return;
    }

    if (menu.style.display === "none" || menu.style.display === "") {
        menu.style.display = "flex"; // Exibe o menu
    } else {
        menu.style.display = "none"; // Esconde o menu
    }
};

const toggleItem = (itemId) => {
    const item = document.getElementById(itemId);

    if (!item) {
        console.error("Item não encontrado.");
        return;
    }

    if (item.style.display === "none" || item.style.display === "") {
        item.style.display = "inline"; // Exibe o Item
    } else {
        item.style.display = "none"; // Esconde o Item
    }
};

const shopBuyItemFlintAndSteal = (itemId,itemIdPc) => {
    if (!flintandsteal){
        if(points >= 300){
            points -= 300
            toggleItem(itemId)
            toggleItem(itemIdPc)
            flintandsteal = true;
        }
}};

const audio = document.getElementById('audioFundo');

audio.volume = 0.2;
function toggleAudio() {
    if (audio.paused) {
        audio.play(); // Toca o áudio se ele estiver pausado
        console.log("Música ligada");
    } else {
        audio.pause(); // Pausa o áudio se ele estiver tocando
        console.log("Música desligada");
    }
}

// Função para tocar o som
function tocarSom(audio) {
    const som = new Audio(audio);
    som.volume = 0.3;
    som.play();
}


// Adicionar o evento de clique aos botões
document.getElementById('btnFlintAndSteal').addEventListener('click', () => tocarSom('./assets/sounds/Flint_and_steel_click.ogg'));
document.getElementById('btnScissors').addEventListener('click', () => tocarSom('./assets/sounds/Shear.ogg'));
document.getElementById('btnPaper').addEventListener('click', () => tocarSom('./assets/sounds/Page_turn1.ogg'));
document.getElementById('btnRock').addEventListener('click', () => tocarSom('../assets/sounds/Calcite_break1.ogg'));
document.getElementById('btn-shop1').addEventListener('click', () => tocarSom('./assets/sounds/Pop.ogg'));
document.getElementById('btn-shop2').addEventListener('click', () => tocarSom('./assets/sounds/Pop.ogg'));
document.getElementById('btn-shop3').addEventListener('click', () => tocarSom('./assets/sounds/Pop.ogg'));

function addBackgroundImage(elementId, newImageUrl) {
    const element = document.getElementById(elementId);
    
    if (!element) {
        console.error(`Elemento com ID "${elementId}" não encontrado.`);
        return;
    }

    // Pega o fundo existente (se houver)
    const currentBackground = element.style.backgroundImage;

    // Adiciona a nova imagem ao fundo existente, separando com vírgula
    if (currentBackground) {
        element.style.backgroundImage = `${currentBackground}, url(${newImageUrl})`;
    } else {
        element.style.backgroundImage = `url(${newImageUrl})`;
    }

    element.style.backgroundPosition = 'center';  // Centraliza a imagem de fundo
    element.style.backgroundSize = 'cover';  // Faz a imagem cobrir todo o elemento
}

function changeImageSrc(elementId, newImageUrl) {
    const element = document.getElementById(elementId);
    
    if (!element) {
        console.error(`Elemento com ID "${elementId}" não encontrado.`);
        return;
    }

    // Verifica se o elemento é uma imagem (<img>)
    if (element.tagName.toLowerCase() === 'img') {
        // Muda o src da imagem
        element.src = newImageUrl;
    } else {
        console.error(`Elemento com ID "${elementId}" não é uma imagem.`);
    }
}

function changeSiteBackground(newBackgroundUrl) {

    const body = document.body;
    body.style.backgroundImage = `url(${newBackgroundUrl})`; 

}

function apagarFogo(){
    const body = document.body;
    const estilo = window.getComputedStyle(body);
    const backgroundImage = estilo.backgroundImage;

    if(backgroundImage !== 'url("")'){
        console.log(backgroundImage)
        body.style.backgroundImage = ``; 
        tocarSom('./assets/sounds/Fizz.ogg')
    }; 
}

function removeBackgroundImage(elementId) {
    const element = document.getElementById(elementId)
    element.style.backgroundImage = ''
}

const fireAdd= () =>{
        fire += 1;
        fireCheck();
}

const fireCheck = () =>{
    if(fire === 3){
        addBackgroundImage('paperpc','../assets/Fire.webp')
        tocarSom('./assets/sounds/Fire.ogg')
    } else if (fire === 6){
        addBackgroundImage('rockpc','../assets/Fire.webp')
        tocarSom('./assets/sounds/Fire.ogg')
    } else if(fire === 9){
        removeBackgroundImage('paperpc')
        changeImageSrc('paperpc', '../assets/Powder.webp')
        tocarSom('./assets/sounds/Pop.ogg')
    } else if (fire === 12){
        removeBackgroundImage('rockpc')
        changeImageSrc('rockpc', '../assets/Iron_Ingot.webp')
        tocarSom('./assets/sounds/Pop.ogg')
    } else if (fire >= 13){
        changeSiteBackground('../assets/Fire.Webp')
        tocarSom('./assets/sounds/Fire.ogg')
    }
}

