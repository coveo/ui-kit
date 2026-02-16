// biome-ignore lint/style/useImportType: <>
import {
  type AfterViewInit,
  Component,
  Input,
  NgZone,
  ViewChild,
} from '@angular/core';
// biome-ignore lint/style/useImportType: <>
import {AtomicText} from '@coveo/atomic-angular';

@Component({
  standalone: false,
  selector: 'app-field-label',
  templateUrl: './field-label.component.html',
})
export class FieldLabelComponent implements AfterViewInit {
  @ViewChild('atomictext') atomicText?: AtomicText;

  constructor(private z: NgZone) {}

  private val = '';
  @Input()
  get label(): string {
    if (this.atomicText) {
      this.val = this.atomicTextValueAttribute;
    }
    return this.val;
  }
  set label(v: string) {
    this.val = v;
    this.atomicTextValueAttribute = this.val;
  }

  ngAfterViewInit(): void {
    this.atomicTextValueAttribute = this.val;
  }

  private get atomicTextValueAttribute() {
    if (!this.atomicText) {
      return '';
    }
    // biome-ignore lint/complexity/useLiteralKeys: <>
    return this.atomicText['el'].getAttribute('value') as string;
  }

  private set atomicTextValueAttribute(v: string) {
    if (!this.atomicText) {
      return;
    }
    this.z.runOutsideAngular(() => {
      // biome-ignore lint/complexity/useLiteralKeys: <>
      this.atomicText!['el'].setAttribute('value', v);
    });
  }
}
