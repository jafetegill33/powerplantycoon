class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;

        // Create flowing effect - particles move in a general direction
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.life = Math.random() * 150 + 100;
        this.maxLife = this.life;
        this.size = Math.random() * 3 + 1;
        this.hue = Math.random() * 60 + 30; // Gold range
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;

        if (this.life <= 0 || this.x < -50 || this.x > this.canvas.width + 50 || 
            this.y < -50 || this.y > this.canvas.height + 50) {
            this.reset();
        }
    }

    draw(ctx) {
        const opacity = this.life / this.maxLife;

        // Main particle
        ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, ${opacity * 0.8})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Enhanced glow
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 4);
        gradient.addColorStop(0, `hsla(${this.hue}, 100%, 60%, ${opacity * 0.3})`);
        gradient.addColorStop(1, `hsla(${this.hue}, 100%, 60%, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.running = true;
        this.time = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Create more particles for PC
        for (let i = 0; i < 200; i++) {
            this.particles.push(new Particle(canvas));
        }

        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    animate() {
        if (!this.running) return;

        this.time += 0.01;

        // Clear with slight trail effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        this.particles.forEach(particle => {
            particle.update();
            particle.draw(this.ctx);
        });

        // Enhanced connections with distance-based opacity
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    const opacity = (1 - distance / 150) * 0.4;
                    const avgHue = (this.particles[i].hue + this.particles[j].hue) / 2;

                    this.ctx.strokeStyle = `hsla(${avgHue}, 100%, 60%, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }

        // Add energy bolts occasionally
        if (Math.random() < 0.02) {
            this.drawEnergyBolt();
        }

        requestAnimationFrame(() => this.animate());
    }

    drawEnergyBolt() {
        const startX = Math.random() * this.canvas.width;
        const startY = Math.random() * this.canvas.height;
        const endX = startX + (Math.random() - 0.5) * 200;
        const endY = startY + (Math.random() - 0.5) * 200;

        this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';

        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);

        // Jagged lightning effect
        let currentX = startX;
        let currentY = startY;
        const segments = 8;

        for (let i = 0; i < segments; i++) {
            const progress = i / segments;
            const targetX = startX + (endX - startX) * progress;
            const targetY = startY + (endY - startY) * progress;
            const offsetX = (Math.random() - 0.5) * 30;
            const offsetY = (Math.random() - 0.5) * 30;

            currentX = targetX + offsetX;
            currentY = targetY + offsetY;
            this.ctx.lineTo(currentX, currentY);
        }

        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();

        this.ctx.shadowBlur = 0;
    }

    stop() {
        this.running = false;
    }
}

class PowerPlant {
    constructor() {
        this.money = 10;
        this.generation = 0;
        this.demand = 50;
        this.income = 0;
        this.prestigeLevel = 0;
        this.prestigeMultiplier = 1;
        this.totalMoneyEarned = 0;

        this.generators = {
            solar: { count: 0, cost: 10, power: 5, income: 2 },
            wind: { count: 0, cost: 100, power: 15, income: 8 },
            coal: { count: 0, cost: 500, power: 50, income: 30 },
            nuclear: { count: 0, cost: 3000, power: 200, income: 150 },
            fusion: { count: 0, cost: 20000, power: 1000, income: 800 }
        };

        this.loadGame();
        this.showTitleScreen();
    }

    showTitleScreen() {
        const canvas = document.getElementById('particles-canvas');
        const particleSystem = new ParticleSystem(canvas);

        document.getElementById('start-btn').addEventListener('click', () => {
            document.getElementById('title-screen').classList.add('hidden');
            document.getElementById('game-container').classList.add('visible');
            particleSystem.stop();
            this.init();
        });
    }

    init() {
        this.calculatePrestigeMultiplier();
        this.updateUI();
        this.setupEventListeners();
        this.startGameLoop();
        this.startAutoSave();
    }

    calculatePrestigeMultiplier() {
        this.prestigeMultiplier = 1 + (this.prestigeLevel * 0.25);
    }

    canPrestige() {
        return this.totalMoneyEarned >= 100000;
    }

    getPrestigeReward() {
        if (!this.canPrestige()) return 0;
        return Math.floor(Math.sqrt(this.totalMoneyEarned / 100000));
    }

    doPrestige() {
        if (!this.canPrestige()) return;

        const reward = this.getPrestigeReward();
        this.prestigeLevel += reward;
        this.calculatePrestigeMultiplier();

        // Reset game
        this.money = 10;
        this.generation = 0;
        this.totalMoneyEarned = 0;
        Object.keys(this.generators).forEach(type => {
            this.generators[type].count = 0;
            this.generators[type].cost = this.getBaseCost(type);
        });

        this.updateStats();
        this.updateUI();
        this.saveGame();
        this.hidePrestigeModal();
    }

    getBaseCost(type) {
        const baseCosts = {
            solar: 10,
            wind: 100,
            coal: 500,
            nuclear: 3000,
            fusion: 20000
        };
        return baseCosts[type];
    }

