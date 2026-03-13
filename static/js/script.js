
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
root.setAttribute('data-theme', savedTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

const observers = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in-up').forEach(el => observers.observe(el));

const tagline = "मन देखी मन सम्म";
const typeWriterElement = document.getElementById('typewriter-text');
let i = 0;

function typeWriter() {
    if (typeWriterElement && i < tagline.length) {
        typeWriterElement.innerHTML += tagline.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
    }
}
window.addEventListener('load', () => {
    if (typeWriterElement) {
        setTimeout(typeWriter, 500);
    }
});

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let points = [];
const spacing = 50;
let mouse = { x: -1000, y: -1000 };

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    points = [];
    for (let x = 0; x <= width + spacing; x += spacing) {
        for (let y = 0; y <= height + spacing; y += spacing) {
            points.push({ ox: x, oy: y, x: x, y: y });
        }
    }
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('touchmove', (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
}, {passive: true});
window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

function animate() {
    ctx.clearRect(0, 0, width, height);

    const isDark = root.getAttribute('data-theme') === 'dark';
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';
    ctx.lineWidth = 1;

    for (let point of points) {
        const dx = mouse.x - point.ox;
        const dy = mouse.y - point.oy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const warpRadius = 150;
        if (dist < warpRadius) {
            const force = (warpRadius - dist) / warpRadius;
            point.x = point.ox - dx * force * 0.5;
            point.y = point.oy - dy * force * 0.5;
        } else {
            point.x += (point.ox - point.x) * 0.1;
            point.y += (point.oy - point.y) * 0.1;
        }
    }

    ctx.beginPath();

    let cols = Math.floor(width / spacing) + 2;
    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (i + 1 < points.length && (i + 1) % cols !== 0) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(points[i+1].x, points[i+1].y);
        }
        if (i + cols < points.length) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(points[i+cols].x, points[i+cols].y);
        }
    }
    ctx.stroke();

    requestAnimationFrame(animate);
}
animate();

const orderForm = document.getElementById('order-form');
if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = orderForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Creating Order...';
        btn.disabled = true;

        const formData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            product: document.getElementById('product').value,
            message: document.getElementById('message').value
        };

        try {
            const response = await fetch('/api/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Order received successfully! We will contact you soon.');
                orderForm.reset();
            } else {
                alert('Something went wrong. Please try again.');
            }
        } catch (error) {
            alert('Error connecting to the server.');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}
