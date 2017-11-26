// Confetti Canvas Animation:
function pageConfetti() {

    $('body').append([
        '<canvas id="canvas" ',
        'style="background: transparent;position: fixed;left: 0;',
        'top: 0;right: 0;bottom: 0;width: 100%;height: 100%;z-index: -1;"',
        ' width="1280" height="514">',
        '</canvas>'].join(''));

    var COLORS = [
            [85, 71, 106],
            [174, 61, 99],
            [219, 56, 83],
            [244, 92, 68],
            [248, 182, 70]
        ],
        TYPE = ['CIRCLE', 'CIRCLE', 'CIRCLE', 'CIRCLE', 'CIRCLE', 'TRIANGLE', 'TRIANGLE'],
        NUM_CONFETTI = 200,
        PI_2 = 2 * Math.PI,
        RANDOM_POINTS, confettiObjects = [],
        canvas = document.getElementById('canvas'),
        context = canvas.getContext("2d"),
        resizeWindow, requestAnimationFrame,
        requestAnimationFrame_ID, range, mousePosX,
        randomPointsGenerator,
        w = 0,
        h = 0;

    // Helpers:
    range = function(a, b) {
        return ~~((b - a) * Math.random() + a);
    };
    requestAnimationFrame = window.requestAnimationFrame ||
                            window.webkitRequestAnimationFrame ||
                            window.mozRequestAnimationFrame ||
                            window.msRequestAnimationFrame ||
                            window.oRequestAnimationFrame ||
                            function(callback) {
                                return setTimeout(callback, 1);
                            };
    randomPointsGenerator = function() {
        var x = range(0, w),
            y = range(0, h),
            res = [],
            i = 0,
            calcDist, minDist = 10;
        res.push([x, y]);
        while (i < NUM_CONFETTI) {
            x = range(0, w);
            y = range(0, h);
            res.push([x, y]);
            i++;
        }
        return res;
    };

    // Confetti Class/Prototype function:
    function Confetti(x, y) {
        this.style = COLORS[range(0, 5)]; // select a color randomly
        this.type = TYPE[range(0, 7)]; // select a type randomly
        this.radius = range(1, 5); // radius selected randomly between 2px and 5px (inclusive)
        this.x = x;
        this.y = y;

        if (this.type === 'TRIANGLE') {
            this.height = this.radius * range(2, 4);
            this.xDsplt = this.height / Math.tan(Math.PI / range(2, 4));
            var oneThirdHeight = ~~(this.height / 3);
            this.heightChangeLeft = range(-oneThirdHeight, oneThirdHeight);
            this.heightChangeRight = range(-oneThirdHeight, oneThirdHeight);
        }

        this.opacity = range(0, 11) * 0.1;
        this.opacitySpeedStep = range(1, 8) * 0.005;
        this.fadeUpDown = range(0, 2); // between 0 and 1 (inclusive);
        this.speed = range(1, 6); // speed in between 1 and 3 (inclusive)
    }
    Confetti.prototype.drawConfetti = function() {
        if (this.type === 'CIRCLE') {
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, PI_2, false);
            context.fillStyle = 'rgba(' + this.style[0] + ', ' + this.style[1] + ', ' + this.style[2] + ', ' + this.opacity + ')';
            context.fill();
        } else if (this.type === 'TRIANGLE') {
            context.beginPath();
            context.moveTo(this.x, this.y);
            context.lineTo(this.x - this.xDsplt, this.y + this.height + this.heightChangeLeft);
            context.lineTo(this.x + this.xDsplt, this.y + this.height + this.heightChangeRight);
            context.fillStyle = 'rgba(' + this.style[0] + ', ' + this.style[1] + ', ' + this.style[2] + ', ' + this.opacity + ')';
            context.fill();
        }
    }

    // Mousemove capture mouse location(L, M, or R?):
    window.onmousemove = function(e) {
        mousePosX = e.pageX;
    };
    // canvas.onmousemove = function(e) {
    //     mousePosX = e.pageX - this.offsetLeft;
    // };

    // OnLoad & Resize Handler:
    resizeWindow = function() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        mousePosX = w / 2;

        // Remove all previous drawings & animations(start afresh):
        RANDOM_POINTS = randomPointsGenerator();
        window.cancelAnimationFrame && cancelAnimationFrame(requestAnimationFrame_ID);
        confettiObjects = [];
        context.clearRect(0, 0, w, h);

        // Initiate the Creation and Animation of confetti:
        createAndAnimateConfetti();
    };
    window.addEventListener('resize', resizeWindow, false);
    window.onload = function() {
        return setTimeout(resizeWindow, 0);
    };

    // Create a confetti for each random point and Animate[INITIALIZATION]:
    function createAndAnimateConfetti() {
        RANDOM_POINTS.forEach(function(point, index) {
            var xCoord = point[0],
                yCoord = point[1];
            confettiObjects.push(new Confetti(xCoord, yCoord));
        });
        confettiObjects.forEach(function(confObj, index) {
            confObj.drawConfetti();
        });

        var animate = function(duration) {
            var step = function() {
                // Update the square's property
                context.clearRect(0, 0, w, h);
                confettiObjects.forEach(function(confObj, index) {
                    if (confObj.type === 'CIRCLE' || confObj.type === 'TRIANGLE') {
                        confettiPositionChange(confObj);
                    }
                    confettiOpacity(confObj);
                    confObj.drawConfetti();
                });
                requestAnimationFrame_ID = requestAnimationFrame(step);
            };
            // Start the animation:
            step();
        };
        animate(1000);
    }

    // Confetti Positioning, Coloring, and Opacity Helper Functions:
    var confettiPositionChange = function(confObj) {
        confObj.y += confObj.speed;
        if (mousePosX < w / 3) {
            confObj.x -= confObj.speed;
        } else if (mousePosX > (2 * w) / 3) {
            confObj.x += confObj.speed;
        }
        if (confObj.y > h) confObj.y = 0;
        if (confObj.x > w) confObj.x = 0;
        if (confObj.x < 0) confObj.x = w;
    };
    var confettiOpacity = function(confObj) {
        if (confObj.fadeUpDown) confObj.opacity += confObj.opacitySpeedStep;
        else confObj.opacity -= confObj.opacitySpeedStep;

        if (confObj.opacity < -0.5) { // keep faded for longer than just less than 0
            confObj.style = COLORS[range(0, 5)]; // replace color randomly
            confObj.fadeUpDown = 1;
        } else if (confObj.opacity > 1) {
            confObj.fadeUpDown = 0;
        }
    };
}