    showPrestigeModal() {
        const reward = this.getPrestigeReward();
        const newMultiplier = 1 + ((this.prestigeLevel + reward) * 0.25);

        document.getElementById('prestige-reward').textContent = reward;
        document.getElementById('new-multiplier').textContent = newMultiplier.toFixed(1);
        document.getElementById('prestige-modal').classList.add('active');
    }

    hidePrestigeModal() {
        document.getElementById('prestige-modal').classList.remove('active');
    }

    saveGame() {
        const saveData = {
            money: this.money,
            prestigeLevel: this.prestigeLevel,
            totalMoneyEarned: this.totalMoneyEarned,
            generators: {},
            lastSave: Date.now()
        };

        Object.keys(this.generators).forEach(type => {
            saveData.generators[type] = {
                count: this.generators[type].count,
                cost: this.generators[type].cost
            };
        });

        localStorage.setItem('powerPlantSavePC', JSON.stringify(saveData));
    }

    loadGame() {
        const saveData = localStorage.getItem('powerPlantSavePC');
        if (!saveData) return;

        try {
            const data = JSON.parse(saveData);
            this.money = data.money || 10;
            this.prestigeLevel = data.prestigeLevel || 0;
            this.totalMoneyEarned = data.totalMoneyEarned || 0;

            if (data.generators) {
                Object.keys(data.generators).forEach(type => {
                    if (this.generators[type]) {
                        this.generators[type].count = data.generators[type].count || 0;
                        this.generators[type].cost = data.generators[type].cost || this.generators[type].cost;
                    }
                });
            }

            // Calculate offline progress
            if (data.lastSave) {
                const offlineTime = (Date.now() - data.lastSave) / 1000;
                this.updateStats();
                const offlineEarnings = this.income * Math.min(offlineTime, 3600); // Cap at 1 hour
                this.money += offlineEarnings;
            }

            this.updateStats();
        } catch (e) {
            console.error('Failed to load save:', e);
        }
    }

    startAutoSave() {
        setInterval(() => {
            this.saveGame();
        }, 5000);
    }

    setupEventListeners() {
        Object.keys(this.generators).forEach(type => {
            const btn = document.getElementById(`${type}-btn`);
            btn.addEventListener('click', () => {
                this.buyGenerator(type);
            });
        });

        document.getElementById('prestige-btn').addEventListener('click', () => {
            if (this.canPrestige()) {
                this.showPrestigeModal();
            }
        });

        document.getElementById('prestige-cancel').addEventListener('click', () => {
            this.hidePrestigeModal();
        });

        document.getElementById('prestige-confirm').addEventListener('click', () => {
            this.doPrestige();
        });
    }

    buyGenerator(type) {
        const gen = this.generators[type];
        if (this.money >= gen.cost) {
            this.money -= gen.cost;
            gen.count++;
            gen.cost = Math.floor(gen.cost * 1.15);
            this.updateStats();
            this.updateUI();
            this.saveGame();
        }
    }

    updateStats() {
        this.generation = 0;
        this.income = 0;

        Object.values(this.generators).forEach(gen => {
            this.generation += gen.count * gen.power * this.prestigeMultiplier;
            this.income += gen.count * gen.income * this.prestigeMultiplier;
        });

        this.demand = 50 + Math.floor(this.generation * 0.8);
    }

    tick(deltaTime) {
        const dt = deltaTime / 1000;
        const earned = this.income * dt;
        this.money += earned;
        this.totalMoneyEarned += earned;
        this.updateUI();
    }

    formatNumber(num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return Math.floor(num).toString();
    }

    updateUI() {
        document.getElementById('money').textContent = this.formatNumber(this.money);
        document.getElementById('generation').textContent = this.formatNumber(this.generation);
        document.getElementById('demand').textContent = this.formatNumber(this.demand);
        document.getElementById('income').textContent = '+' + this.formatNumber(this.income);
        document.getElementById('prestige-count').textContent = this.prestigeLevel;
        document.getElementById('prestige-multiplier').textContent = this.prestigeMultiplier.toFixed(1);

        const prestigeBtn = document.getElementById('prestige-btn');
        if (this.canPrestige()) {
            prestigeBtn.classList.add('available');
        } else {
            prestigeBtn.classList.remove('available');
        }

        Object.keys(this.generators).forEach(type => {
            const gen = this.generators[type];
            document.getElementById(`${type}-count`).textContent = gen.count;
            const btn = document.getElementById(`${type}-btn`);
            const priceEl = btn.querySelector('.btn-price');
            priceEl.textContent = this.formatNumber(gen.cost);

            if (this.money < gen.cost) {
                btn.disabled = true;
                btn.classList.remove('affordable');
            } else {
                btn.disabled = false;
                btn.classList.add('affordable');
            }
        });
    }

    startGameLoop() {
        let lastTime = performance.now();

        const loop = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            this.tick(deltaTime);
            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }
}

new PowerPlant();