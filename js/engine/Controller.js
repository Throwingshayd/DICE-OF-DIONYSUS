/**
 * Controller - Handles all input and interaction logic
 * Based on Balatro's controller system
 */
class Controller {
    constructor() {
        // Input state tracking
        this.clicked = { target: null, handled: true, prevTarget: null };
        this.focused = { target: null, handled: true, prevTarget: null };
        this.dragging = { target: null, handled: true, prevTarget: null };
        this.hovering = { target: null, handled: true, prevTarget: null };
        this.releasedOn = { target: null, handled: true, prevTarget: null };

        // Collision detection
        this.collisionList = [];
        this.cursorCollider = null;
        this.cursorPosition = { x: 0, y: 0 };

        // Mouse state
        this.cursorDown = { x: 0, y: 0, target: null, time: 0, handled: true };
        this.cursorUp = { x: 0, y: 0, target: null, time: 0.1, handled: true };
        this.cursorHover = { x: 0, y: 0, target: null, time: 0, handled: true };
        this.isCursorDown = false;

        // Key state tracking
        this.pressedKeys = {};
        this.heldKeys = {};
        this.heldKeyTimes = {};
        this.releasedKeys = {};

        // Button registry for callbacks
        this.buttonRegistry = {};

        // Cursor snapping
        this.snapCursorTo = null;
        this.cursorContext = {
            layer: 1,
            stack: []
        };

        // Controller locks
        this.locks = {};
        this.locked = null;

        // Interrupts
        this.interrupt = {
            focus: false
        };

        // Human Interface Device flags
        this.HID = {
            lastType: '',
            dpad: false,
            pointer: true,
            touch: false,
            controller: false,
            mouse: true,
            axisCursor: false
        };

        // Gamepad support
        this.gamepad = {
            object: null,
            mapping: null,
            name: null
        };

        // Initialize event listeners
        this.initializeEventListeners();
    }

