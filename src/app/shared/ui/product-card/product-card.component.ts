import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { Product } from '../../data-access/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, MatIconModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly priority = input<boolean>(false);
  readonly favoriteClick = output<Product>();

  readonly reviewsCount = computed(() => {
    const p = this.product();
    return p.reviews?.length ?? Math.round(p.rating * 200 + 50);
  });

  readonly hasDiscount = computed(() => (this.product().discountPercentage ?? 0) > 0);
  readonly isWowPrice = computed(() => (this.product().discountPercentage ?? 0) >= 40);

  readonly originalPrice = computed(() => {
    const p = this.product();
    if (p.discountPercentage) {
      return Math.round(p.price / (1 - p.discountPercentage / 100));
    }
    return p.price;
  });

  onFavoriteClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoriteClick.emit(this.product());
  }
}
