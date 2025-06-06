# Qayham Bottom Sheet Component

The `QayhamBottomsheetComponent` is an Angular component that provides a customizable bottom sheet interface. It allows users to display content in a modal-like fashion, with drag-and-drop functionality for better user experience.

## Installation

To use the `QayhamBottomsheetComponent` in your Angular project, follow these steps:

1. **Install the library**
   ```bash
   npm i qayham-bottomsheet
   ```

## Component Properties

- **`open: boolean`** (Input): Controls the visibility of the bottom sheet. Set it to `true` to open the sheet and `false` to close it.

## Component Events

- **`closed: EventEmitter<void>`** (Output): Emits an event when the bottom sheet is closed. You can listen to this event to perform any actions after the sheet is closed.

## Example Component

Here’s an example of how to use the `QayhamBottomsheetComponent` in a parent component:

```typescript
import { QayhamBottomsheetComponent } from 'qayham-bottomsheet';
@Component({
  selector: 'app-example',
  import:[QayhamBottomsheetComponent]
  template: `
   <button (click)="isBottomSheetOpen = true">Open Bottom Sheet</button>
<qayham-bottomsheet [open]="isBottomSheetOpen" (closed)="onBottomSheetClosed()">
    <div>
        <!-- Your content goes here -->
        <h2>Bottom Sheet Content</h2>
        <p>This is an example of content inside the bottom sheet.</p>
    </div>
</qayham-bottomsheet>
  `
})
export class ExampleComponent {
  isBottomSheetOpen = false;

  toggleBottomSheet() {
    this.isBottomSheetOpen = !this.isBottomSheetOpen;
  }

  onBottomSheetClosed() {
    console.log('Bottom sheet closed');
  }
}
```
