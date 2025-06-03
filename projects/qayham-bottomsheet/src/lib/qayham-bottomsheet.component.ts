import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  Renderer2,
  AfterViewInit,
  OnChanges,
  Input,
  Output,
  EventEmitter,
  SimpleChange,
} from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'qayham-bottomsheet',
  template: `
    <div
      class="bottom-sheet-backdrop"
      [ngStyle]="open ? { display: 'block' } : { display: 'none' }"
      (click)="onBackdropClick()"
    ></div>
    <!-- bottom-sheet.component.html -->
    <div #sheet class="bottom-sheet">
      <!-- Drag Handle (for manual dragging outside the scrollable content) -->
      <div
        class="drag-handle"
        (touchstart)="onTouchStart($event)"
        (touchmove)="onTouchMove($event)"
        (touchend)="onTouchEnd($event)"
        (pointerdown)="onPointerDown($event)"
        (pointermove)="onPointerMove($event)"
        (pointerup)="onPointerUp($event)"
      ></div>

      <!-- Sheet Content -->
      <div
        #sheetContent
        class="sheet-content"
        (touchstart)="onContentTouchStart($event)"
        (touchmove)="onContentTouchMove($event)"
        (touchend)="onContentTouchEnd($event)"
      >
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      /* bottom-sheet.component.scss */
      .bottom-sheet {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        max-height: 50vh; /* Limit the sheet's overall height */
        background: var(--primary-color);
        color: var(--primary-text-color);
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
        display: flex;
        flex-direction: column;
        z-index: 1000;
      }
      .bottom-sheet-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent */
        z-index: 999; /* Ensure it's above other content */
        display: none; /* Initially hidden */
      }
      .bottom-sheet.open + .bottom-sheet-backdrop {
        display: block; /* Show only when bottom sheet is open */
      }
      .drag-handle {
        width: 50px;
        height: 6px;
        background: #ccc;
        border-radius: 3px;
        margin: 10px auto;
        cursor: grab;
        flex: 0 0 auto;
      }

      .sheet-content {
        flex: 1 1 auto;
        overflow-y: auto;
        padding: 15px;
        padding-bottom: 70px;
        -webkit-overflow-scrolling: touch; /* for smooth scrolling on iOS */
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule],
})
export class QayhamBottomsheetComponent implements AfterViewInit, OnChanges {
  @ViewChild('sheet', { static: true }) sheet!: ElementRef;
  @ViewChild('sheetContent', { static: true }) sheetContent!: ElementRef;
  // Reference to backdrop element
  @ViewChild('backdrop') backdrop!: ElementRef;
  // Input to control open state.
  @Input() open: boolean = false;
  // Output to signal when the sheet has closed.
  @Output() closed = new EventEmitter<void>();

  // --- Define Positions ---
  // Fully open position (0 means the sheet is fully expanded upward).
  private openTranslateY: number = 0;
  // Fully closed position (e.g. height of your sheet).
  private closedTranslateY: number = 600;
  // Drag threshold (in pixels) for snapping.
  private snapThreshold: number = 80;

  // Current translateY value.
  currentTranslateY: number = this.closedTranslateY;

  // Variables for tracking drag via the drag-handle.
  private startY: number = 0;
  private initialTranslateY: number = 500;
  private dragging: boolean = false;

  // Variables for tracking overscroll (drag on the content area).
  private contentDragStartY: number = 0;
  private contentDragging: boolean = false;

  constructor(private renderer: Renderer2, private router: Router) {
    // Subscribe to route change events.
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.open = false;

        // Immediately disable any transition to avoid the pop-up animation.
        this.renderer.setStyle(this.sheet.nativeElement, 'transition', 'none');
        // Force the sheet to be in closed state.
        this.currentTranslateY = this.closedTranslateY;
        this.renderer.setStyle(
          this.sheet.nativeElement,
          'transform',
          `translateY(${this.currentTranslateY}px)`
        );
        this.closed.emit();
      }
    });
  }
  // Method to handle backdrop click
  onBackdropClick() {
    this.open = false; // Close the sheet
    this.closed.emit(); // Emit closed event
  }

  ngAfterViewInit(): void {
    // Set the initial position based on the "open" input.
    this.updatePosition();
  }
  ngOnChanges(changes: { [propName: string]: SimpleChange }): void {
    // When the "open" input changes (after initialization), update the position.
    if (changes['open'] && !changes['open'].firstChange) {
      this.updatePosition();
    }
  }

  // Updates the sheet’s position based on the "open" flag.
  private updatePosition(): void {
    this.currentTranslateY = this.open
      ? this.openTranslateY
      : this.closedTranslateY;
    this.renderer.setStyle(
      this.sheet.nativeElement,
      'transform',
      `translateY(${this.currentTranslateY}px)`
    );
  }

  // --- Drag Methods for the Drag Handle ---

  onDragStart(clientY: number) {
    this.startY = clientY;
    this.initialTranslateY = this.currentTranslateY;
    this.dragging = true;
    // Remove any transition for immediate feedback.
    this.renderer.setStyle(this.sheet.nativeElement, 'transition', 'none');
  }

  onDragMove(clientY: number) {
    if (!this.dragging) {
      return;
    }
    const offset = clientY - this.startY;
    let newTranslate = this.initialTranslateY + offset;
    // Clamp the movement between fully open and fully closed.
    newTranslate = Math.max(
      this.openTranslateY,
      Math.min(newTranslate, this.closedTranslateY)
    );
    this.currentTranslateY = newTranslate;
    this.renderer.setStyle(
      this.sheet.nativeElement,
      'transform',
      `translateY(${this.currentTranslateY}px)`
    );
  }

  onDragEnd() {
    if (!this.dragging) {
      return;
    }
    this.dragging = false;
    // Restore transition for smooth snapping.
    this.renderer.setStyle(
      this.sheet.nativeElement,
      'transition',
      'transform 0.3s ease'
    );
    const dragOffset = this.currentTranslateY - this.initialTranslateY;
    if (dragOffset < 0 && Math.abs(dragOffset) > this.snapThreshold) {
      // Dragged upward sufficiently → snap open.
      this.currentTranslateY = this.openTranslateY;
    } else if (dragOffset > 0 && dragOffset > this.snapThreshold) {
      // Dragged downward sufficiently → snap closed.
      this.currentTranslateY = this.closedTranslateY;
      this.closed.emit();
    } else {
      // Not enough drag; revert to the original state.
      this.currentTranslateY = this.initialTranslateY;
    }
    this.renderer.setStyle(
      this.sheet.nativeElement,
      'transform',
      `translateY(${this.currentTranslateY}px)`
    );
  }

  // --- Touch & Pointer Event Handlers for the Drag Handle ---

  onTouchStart(event: TouchEvent) {
    if (event.touches.length > 0) {
      this.onDragStart(event.touches[0].clientY);
    }
  }
  onTouchMove(event: TouchEvent) {
    if (event.touches.length > 0) {
      // Prevent scrolling behind the sheet.
      event.preventDefault();
      this.onDragMove(event.touches[0].clientY);
    }
  }
  onTouchEnd(event: TouchEvent) {
    this.onDragEnd();
  }

  onPointerDown(event: PointerEvent) {
    this.onDragStart(event.clientY);
  }
  onPointerMove(event: PointerEvent) {
    if (this.dragging) {
      event.preventDefault();
      this.onDragMove(event.clientY);
    }
  }
  onPointerUp(event: PointerEvent) {
    this.onDragEnd();
  }

  // --- Content Touch Handlers for Overscroll (when content is scrolled to the top) ---

  onContentTouchStart(event: TouchEvent) {
    this.contentDragStartY = event.touches[0].clientY;
    // Only begin sheet dragging if the inner content is already at the top.
    if (this.sheetContent.nativeElement.scrollTop <= 0) {
      this.contentDragging = true;
      this.renderer.setStyle(this.sheet.nativeElement, 'transition', 'none');
    } else {
      this.contentDragging = false;
    }
  }

  onContentTouchMove(event: TouchEvent) {
    const currentY = event.touches[0].clientY;
    let offset = currentY - this.contentDragStartY;

    // If not already in sheet-drag mode but the content reaches the top mid-gesture,
    // then start dragging the sheet.
    if (
      !this.contentDragging &&
      this.sheetContent.nativeElement.scrollTop <= 0 &&
      offset > 0
    ) {
      this.contentDragging = true;
      // Reset the start point to avoid a jump.
      this.contentDragStartY = currentY;
      offset = 0;
      this.renderer.setStyle(this.sheet.nativeElement, 'transition', 'none');
    }
    // If we are dragging the sheet via content overscroll:
    if (this.contentDragging && offset > 0) {
      let newTranslate = this.openTranslateY + offset;
      if (newTranslate > this.closedTranslateY) {
        newTranslate = this.closedTranslateY;
      }
      this.currentTranslateY = newTranslate;
      this.renderer.setStyle(
        this.sheet.nativeElement,
        'transform',
        `translateY(${this.currentTranslateY}px)`
      );
      // Prevent the native scroll (bounce) behavior.
      event.preventDefault();
    }
  }

  onContentTouchEnd(event: TouchEvent) {
    if (!this.contentDragging) {
      return;
    }
    this.contentDragging = false;
    const dragOffset = this.currentTranslateY - this.openTranslateY;
    this.renderer.setStyle(
      this.sheet.nativeElement,
      'transition',
      'transform 0.3s ease'
    );
    if (dragOffset > this.snapThreshold) {
      // Sufficient overscroll → close the sheet.
      this.currentTranslateY = this.closedTranslateY;
      this.renderer.setStyle(
        this.sheet.nativeElement,
        'transform',
        `translateY(${this.currentTranslateY}px)`
      );
      this.closed.emit();
    } else {
      // Not enough drag; snap back open.
      this.currentTranslateY = this.openTranslateY;
      this.renderer.setStyle(
        this.sheet.nativeElement,
        'transform',
        `translateY(${this.currentTranslateY}px)`
      );
    }
  }
  // Method to toggle sheet state
  toggleSheet() {
    this.open = !this.open; // Toggle open state
    if (this.open) {
      this.renderer.addClass(document.body, 'no-scroll'); // Disable scrolling on body when bottom sheet is open
    } else {
      this.renderer.removeClass(document.body, 'no-scroll'); // Enable scrolling on body when bottom sheet is closed
    }
  }
}

export interface SimpleChanges {
  [propName: string]: SimpleChange;
}
