function newElement(tagname, className) {
    const elem = document.createElement(tagname);
    elem.classList.add(className);
    return elem;
}

function Barrier(reverse = false) {
    this.element = newElement('div', 'barrier');

    const edge = newElement('div', 'edge');
    const corps = newElement('div', 'corps');
    this.element.appendChild(reverse ? corps : edge); 
    this.element.appendChild(reverse ? edge : corps);

    this.setStature = stature => corps.style.height = `${stature}px`;
}

// const r = new Barrier();
// r.setStature(200);
// document.querySelector('[wm-flappy]').appendChild(r.element); 

function PairOfBarriers(stature , opening, x) {
    this.element = newElement('div', 'par-barrier');

    this.superior = new Barrier(true);
    this.inferior = new Barrier(false);

    this.element.appendChild(this.superior.element);
    this.element.appendChild(this.inferior.element);

    this.drawOpening = () => { 
        const statureSuperior = Math.random() * (stature - opening);
        const statureInferior = stature - opening - statureSuperior;
        this.superior.setStature(statureSuperior);
        this.inferior.setStature(statureInferior);
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0]);
    this.setX = x => this.element.style.left = `${x}px`;
    this.getBreadth = () => this.element.clientWidth;

    this.drawOpening();
    this.setX(x);
}

// const r = new PairOfBarriers(480, 200, 400);
// document.querySelector('[wm-flappy]').appendChild(r.element);

function Barriers(stature, breadth, opening, space, notifyPoint) {
    this.pairs = [
        new PairOfBarriers(stature, opening, breadth),
        new PairOfBarriers(stature, opening, breadth + space),
        new PairOfBarriers(stature, opening, breadth + space * 2),
        new PairOfBarriers(stature, opening, breadth + space * 3)
    ];

    const displacement = 4;
    this.livenUp = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement);

            // Quando o elemento sair da área do jogo
            if(pair.getX() < -pair.getBreadth()) {
                pair.setX(pair.getX() + space * this.pairs.length);
                pair.drawOpening();
            };

            const middle = breadth / 2;
            const crossedMiddle = pair.getX() + displacement >= middle
                && pair.getX() < middle;
            if(crossedMiddle) notifyPoint();
        });
    };
};

function Bird(statureGame)  {
    let flying = false;

    this.element = newElement('img', 'bird');
    this.element.src = 'imgs/passaro.png';

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0]);
    this.setY = y => this.element.style.bottom = `${y}px`;

    window.onkeydown = e => flying = true;
    window.onkeyup = e => flying = false;
    this.livenUp = () => {
        const newY = this.getY() + (flying ? 8 : -5);
        const statureMax = statureGame - this.element.clientHeight;

        // Para não passar da altura definida
        if(newY <= 0) {
            this.setY(0);
        } else if(newY >= statureMax) {
            this.setY(statureMax);
        } else {
            this.setY(newY);
        }
    }

    this.setY(statureGame / 2);
}

// const barriers = new Barriers(490, 1100, 200, 400);
// const bird = new Bird(490);
// const playarea = document.querySelector('[wm-flappy]');
// playarea.appendChild(bird.element);
// playarea.appendChild(new Progress().element);
// barriers.pairs.forEach(pair => playarea.appendChild(pair.element));
// setInterval(() => {
//     barriers.livenUp();
//     bird.livenUp();
// }, 20);

function Progress() {
    this.element = newElement('span', 'progress');
    this.updatePoints = points => {
        this.element.innerHTML = points;
    };
    this.updatePoints(0);
};

function areSuperimposed(elementA, elementB) {
    const a = elementA.getBoundingClientRect();
    const b = elementB.getBoundingClientRect();
    
    const horizontal = a.left + a.width >= b.left 
        && b.left + b.width >= a.left;
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top;
    return horizontal && vertical;
};

function collide(bird, barriers) {
    let collide = false;
    barriers.pairs.forEach(pairOfBarriers => {
        if(!collide) {
            const superior = pairOfBarriers.superior.element;
            const inferior = pairOfBarriers.inferior.element;
            collide = areSuperimposed(bird.element, superior)
                || areSuperimposed(bird.element, inferior);
        }
    });
    return collide;
};

function FlappyBird() {
    let points = 0;

    const playarea = document.querySelector('[wm-flappy]');
    const stature = playarea.clientHeight;
    const breadth = playarea.clientWidth;

    const progress = new Progress();
    const barriers = new Barriers(stature, breadth, 210, 400,
        () => progress.updatePoints(++points));
    const bird = new Bird(stature);

    playarea.appendChild(progress.element);
    playarea.appendChild(bird.element);
    barriers.pairs.forEach(pair => playarea.appendChild(pair.element));

    this.start = () => {
        // loop do jogo
        const timer = setInterval(() => {
            barriers.livenUp();
            bird.livenUp();

            if(collide(bird, barriers)) {
                clearInterval(timer);
            };
        }, 20);
    };
};

new FlappyBird().start();