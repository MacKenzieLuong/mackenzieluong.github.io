// 3D Model and Interaction handling
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';

class RabbitViewer {
    constructor(container) {
        this.container = container;
        this.mouse = new THREE.Vector2();
        this.target = new THREE.Vector2();
        this.windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);

        this.init();
        this.setupModel();
        this.addEventListeners();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.camera.position.z = 5;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 1, 1);
        this.scene.add(directionalLight);
    }

    setupModel() {
        // Create a placeholder geometry if model fails to load
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0x5075ff });
        this.rabbit = new THREE.Mesh(geometry, material);
        this.scene.add(this.rabbit);
        
        // Try to load the actual model
        const loader = new GLTFLoader();
        loader.load(
            'models/Hamster.glb',
            (gltf) => {
                console.log('Hamster model loaded successfully!');
                // Remove placeholder
                this.scene.remove(this.rabbit);
                
                this.rabbit = gltf.scene;
                this.scene.add(this.rabbit);
                
                // Center the model
                const box = new THREE.Box3().setFromObject(this.rabbit);
                const center = box.getCenter(new THREE.Vector3());
                this.rabbit.position.sub(center);
                
                // Scale the model appropriately - made larger
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 4 / maxDim; // Doubled the size from 2 to 4
                this.rabbit.scale.multiplyScalar(scale);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('Error loading model:', error);
                console.log('Using placeholder cube - 3D model not found');
            }
        );
        
        this.animate();
    }

    addEventListeners() {
        document.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX - this.windowHalf.x);
            this.mouse.y = (event.clientY - this.windowHalf.y);
        });

        window.addEventListener('resize', () => {
            this.windowHalf.set(window.innerWidth / 2, window.innerHeight / 2);
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.rabbit) {
            // Smooth mouse movement
            this.target.x += (this.mouse.x - this.target.x) * 0.03;
            this.target.y += (this.mouse.y - this.target.y) * 0.03;

            // Rotate the rabbit based on mouse position
            this.rabbit.rotation.y = THREE.MathUtils.lerp(
                this.rabbit.rotation.y,
                (this.target.x / this.windowHalf.x) * 0.5,
                0.1
            );
            this.rabbit.rotation.x = THREE.MathUtils.lerp(
                this.rabbit.rotation.x,
                (this.target.y / this.windowHalf.y) * 0.2,
                0.1
            );
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize everything when the page loads
window.addEventListener('DOMContentLoaded', () => {
    // Initialize 3D viewer
    const container = document.querySelector('.model-container');
    if (container) {
        new RabbitViewer(container);
    }
    
    // Sidebar toggle functionality
    const sidebar = document.querySelector('.sidebar');
    const toggleButton = document.querySelector('.sidebar-toggle');
    
    if (toggleButton && sidebar) {
        toggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const isClickInside = sidebar.contains(e.target) || toggleButton.contains(e.target);
                if (!isClickInside && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                }
            }
        });
    }
});