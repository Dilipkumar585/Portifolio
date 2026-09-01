
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAu_g_pquHOWszZx88kHZXAlrOhOCebImY",
    authDomain: "dilip-portfolio-41d6d.firebaseapp.com",
    projectId: "dilip-portfolio-41d6d",
    storageBucket: "dilip-portfolio-41d6d.firebasestorage.app",
    messagingSenderId: "789421488084",
    appId: "1:789421488084:web:11f75e5ea30ac4e68dc841",
    measurementId: "G-ECZ21740DT"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

// EMAILJS
emailjs.init({
    publicKey: "rZYPW7_c_5NqKRvKf"
});

// TOGGLE SOCIAL ICONS

const toggleBtn = document.getElementById('toggleBtn');
const socialIcons = document.getElementById('socialIcons');

let opened = false;

toggleBtn.addEventListener('click', () => {

    if(opened === false){

        socialIcons.classList.add('active');
        toggleBtn.innerHTML = '×';
        opened = true;

    } else {

        socialIcons.classList.remove('active');
        toggleBtn.innerHTML = '+';
        opened = false;

    }

});



// CURSOR EFFECT

const cursor = document.querySelector('.cursor');
const cursorBlur = document.querySelector('.cursor-blur');

window.addEventListener('mousemove',(e)=>{

    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    cursorBlur.style.left = e.clientX + 'px';
    cursorBlur.style.top = e.clientY + 'px';

});

// SCROLL REVEAL

const observer = new IntersectionObserver((entries)=>{

    entries.forEach((entry)=>{

        if(entry.isIntersecting){
            entry.target.classList.add('show');
        }

    });

});

const hiddenElements = document.querySelectorAll('.card, .project-box');

hiddenElements.forEach((el)=> observer.observe(el));

// THREE JS 3D BACKGROUND

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
1000
);

const renderer = new THREE.WebGLRenderer({
alpha:true
});

renderer.setSize(window.innerWidth,window.innerHeight);

document.getElementById('bg-animation')
.appendChild(renderer.domElement);

const particlesGeometry = new THREE.BufferGeometry();

const particlesCount = 3000;

const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++){

    posArray[i] = (Math.random() - 0.5) * 15;

}

particlesGeometry.setAttribute(
'position',
new THREE.BufferAttribute(posArray,3)
);

const particlesMaterial = new THREE.PointsMaterial({
size:0.02,
color:'#2563eb'
});

const particlesMesh = new THREE.Points(
particlesGeometry,
particlesMaterial
);

scene.add(particlesMesh);

camera.position.z = 5;

function animate(){

    requestAnimationFrame(animate);

    particlesMesh.rotation.y += 0.0008;
    particlesMesh.rotation.x += 0.0003;

    renderer.render(scene,camera);

}

animate();

window.addEventListener('resize',()=>{

    renderer.setSize(window.innerWidth,window.innerHeight);

    camera.aspect =
    window.innerWidth/window.innerHeight;

    camera.updateProjectionMatrix();

});




const cards = document.querySelectorAll('.card, .project-box');

cards.forEach((card)=>{

    card.addEventListener('mousemove',(e)=>{

        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotateX = -(y - rect.height / 2) / 18;
        const rotateY = (x - rect.width / 2) / 18;

        card.style.transform =
        `perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateY(-10px)`;

    });

    card.addEventListener('mouseleave',()=>{

        card.style.transform =
        'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';

    });

});

const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav a');

window.addEventListener('scroll',()=>{

    let current = '';

    sections.forEach((section)=>{

        const sectionTop = section.offsetTop;

        if(pageYOffset >= sectionTop - 200){
            current = section.getAttribute('id');
        }

    });

    navLinks.forEach((link)=>{

        link.classList.remove('active');

        if(link.getAttribute('href') === '#' + current){
            link.classList.add('active');
        }

    });

});





// ===============================
// FIREBASE CONTACT FORM
// ===============================

const contactForm = document.getElementById("contactForm");

let lastSubmissionTime = 0;

if (contactForm) {

    contactForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        const messageInput = document.getElementById("message");
        const submitBtn = contactForm.querySelector("button");

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        // ===============================
        // VALIDATION
        // ===============================

        if (name.length < 2) {

            showFormMessage(
                "Please enter a valid name.",
                "error"
            );

            nameInput.focus();
            return;
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            showFormMessage(
                "Please enter a valid email address.",
                "error"
            );

            emailInput.focus();
            return;
        }

        if (message.length < 10) {

            showFormMessage(
                "Message must contain at least 10 characters.",
                "error"
            );

            messageInput.focus();
            return;
        }

        // ===============================
        // ANTI-SPAM
        // ===============================

        const now = Date.now();

        if (
            lastSubmissionTime !== 0 &&
            now - lastSubmissionTime < 30000
        ) {

            showFormMessage(
                "Please wait 30 seconds before sending another message.",
                "error"
            );

            return;
        }

        lastSubmissionTime = now;

        // ===============================
        // BUTTON LOADING
        // ===============================

        submitBtn.disabled = true;
        submitBtn.innerHTML = "Sending...";

        try {

            // ===============================
            // SAVE TO FIRESTORE
            // ===============================

            await addDoc(
                collection(db, "contactMessages"),
                {
                    name: name,
                    email: email,
                    message: message,
                    createdAt: serverTimestamp(),
                    status: "new"
                }
            );
// SEND EMAIL NOTIFICATION
await emailjs.send(
    "service_mm49zgb",
    "template_9stow0j",
    {
        name: name,
        email: email,
        message: message,
        time: new Date().toLocaleString()
    }
);
            // ===============================
            // SUCCESS
            // ===============================

            submitBtn.innerHTML = "Message Sent ✓";

            showFormMessage(
                "Your message has been sent successfully! Thank you.",
                "success"
            );

            contactForm.reset();

            // Reset character counter
            if (charCount) {
                charCount.textContent = "0 / 500";
            }

            // Restore button
            setTimeout(() => {

                submitBtn.disabled = false;
                submitBtn.innerHTML = "Send Message";

            }, 3000);

        } catch (error) {

            console.error("Firebase Error:", error);

            submitBtn.disabled = false;
            submitBtn.innerHTML = "Send Message";

            showFormMessage(
                "Something went wrong. Please try again.",
                "error"
            );
        }

    });

}


// ===============================
// FORM MESSAGE
// ===============================

function showFormMessage(text, type) {

    let messageBox =
        document.getElementById("formMessage");

    if (!messageBox) {

        messageBox = document.createElement("div");

        messageBox.id = "formMessage";

        contactForm.appendChild(messageBox);

    }

    messageBox.textContent = text;

    messageBox.className = type;

    messageBox.style.opacity = "1";

    setTimeout(() => {

        messageBox.style.opacity = "0";

    }, 4000);

}


// ===============================
// MESSAGE CHARACTER COUNTER
// ===============================

const messageInput =
    document.getElementById("message");

const charCount =
    document.getElementById("charCount");

if (messageInput && charCount) {

    messageInput.addEventListener("input", () => {

        const currentLength =
            messageInput.value.length;

        charCount.textContent =
            `${currentLength} / 500`;

    });

}


