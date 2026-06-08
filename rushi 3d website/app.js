document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Disable scroll during load
  document.body.classList.add("loading");

  // ==========================================================================
  // LOADER SEQUENCE (GREETING ONLY)
  // ==========================================================================
  const greetingScreen = document.getElementById("greeting-screen");
  const mainNav = document.getElementById("main-nav");

  // Greeting word sequence
  const greets = ["greet-1", "greet-2", "greet-3"];
  let greetIndex = 0;

  function showNextGreeting() {
    if (greetIndex > 0) {
      document.getElementById(greets[greetIndex - 1]).classList.remove("active");
    }
    
    if (greetIndex < greets.length) {
      const currentGreet = document.getElementById(greets[greetIndex]);
      currentGreet.classList.add("active");
      greetIndex++;
      setTimeout(showNextGreeting, 900); // Show each for 900ms
    } else {
      // Trigger GSAP Hero Animations immediately while the screen is still solid black
      // to avoid the unstyled flash / flicker effect.
      triggerHeroAnimations();

      // Fade out greeting screen
      greetingScreen.classList.add("fade-out");
      
      setTimeout(() => {
        greetingScreen.classList.remove("active");
        document.body.classList.remove("loading");
        
        // Show navbar
        if (mainNav) {
          mainNav.classList.add("navbar-visible");
        }
      }, 800);
    }
  }

  // Start sequence
  setTimeout(showNextGreeting, 400);


  // ==========================================================================
  // GSAP ENTRANCE ANIMATIONS
  // ==========================================================================
  function triggerHeroAnimations() {
    if (typeof gsap !== "undefined") {
      // Register scroll trigger
      if (gsap.registerPlugin && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
      }

      // Hero Elements Stagger
      gsap.from(".reveal", {
        opacity: 0,
        y: 40,
        duration: 1.2,
        stagger: 0.15,
        ease: "power4.out"
      });

      // Hero Avatar Card Float-in
      gsap.from(".avatar-spatial-card", {
        opacity: 0,
        scale: 0.85,
        rotateY: -15,
        rotateX: 10,
        duration: 1.5,
        ease: "power3.out",
        delay: 0.3
      });

      // Floating badges pop
      gsap.from(".floating-element", {
        opacity: 0,
        scale: 0,
        duration: 1,
        stagger: 0.2,
        ease: "elastic.out(1, 0.5)",
        delay: 0.8
      });

      // Section animations: Skills
      gsap.from(".skills-section .skill-category-card", {
        scrollTrigger: {
          trigger: ".skills-section",
          start: "top 80%"
        },
        opacity: 0,
        y: 60,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      });

      // Section animations: Projects
      gsap.from(".projects-section .project-spatial-card", {
        scrollTrigger: {
          trigger: ".projects-section",
          start: "top 80%"
        },
        opacity: 0,
        y: 60,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      });

      // Section animations: Certifications
      gsap.from(".certifications-section .cert-card", {
        scrollTrigger: {
          trigger: ".certifications-section",
          start: "top 85%"
        },
        opacity: 0,
        scale: 0.9,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
      });

      // Section animations: Contact
      gsap.from(".contact-section .glass-card", {
        scrollTrigger: {
          trigger: ".contact-section",
          start: "top 80%"
        },
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      });
    }
  }


  // ==========================================================================
  // SPATIAL 3D MOUSE-MOVE TILT INTERACTION
  // ==========================================================================
  const tiltElements = document.querySelectorAll(".spatial-tilt, #hero-avatar-card");
  
  tiltElements.forEach(element => {
    element.addEventListener("mousemove", (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within element
      const y = e.clientY - rect.top;  // y position within element
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate normalized mouse positions (-1 to 1)
      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;
      
      // Tilt configurations
      const maxTilt = 12; // Max rotation degrees
      const tiltX = percentX * maxTilt;
      const tiltY = -percentY * maxTilt; // Inverse Y to tilt towards mouse
      
      // Apply transform with transition reset to keep responsive
      element.style.transition = "transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)";
      element.style.transform = `rotateY(${tiltX}deg) rotateX(${tiltY}deg) translateZ(15px)`;
      
      // Apply dynamic inner element drift if exists
      const innerContent = element.querySelector(".avatar-card-content, .category-header, .project-header");
      if (innerContent) {
        innerContent.style.transform = `translateZ(25px)`;
      }
    });

    element.addEventListener("mouseleave", () => {
      // Re-apply smooth return transform
      element.style.transition = "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)";
      element.style.transform = "rotateY(0deg) rotateX(0deg) translateZ(0px)";
      
      const innerContent = element.querySelector(".avatar-card-content, .category-header, .project-header");
      if (innerContent) {
        innerContent.style.transform = "translateZ(0px)";
      }
    });
  });


  // ==========================================================================
  // THREE.JS STAR FIELD PARTICLE BACKGROUND
  // ==========================================================================
  let scene, camera, renderer, starParticles;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  
  // Track mouse coordinates globally for drift
  window.addEventListener("mousemove", (e) => {
    targetX = (e.clientX - window.innerWidth / 2) * 0.05;
    targetY = (e.clientY - window.innerHeight / 2) * 0.05;
  });

  function initThree() {
    const canvas = document.getElementById("webgl-canvas");
    if (!canvas || typeof THREE === "undefined") return;

    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 200;

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true, // Transparent bg to let CSS radial gradient shine through
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle geometries
    const particleCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const amberColor = new THREE.Color(0xff8c00);
    const goldColor = new THREE.Color(0xffb900);

    for (let i = 0; i < particleCount * 3; i += 3) {
      // Coordinates random distribution in spherical shape
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const dist = 100 + Math.random() * 400;

      positions[i] = dist * Math.sin(phi) * Math.cos(theta);
      positions[i+1] = dist * Math.sin(phi) * Math.sin(theta);
      positions[i+2] = dist * Math.cos(phi) - 100; // cluster backward

      // Mix colors (Amber and Gold)
      const mixedColor = new THREE.Color().lerpColors(amberColor, goldColor, Math.random());
      colors[i] = mixedColor.r;
      colors[i+1] = mixedColor.g;
      colors[i+2] = mixedColor.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Particle texture creator (glowing round particles)
    const pTexture = createParticleTexture();

    const material = new THREE.PointsMaterial({
      size: 3,
      map: pTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });

    starParticles = new THREE.Points(geometry, material);
    scene.add(starParticles);

    animate();
  }

  // Custom texture generation (draws circle with soft blurred edges)
  function createParticleTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    
    // Draw soft gradient circle
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(0.3, "rgba(255, 255, 255, 0.8)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  function animate() {
    requestAnimationFrame(animate);

    // Dynamic rotation
    if (starParticles) {
      starParticles.rotation.y += 0.0006;
      starParticles.rotation.x += 0.0003;
      
      // Interpolate mouse movements for a lazy smooth drift (Ease out)
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      
      starParticles.position.x = currentX * 0.5;
      starParticles.position.y = -currentY * 0.5;
    }

    renderer.render(scene, camera);
  }

  // Handle resizing
  window.addEventListener("resize", () => {
    if (!camera || !renderer) return;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // Start WebGL Background initialization
  initThree();


  // ==========================================================================
  // NAVIGATION ACTIVE STATES ON SCROLL
  // ==========================================================================
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-menu .nav-link");

  window.addEventListener("scroll", () => {
    let scrollY = window.pageYOffset;
    
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 150;
      const sectionId = current.getAttribute("id");
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          }
        });
      }
    });
  });
});
