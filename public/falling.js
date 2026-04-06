document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('fallingCanvas');
    const ctx = canvas.getContext('2d');
    
    // Ajusta o canvas para o tamanho da janela
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Lista de imagens (substitua pelas suas)
    const images = [
        'assets/charcoal.png',
        'assets/Paper.webp',
        'assets/Iron_Ingot.webp',
        'assets/Powder.webp',
        'assets/Scissors.webp', 
        'assets/Rock.webp'  
    ];
    
    // Carrega as imagens
    const loadedImages = [];
    let imagesLoaded = 0;
    
    images.forEach((src, index) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === images.length) {
                init();
            }
        };
        loadedImages.push(img);
    });
    
    // Classe para os elementos que caem
    class FallingItem {
        constructor() {
            this.reset();
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            this.img = loadedImages[Math.floor(Math.random() * loadedImages.length)];
            this.size = 20 + Math.random() * 30;
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = -50;
            this.speedY = 1 + Math.random() * 3;
            this.speedX = (Math.random() - 0.5) * 2;
            this.wobble = Math.random() * 2;
            this.wobbleSpeed = 0.01 + Math.random() * 0.02;
            this.wobbleOffset = Math.random() * Math.PI * 2;
        }
        
        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.wobbleOffset + Date.now() * this.wobbleSpeed) * this.wobble;
            this.rotation += this.rotationSpeed;
            
            // Se sair da tela, reinicia no topo
            if (this.y > canvas.height + 50 || this.x < -50 || this.x > canvas.width + 50) {
                this.reset();
            }
        }
        
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            
            // Desenha com sombra para efeito de profundidade
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetY = 2;
            
            ctx.drawImage(
                this.img,
                -this.size/2,
                -this.size/2,
                this.size,
                this.size
            );
            
            ctx.restore();
        }
    }
    
    // Inicializa o efeito
    function init() {
        const items = [];
        const itemCount = 30;
        
        // Cria os itens iniciais
        for (let i = 0; i < itemCount; i++) {
            setTimeout(() => {
                items.push(new FallingItem());
            }, i * 300);
        }
        
        // Animação principal
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Atualiza e desenha todos os itens
            items.forEach(item => {
                item.update();
                item.draw();
            });
            
            requestAnimationFrame(animate);
        }
        
        animate();
        
        // Adiciona novos itens periodicamente
        setInterval(() => {
            if (items.length < 50) {
                items.push(new FallingItem());
            }
        }, 1000);
    }
});