    /**
     * Initialize DOM event listeners
     */
    initializeEventListeners() {
        // Mouse events
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('click', (e) => this.handleClick(e));

        // Touch events
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e));

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Prevent context menu
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /**
     * Handle mouse down event
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseDown(e) {
        this.isCursorDown = true;
        this.cursorDown.x = e.clientX;
        this.cursorDown.y = e.clientY;
        this.cursorDown.time = Date.now();
        this.cursorDown.handled = false;

        // Find target under cursor
        this.cursorDown.target = this.findTargetAtPosition(e.clientX, e.clientY);
        
        // Update collision list
        this.updateCollisionList(e.clientX, e.clientY);
    }

    /**
     * Handle mouse up event
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseUp(e) {
        this.isCursorDown = false;
        this.cursorUp.x = e.clientX;
        this.cursorUp.y = e.clientY;
        this.cursorUp.time = Date.now();
        this.cursorUp.handled = false;

        // Find target under cursor
        this.cursorUp.target = this.findTargetAtPosition(e.clientX, e.clientY);
        this.releasedOn.target = this.cursorUp.target;
        this.releasedOn.handled = false;

        // Handle drag end
        if (this.dragging.target) {
            this.handleDragEnd();
        }
    }

    /**
     * Handle mouse move event
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseMove(e) {
        this.cursorPosition.x = e.clientX;
        this.cursorPosition.y = e.clientY;

        // Update collision list
        this.updateCollisionList(e.clientX, e.clientY);

        // Handle dragging
        if (this.isCursorDown && this.cursorDown.target && !this.cursorDown.handled) {
            this.handleDragStart();
        }

        // Handle hover
        this.handleHover();
    }

    /**
     * Handle click event
     * @param {MouseEvent} e - Mouse event
     */
    handleClick(e) {
        const target = this.findTargetAtPosition(e.clientX, e.clientY);
        this.clicked.target = target;
        this.clicked.handled = false;

        // Trigger click callback if target has one
        if (target && target.onClick) {
            target.onClick(e);
        }
    }

    /**
     * Handle touch start event
     * @param {TouchEvent} e - Touch event
     */
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMouseDown({
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => {}
        });
    }

    /**
     * Handle touch end event
     * @param {TouchEvent} e - Touch event
     */
    handleTouchEnd(e) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        this.handleMouseUp({
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => {}
        });
    }

    /**
     * Handle touch move event
     * @param {TouchEvent} e - Touch event
     */
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMouseMove({
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => {}
        });
    }

    /**
     * Handle key down event
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
        const key = e.code || e.key;
        
        if (!this.pressedKeys[key]) {
            this.pressedKeys[key] = true;
            this.heldKeys[key] = true;
            this.heldKeyTimes[key] = Date.now();
        }

        // Trigger key callback if registered
        if (this.buttonRegistry[key]) {
            this.buttonRegistry[key](e);
        }
    }

    /**
     * Handle key up event
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyUp(e) {
        const key = e.code || e.key;
        
        this.releasedKeys[key] = true;
        this.heldKeys[key] = false;
        delete this.pressedKeys[key];
    }

    /**
     * Find target at position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object|null} Target object or null
     */
    findTargetAtPosition(x, y) {
        // Get all interactive elements
        const elements = document.querySelectorAll('[data-interactive="true"]');
        
        // Check elements in reverse order (top to bottom)
        for (let i = elements.length - 1; i >= 0; i--) {
            const element = elements[i];
            const rect = element.getBoundingClientRect();
            
            if (x >= rect.left && x <= rect.right && 
                y >= rect.top && y <= rect.bottom) {
                return element;
            }
        }
        
        return null;
    }

    /**
     * Update collision list
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    updateCollisionList(x, y) {
        this.collisionList = [];
        const elements = document.querySelectorAll('[data-interactive="true"]');
        
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && 
                y >= rect.top && y <= rect.bottom) {
                this.collisionList.push(element);
            }
        });
    }

    /**
     * Handle drag start
     */
    handleDragStart() {
        if (this.cursorDown.target && this.cursorDown.target.onDragStart) {
            this.dragging.target = this.cursorDown.target;
            this.dragging.handled = false;
            this.cursorDown.target.onDragStart(this.cursorDown);
        }
    }

    /**
     * Handle drag end
     */
    handleDragEnd() {
        if (this.dragging.target && this.dragging.target.onDragEnd) {
            this.dragging.target.onDragEnd(this.cursorUp);
        }
        this.dragging.target = null;
        this.dragging.handled = true;
    }

    /**
     * Handle hover
     */
    handleHover() {
        const target = this.findTargetAtPosition(this.cursorPosition.x, this.cursorPosition.y);
        
        if (target !== this.hovering.target) {
            // Exit previous hover
            if (this.hovering.target && this.hovering.target.onHoverExit) {
                this.hovering.target.onHoverExit();
            }
            
            // Enter new hover
            if (target && target.onHoverEnter) {
                target.onHoverEnter();
            }
            
            this.hovering.target = target;
            this.hovering.handled = false;
        }
    }

    /**
     * Register a button callback
     * @param {string} key - Key code
     * @param {Function} callback - Callback function
     */
    registerButton(key, callback) {
        this.buttonRegistry[key] = callback;
    }

    /**
     * Unregister a button callback
     * @param {string} key - Key code
     */
    unregisterButton(key) {
        delete this.buttonRegistry[key];
    }

    /**
     * Set cursor snap target
     * @param {Object} target - Target to snap to
     */
    snapTo(target) {
        this.snapCursorTo = target;
    }

    /**
     * Lock input
     * @param {string} lockName - Name of the lock
     */
    lock(lockName) {
        this.locks[lockName] = true;
    }

    /**
     * Unlock input
     * @param {string} lockName - Name of the lock
     */
    unlock(lockName) {
        delete this.locks[lockName];
    }

    /**
     * Check if input is locked
     * @param {string} lockName - Name of the lock
     * @returns {boolean} Whether input is locked
     */
    isLocked(lockName) {
        return this.locks[lockName] === true;
    }

    /**
     * Update controller state
     * @param {number} dt - Delta time
     */
    update(dt) {
        // Reset handled flags
        this.clicked.handled = true;
        this.focused.handled = true;
        this.dragging.handled = true;
        this.hovering.handled = true;
        this.releasedOn.handled = true;
        this.cursorDown.handled = true;
        this.cursorUp.handled = true;
        this.cursorHover.handled = true;

        // Clear released keys
        this.releasedKeys = {};

        // Handle cursor snapping
        if (this.snapCursorTo) {
            // Implement cursor snapping logic here
            this.snapCursorTo = null;
        }
    }

    /**
     * Get cursor position
     * @returns {Object} Cursor position
     */
    getCursorPosition() {
        return { ...this.cursorPosition };
    }

    /**
     * Check if key is pressed
     * @param {string} key - Key code
     * @returns {boolean} Whether key is pressed
     */
    isKeyPressed(key) {
        return this.pressedKeys[key] === true;
    }

    /**
     * Check if key is held
     * @param {string} key - Key code
     * @returns {boolean} Whether key is held
     */
    isKeyHeld(key) {
        return this.heldKeys[key] === true;
    }

    /**
     * Check if key was released
     * @param {string} key - Key code
     * @returns {boolean} Whether key was released
     */
    isKeyReleased(key) {
        return this.releasedKeys[key] === true;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Controller;
} else {
    window.Controller = Controller;
}

