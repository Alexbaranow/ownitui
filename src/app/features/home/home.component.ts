import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ProductCardComponent } from '../../shared/ui/product-card/product-card.component';
import { Product } from '../../shared/data-access/product.model';
import { ProductsStoreService } from '../../shared/data-access/products-store.service';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  protected readonly store = inject(ProductsStoreService);

  readonly products = this.store.products;
  readonly loading = this.store.loading;
  readonly error = this.store.error;

  ngOnInit(): void {
    this.store.loadProducts();
  }

  loadProducts(): void {
    this.store.loadProducts(true);
  }

  onFavorite(_product: Product): void {
    // TODO: добавить в избранное через SidePanelService / favorites store
    console.log(_product);
  }
}
